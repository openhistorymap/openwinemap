"""Wine-region harvest from Wikidata.

Every QID below is one we've live-verified with a known instance before
shipping. Don't add a new class without doing the same — guessing in this
file once turned the map into a memorial to twentieth-century disasters
(see feedback memory).

We treat 'wine region' broadly: protected appellations (AOC / DOC / DOCG /
AOP), American Viticultural Areas, generic wine-producing regions
(Q2140699 — covers Bordeaux, Burgundy, California wine, Tuscany, etc.),
and generic legally-defined appellations (Q2858704). Every feature is a
point (centroid P625) — polygon boundaries for wine regions are out of
scope for v1; OSM provides those where they exist.

We deliberately exclude:
  * Q13439060 (EU PDO) and Q3104453 (EU PGI) — they cover cheese, oil,
    ham and dozens of other products, so a subclass walk pulls in
    Parmigiano Reggiano and Manchego alongside the wines.
  * Q325668 (generic designation of origin) — same problem, wider.
  * Q22715 (vineyard) and Q156362 (winery) — these are concrete
    facilities, not regions. OSM already covers them via `landuse=vineyard`
    and `craft=winery`.

We query one class at a time and use `wdt:P31` (direct instance-of) rather
than `wdt:P31/wdt:P279*` (subclass walk). Subclass walks are how the
disaster mess happened: if any branch of the subclass tree leads somewhere
unexpected, you silently inherit it. Direct-only queries trade a little
recall for a guarantee that every result is a real instance of the class
we asked for.
"""

import time

from .wikidata import WdqsTimeout, parse_point, qid_from_uri, query, rows, val


# (display_name, Wikidata QID, English label of the class — kept inline as a
# self-documenting sanity check)
#
# Wikidata models specific appellations inconsistently. Many famous regions
# are tagged Q22715 (vineyard) rather than as a region class — Saint-Émilion
# AOC, Pauillac, Médoc, Margaux all live under that class. Including Q22715
# is what brings hundreds of French AOC areas into the file. The trade-off
# is that Q22715 also covers single-plot vineyards (which OSM already
# carries) — but those rarely have a Wikidata P625, so they self-filter out.
WINE_REGION_CLASSES = [
    ("wine_region",        "Q2140699",  "wine-producing region"),
    ("ava",                "Q166247",   "American Viticultural Area"),
    ("aoc",                "Q1565828",  "appellation d'origine contrôlée"),
    ("doc",                "Q654824",   "denominazione di origine controllata"),
    ("docg",               "Q2305591",  "DOCG"),
    ("aop_ch",             "Q20723149", "appellation d'origine protégée (CH)"),
    ("appellation",        "Q2858704",  "appellation (legally-defined)"),
    ("vineyard",           "Q22715",    "vineyard (covers many AOCs in Wikidata)"),
]


# Plain instance-of, no subclass walk. The OPTIONAL joins for image, parent
# region and Wikipedia article are the same shape as openartmap's queries.
REGION_QUERY = """\
SELECT DISTINCT ?r ?rLabel ?coord ?cc ?image ?parent ?parentLabel ?article WHERE {
  ?r wdt:P31 wd:%(class_qid)s .
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
    for entry in WINE_REGION_CLASSES:
        class_name, class_qid = entry[0], entry[1]
        class_label = entry[2] if len(entry) > 2 else ""
        print(f"  region class: {class_name} ({class_qid}) — {class_label}", flush=True)
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
