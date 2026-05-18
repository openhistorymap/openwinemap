# openwinemap

A weekly-refreshed wine atlas: wineries, vineyards and tasting rooms from OpenStreetMap, plus wine regions, appellations and named cru from Wikidata. Static GeoJSON served from GitHub Pages, harvested by a GitHub Actions cron, published at `openwinemap.org`.

## Layout

- `harvester/` — Python module. Run with `python -m harvester`. Two passes:
  1. **OSM per country.** Overpass query for `craft=winery`, `industrial=winery`, `building=winery`, `landuse=vineyard`, `tourism|man_made=wine_cellar`, `amenity=wine_bar`, `shop=wine`, `cuisine=wine`. Geometries preserved as Point / Polygon / MultiPolygon (nodes → Point, closed ways → Polygon, `type=multipolygon` relations → MultiPolygon, one outer ring per polygon; inner rings dropped). Coordinates rounded to 5 dp (~1 m). Writes `data/countries/{CC}.geojson` and per-country entries into `data/manifest.json`.
  2. **Wikidata global.** SPARQL per verified wine-region class (only seven, all live-verified against known instances — see `harvester/regions.py` for the curated list and the bans on PDO/PGI/generic-DO/vineyard/winery classes that would pull in cheese, ham, individual wineries, etc.). **Direct `wdt:P31` only, never `P279*`** — a single bad class with a subclass walk once swept 9k disasters into the file. Centroids only (P625). Writes `data/regions.geojson`.
- `web/` — Static MapLibre frontend. No build step; deployed as-is to Pages. Includes `CNAME` for `openwinemap.org`.
- `data/` — Generated. Treat as machine-owned output; do not hand-edit.
- `.github/workflows/weekly.yml` — Sundays 02:00 UTC + manual dispatch. Harvests, commits data back to `main`, then publishes `web/ + data/` to GitHub Pages.
- `.github/workflows/deploy.yml` — Pushes that only touch `web/` or `data/` redeploy without re-harvesting.

## Data model

Two layered datasets, both rendered into the same MapLibre source so the cluster math accounts for them together.

**OSM features** (per-country files) carry `osm_type`, `osm_id`, a normalised `category` (one of `winery`, `vineyard`, `wine_cellar`, `wine_bar`, `wine_shop`), `name`, optional `wikidata`/`wikipedia` strings, and a `tags` dict trimmed to the keys we display in the detail panel. Geometry is one of `Point` / `Polygon` / `MultiPolygon` matching the OSM element type. Vineyards are kept only if they have a `name` or a wiki link — raw unnamed `landuse=vineyard` polygons are noise.

The frontend splits each country's FeatureCollection client-side: Points and polygon centroids feed the clustered symbol source; polygons feed a separate fill/outline source. A polygon click falls back to the symbol layer when one is under the cursor, so a winery dot inside a vineyard polygon still opens the winery card.

**Wikidata regions** (one global file) carry `qid`, `name`, an array `classes` (which Wikidata wine-region classes this item matched — a region may be both an appellation and a PDO), `country` (ISO 3166-1 alpha-2), `parent_qid`/`parent_name` (P361 part-of), an English `wikipedia` URL when present, and a Commons `image` URL. Wines associated with the region are NOT pre-fetched — the frontend resolves them on demand via a UNION SPARQL across P495 / P276 / P361 / P5826 / P127 plus the region's own P527 has-parts, filtered to `?w wdt:P31/wdt:P279* wd:Q282` (subclasses of wine). This keeps the harvester tractable and lets us surface the connection without committing to a single property model.

## Operational

- GitHub Pages serves the site at `https://openwinemap.org/` (custom domain via `web/CNAME`). The Pages build source is "GitHub Actions"; the workflow's deploy job uses `actions/deploy-pages@v4`.
- Frontend uses **relative** paths for `data/manifest.json`, `style.css`, `app.js` so the same build works at the apex domain or under a subpath.
- Overpass calls go through three mirrors with backoff (`overpass-api.de`, `overpass.kumi.systems`, `overpass.private.coffee`). On total failure we keep the prior GeoJSON and mark the country `stale` in the manifest.
- An inter-country delay of 8s in `harvester/harvest.py` keeps the public mirrors happy. Don't remove it.
- WDQS calls follow openartmap's etiquette: GET requests with a User-Agent that carries a contact URL, 2.5s pacing between class queries, soft-timeout detection on truncated 200 OK responses.
- Env knobs for local debugging:
  - `OWM_ONLY=FR,IT` — limit the OSM pass to specific countries
  - `OWM_SKIP_OSM=1` — preserve prior country files, only refresh regions
  - `OWM_SKIP_REGIONS=1` — preserve prior `regions.geojson`, only refresh OSM

## Design

This project shares the openculturemap / openartmap wunderkammer-atlas aesthetic — Caprasimo display / Vollkorn body, light-paper default, warm dark variant — retuned for wine. The accent palette swings from terracotta to **claret / gold / vine** (deep burgundy primary, gold secondary, leaf-green tertiary). Distinctive glyphs: a grape-cluster brand mark with a vine leaf, bottle / barrel / glass icons for OSM categories, a vine-leaf glyph for regions. See [.impeccable.md](.impeccable.md) for the full design context.

## House rules

- Local one-off tooling (validators, parsers, linters) runs via `docker run --rm -v "$PWD":/w -w /w python:3-slim …` — the host runtime is too old. Do **not** dockerize the project itself unless explicitly asked.
- Don't add new hard-coded credentials. There are none in this project; keep it that way.
- No tests yet. Don't claim a change is "tested" just because nothing crashed at import time.
