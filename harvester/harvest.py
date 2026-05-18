"""openwinemap harvester.

Two sources:
  1. OpenStreetMap (per country, via Overpass) — wineries, vineyards,
     wine cellars, wine bars, wine shops. Geometries are preserved: nodes
     become Points, closed ways become Polygons, type=multipolygon
     relations become MultiPolygons (one outer ring per Polygon — we don't
     attempt to merge shared edges; that's a problem for the basemap, not
     for us). Coordinates are rounded to 5 decimal places (~1 m).
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


COORD_PRECISION = 5  # decimal degrees; 5 dp ~= 1.1 m at the equator


def _round_pair(p):
    return [round(p[0], COORD_PRECISION), round(p[1], COORD_PRECISION)]


def _ring_from_geometry(geom):
    """Overpass `out geom` returns geometry as `[{"lat":.., "lon":..}, ...]`.
    Convert to a list of [lon, lat] pairs. Empty / too-short lists are caller
    problems."""
    return [[g["lon"], g["lat"]] for g in geom]


def _close_ring(coords):
    if len(coords) >= 3 and coords[0] != coords[-1]:
        coords.append(coords[0])
    return coords


def _ring_area(ring):
    """Shoelace signed area in lon/lat space. Sign tells us winding; magnitude
    lets us drop degenerate slivers and reject sub-millimetre vineyards we
    pulled in by accident."""
    n = len(ring)
    if n < 4:
        return 0.0
    s = 0.0
    for i in range(n - 1):
        s += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
    return s / 2.0


def osm_geometry(el):
    """Convert one Overpass `out tags geom` element to a GeoJSON geometry.
    Returns None for shapes we can't render (open ways, empty relations)."""
    t = el["type"]
    if t == "node":
        lon = el.get("lon")
        lat = el.get("lat")
        if lon is None or lat is None:
            return None
        return {"type": "Point", "coordinates": _round_pair([lon, lat])}
    if t == "way":
        geom = el.get("geometry") or []
        if len(geom) < 2:
            return None
        coords = [_round_pair(p) for p in _ring_from_geometry(geom)]
        if coords[0] == coords[-1] and len(coords) >= 4:
            return {"type": "Polygon", "coordinates": [coords]}
        # Open way — for our wine query that's almost always a vineyard
        # boundary that wasn't closed by the mapper, OR a wine route. We
        # synthesize closure rather than drop it, since the OSM convention
        # for `landuse=*` is implicit closure.
        if len(coords) >= 3:
            return {"type": "Polygon", "coordinates": [_close_ring(coords)]}
        return None
    if t == "relation":
        # We treat each outer-role way as its own polygon. Real OSM
        # multipolygons can have shared edges across multiple way members;
        # assembling those is out of scope (boundary topology is the
        # basemap's job, not ours). Inner rings (holes) are dropped — for
        # vineyards they almost never matter.
        polys = []
        for m in el.get("members", []):
            if m.get("type") != "way":
                continue
            if m.get("role") not in ("outer", "", None):
                continue
            mg = m.get("geometry") or []
            if len(mg) < 3:
                continue
            coords = [_round_pair(p) for p in _ring_from_geometry(mg)]
            coords = _close_ring(coords)
            if len(coords) < 4:
                continue
            if abs(_ring_area(coords)) < 1e-10:
                continue
            polys.append([coords])
        if not polys:
            return None
        if len(polys) == 1:
            return {"type": "Polygon", "coordinates": polys[0]}
        return {"type": "MultiPolygon", "coordinates": polys}
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
    geometry = osm_geometry(el)
    if not geometry:
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
        "geometry": geometry,
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
