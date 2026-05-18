"""Wine-region harvest from Wikidata.

We treat 'wine region' broadly: protected appellations (AOC / DOC / DOCG /
DOP / AVA), generic wine regions (Q19623897), wine-producing areas
(Q3839081 — French vineyard AOC, etc.), and individually-named vineyards
(Q39780) that have a Wikidata entry. Every feature is a point (centroid
P625) — polygon boundaries are out of scope for v1.

We query one class at a time because the WDQS subclass walk
(`wdt:P31/wdt:P279*`) on the broad classes can time out when chained with
optional joins. Per-class queries stay comfortably under the 60s limit.
"""

import time

from .wikidata import WdqsTimeout, parse_point, qid_from_uri, query, rows, val


WINE_REGION_CLASSES = [
    ("wine_region",          "Q19623897"),
    ("appellation",          "Q1755236"),
    ("viticultural_area",    "Q1471806"),
    ("ava",                  "Q1660525"),
    ("doc",                  "Q372145"),
    ("docg",                 "Q1542597"),
    ("pdo",                  "Q2334195"),
    ("pgi",                  "Q838948"),
    ("aoc",                  "Q3044918"),
    ("aoc_vineyard",         "Q3839081"),
    ("vineyard",             "Q39780"),
    ("wine_growing_estate",  "Q1758856"),
]


REGION_QUERY = """\
SELECT DISTINCT ?r ?rLabel ?coord ?cc ?image ?parent ?parentLabel ?article WHERE {
  ?r wdt:P31/wdt:P279* wd:%(class_qid)s .
  ?r wdt:P625 ?coord .
  OPTIONAL { ?r wdt:P17/wdt:P297 ?cc }
  OPTIONAL { ?r wdt:P18 ?image }
  OPTIONAL { ?r wdt:P361 ?parent }
  OPTIONAL {
    ?article schema:about ?r ;
             schema:isPartOf <https://en.wikipedia.org/> .
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,it,es,de,pt". }
}
"""


def https_url(url):
    if not url:
        return url
    if url.startswith("http://"):
        return "https://" + url[7:]
    return url


def harvest_class(class_name, class_qid):
    q = REGION_QUERY % {"class_qid": class_qid}
    r = query(q)
    by_qid = {}
    for b in rows(r):
        qid = qid_from_uri(val(b, "r"))
        if not qid:
            continue
        coord = parse_point(val(b, "coord"))
        if not coord:
            continue
        existing = by_qid.get(qid)
        if existing:
            existing["classes"].add(class_name)
            continue
        by_qid[qid] = {
            "qid": qid,
            "name": val(b, "rLabel"),
            "coord": coord,
            "cc": val(b, "cc"),
            "image": https_url(val(b, "image")),
            "parent_qid": qid_from_uri(val(b, "parent")),
            "parent_name": val(b, "parentLabel"),
            "wikipedia": val(b, "article"),
            "classes": {class_name},
        }
    return by_qid


def harvest_regions():
    all_regions = {}
    failed = []
    for class_name, class_qid in WINE_REGION_CLASSES:
        print(f"  region class: {class_name} ({class_qid})", flush=True)
        try:
            chunk = harvest_class(class_name, class_qid)
            new_count = 0
            for qid, region in chunk.items():
                cur = all_regions.get(qid)
                if cur:
                    cur["classes"].update(region["classes"])
                    for k in ("name", "cc", "image", "parent_qid", "parent_name", "wikipedia"):
                        if cur.get(k) in (None, "") and region.get(k) not in (None, ""):
                            cur[k] = region[k]
                else:
                    all_regions[qid] = region
                    new_count += 1
            print(f"    -> {len(chunk)} rows ({new_count} new)", flush=True)
        except WdqsTimeout:
            print(f"    !! timeout on {class_name}; keeping prior data", flush=True)
            failed.append(class_name)
        except Exception as e:
            print(f"    !! failed: {e!r}", flush=True)
            failed.append(class_name)
        time.sleep(2.5)
    return all_regions, failed


def region_to_feature(r):
    props = {
        "qid": r["qid"],
        "name": r.get("name") or r["qid"],
        "classes": sorted(r["classes"]),
        "country": r.get("cc"),
        "image": r.get("image"),
        "parent_qid": r.get("parent_qid"),
        "parent_name": r.get("parent_name"),
        "wikipedia": r.get("wikipedia"),
    }
    props = {k: v for k, v in props.items() if v not in (None, "")}
    return {
        "type": "Feature",
        "id": f"wd/{r['qid']}",
        "geometry": {"type": "Point", "coordinates": r["coord"]},
        "properties": props,
    }
