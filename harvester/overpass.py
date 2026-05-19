import time
import requests

MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

# `out tags geom` returns the full polygon/multipolygon geometry inline for
# ways and relations, not just a centroid. We need that so the frontend can
# render the actual vineyard / winery footprints rather than dots.
QUERY = """
[out:json][timeout:900];
area["ISO3166-1"="{cc}"][admin_level=2]->.a;
(
  nwr["craft"="winery"](area.a);
  nwr["industrial"="winery"](area.a);
  nwr["building"="winery"](area.a);
  nwr["landuse"="vineyard"](area.a);
  nwr["crop"="grape"](area.a);
  nwr["tourism"="wine_cellar"](area.a);
  nwr["man_made"="wine_cellar"](area.a);
  nwr["amenity"="wine_bar"](area.a);
  nwr["shop"="wine"](area.a);
  nwr["cuisine"="wine"](area.a);
);
out tags geom;
"""


def fetch(cc, attempts_per_mirror=2):
    body = QUERY.format(cc=cc)
    last_err = None
    for mirror in MIRRORS:
        for attempt in range(attempts_per_mirror):
            try:
                r = requests.post(
                    mirror,
                    data={"data": body},
                    timeout=960,
                    headers={"User-Agent": "openwinemap/1.0 (+https://openwinemap.org)"},
                )
                if r.status_code in (429, 504):
                    last_err = f"{mirror} -> HTTP {r.status_code}"
                    time.sleep(30 + attempt * 30)
                    continue
                r.raise_for_status()
                return r.json()
            except Exception as e:
                last_err = f"{mirror} -> {e}"
                time.sleep(15 + attempt * 30)
    raise RuntimeError(f"all overpass mirrors failed: {last_err}")
