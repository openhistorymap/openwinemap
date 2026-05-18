# openwinemap

A weekly-refreshed wine atlas at **[openwinemap.org](https://openwinemap.org)**.

Wineries, vineyards and tasting rooms from OpenStreetMap, plus wine regions, appellations, named cru and wine-growing estates from Wikidata. Each wine region click links through to the wines linked to it on Wikidata — Barolo to Nebbiolo, Sancerre to Sauvignon, and so on.

Static GeoJSON, served from GitHub Pages, harvested every Sunday at 02:00 UTC by a GitHub Actions cron.

## Local development

```bash
# harvester
pip install -r harvester/requirements.txt
python -m harvester                    # full run (slow; ~40 countries + WDQS)
OWM_ONLY=FR,IT python -m harvester     # limit OSM pass
OWM_SKIP_OSM=1 python -m harvester     # only refresh wine regions
OWM_SKIP_REGIONS=1 python -m harvester # only refresh OSM countries

# web
cd web && python -m http.server 8000   # then open localhost:8000
```

The frontend reads `data/manifest.json` and fetches per-country and regions GeoJSON on demand.

## Sources & credits

- OpenStreetMap data via the Overpass API — © OpenStreetMap contributors, [ODbL](https://www.openstreetmap.org/copyright).
- Wine regions and wines via [Wikidata](https://www.wikidata.org) — CC0.
- Basemap: [OpenFreeMap Positron](https://openfreemap.org) (light) / [CARTO Dark Matter](https://carto.com/basemaps/) (dark).
- Part of the [OpenHistoryMap](https://openhistorymap.org) family alongside `openculturemap` and `openartmap`.
