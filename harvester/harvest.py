"""openwinemap harvester.

Two sources:
  1. OpenStreetMap (per country, via Overpass) — wineries, vineyards,
     wine cellars, wine bars, wine shops. Polygons are reduced to centres.
     Output: data/countries/{CC}.geojson
  2. Wikidata (global) — wine regions, appellations, named vineyards, all
     reduced to a single point (P625 centroid). Output: data/regions.geojson

Each region carries its Wikidata QID, parent region QID, country code, image,
and an English Wikipedia URL when available. The frontend uses the QID at
click-time to fetch the region's description and any associated wine kinds
on demand from the Wikidata Action API.

A `data/manifest.json` describes both sets so the frontend can show counts
and freshness without parsing the GeoJSON. On per-country failure, the prior
country file is kept and the entry is marked `stale: true`. Same for the
regions file if every class query failed.
"""

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

from .countries import WINE_COUNTRIES
from .overpass import fetch as overpass_fetch
from .regions import WINE_REGION_CLASSES, harvest_regions, region_to_feature
from .tags import categorize

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
COUNTRY_DIR = DATA_DIR / "countries"

KEEP_TAGS = {
    "name", "name:en", "alt_name", "official_name",
    "craft", "industrial", "building", "landuse",
    "shop", "amenity", "cuisine", "tourism", "man_made",
    "wikidata", "wikipedia", "image", "website", "url",
    "opening_hours", "phone", "email", "operator", "brand",
    "addr:city", "addr:street", "addr:housenumber", "addr:postcode", "addr:country",
    "grape_variety", "grape_variety:en", "wine_type", "wine",
    "produce", "production", "wheelchair",
    "start_date", "end_date",
    "denomination",
}


def coords(el):
    if el["type"] == "node":
        return [el["lon"], el["lat"]]
    c = el.get("center")
    if c:
        return [c["lon"], c["lat"]]
    return None


def slim_tags(tags):
    return {k: v for k, v in tags.items() if k in KEEP_TAGS or k.startswith("name:")}


def to_feature(el):
    tags = el.get("tags") or {}
    if not tags:
        return None
    cat = categorize(tags)
    if cat == "other":
        return None
    # Vineyards without any identifying tag are noise (raw landuse polygons).
    # We accept unnamed wineries since craft=winery / industrial=winery is
    # itself the signal, but require a name or wikidata link for vineyards.
    if cat == "vineyard":
        if not (tags.get("name") or tags.get("wikidata") or tags.get("wikipedia")):
            return None
    lonlat = coords(el)
    if not lonlat:
        return None
    props = {
        "osm_type": el["type"],
        "osm_id": el["id"],
        "category": cat,
        "name": tags.get("name") or tags.get("name:en"),
        "wikidata": tags.get("wikidata"),
        "wikipedia": tags.get("wikipedia"),
        "tags": slim_tags(tags),
    }
    props = {k: v for k, v in props.items() if v not in (None, "")}
    return {
        "type": "Feature",
        "id": f"{el['type']}/{el['id']}",
        "geometry": {"type": "Point", "coordinates": lonlat},
        "properties": props,
    }


def load_existing(path):
    if not path.exists():
        return None
    try:
        with path.open("r", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return None


def harvest_country(cc):
    data = overpass_fetch(cc)
    features = []
    seen = set()
    for el in data.get("elements", []):
        f = to_feature(el)
        if not f:
            continue
        if f["id"] in seen:
            continue
        seen.add(f["id"])
        features.append(f)
    return features


def load_manifest():
    path = DATA_DIR / "manifest.json"
    if not path.exists():
        return {}
    try:
        with path.open("r", encoding="utf-8") as fh:
            m = json.load(fh)
        return {c["code"]: c for c in m.get("countries", []) if "code" in c}
    except Exception:
        return {}


def harvest_osm(manifest):
    only = os.environ.get("OWM_ONLY", "").strip()
    skip_osm = os.environ.get("OWM_SKIP_OSM", "").strip().lower() in ("1", "true", "yes")
    if skip_osm:
        print("OWM_SKIP_OSM set: keeping prior country data unchanged.", flush=True)
        prior = load_manifest()
        for cc, name in WINE_COUNTRIES:
            entry = prior.get(cc) or {"code": cc, "name": name, "file": f"countries/{cc}.geojson", "count": 0}
            manifest["countries"].append(entry)
        return

    selected = {c.strip().upper() for c in only.split(",") if c.strip()} if only else None
    prior = load_manifest()

    targets = WINE_COUNTRIES if not selected else [(cc, name) for cc, name in WINE_COUNTRIES if cc in selected]
    if selected:
        print(f"limited run: {sorted(selected)}", flush=True)

    targeted_codes = {cc for cc, _ in targets}

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")

    for cc, name in WINE_COUNTRIES:
        if cc not in targeted_codes:
            entry = prior.get(cc) or {"code": cc, "name": name, "file": f"countries/{cc}.geojson", "count": 0}
            manifest["countries"].append(entry)

    for i, (cc, name) in enumerate(targets):
        path = COUNTRY_DIR / f"{cc}.geojson"
        entry = {"code": cc, "name": name, "file": f"countries/{cc}.geojson"}
        print(f"[{i+1}/{len(targets)}] {cc} {name}...", flush=True)
        try:
            features = harvest_country(cc)
            fc = {"type": "FeatureCollection", "features": features}
            with path.open("w", encoding="utf-8") as fh:
                json.dump(fc, fh, ensure_ascii=False, separators=(",", ":"))
            entry["count"] = len(features)
            entry["updated_at"] = now
            print(f"    -> {len(features)} features", flush=True)
        except Exception as e:
            print(f"    !! FAILED: {e}", flush=True)
            existing = load_existing(path)
            if existing:
                entry["count"] = len(existing.get("features", []))
                entry["stale"] = True
            else:
                entry["count"] = 0
                entry["error"] = str(e)
        manifest["countries"].append(entry)
        if i < len(targets) - 1:
            time.sleep(8)

    order = [cc for cc, _ in WINE_COUNTRIES]
    manifest["countries"].sort(key=lambda c: order.index(c["code"]) if c["code"] in order else 999)


def harvest_wd_regions(manifest):
    skip = os.environ.get("OWM_SKIP_REGIONS", "").strip().lower() in ("1", "true", "yes")
    path = DATA_DIR / "regions.geojson"
    if skip:
        print("OWM_SKIP_REGIONS set: keeping prior regions.geojson unchanged.", flush=True)
        existing = load_existing(path)
        manifest["regions"] = {
            "file": "regions.geojson",
            "count": len(existing.get("features", [])) if existing else 0,
            "stale": True,
        }
        return

    print("Wikidata wine regions:", flush=True)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    try:
        regions, failed = harvest_regions()
    except Exception as e:
        print(f"    !! regions harvest crashed: {e!r}", flush=True)
        existing = load_existing(path)
        manifest["regions"] = {
            "file": "regions.geojson",
            "count": len(existing.get("features", [])) if existing else 0,
            "stale": True,
            "error": str(e),
        }
        return

    features = [region_to_feature(r) for r in regions.values()]
    fc = {"type": "FeatureCollection", "features": features}
    with path.open("w", encoding="utf-8") as fh:
        json.dump(fc, fh, ensure_ascii=False, separators=(",", ":"))
    entry = {
        "file": "regions.geojson",
        "count": len(features),
        "updated_at": now,
        "queried_classes": [name for name, _ in WINE_REGION_CLASSES],
    }
    if failed:
        entry["failed_classes"] = failed
        entry["partial"] = True
    manifest["regions"] = entry
    print(f"  -> {len(features)} regions", flush=True)


def main():
    COUNTRY_DIR.mkdir(parents=True, exist_ok=True)

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    manifest = {"generated_at": now, "countries": [], "regions": None}

    harvest_osm(manifest)
    harvest_wd_regions(manifest)

    with (DATA_DIR / "manifest.json").open("w", encoding="utf-8") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=2)
    print("done.", flush=True)


if __name__ == "__main__":
    main()
