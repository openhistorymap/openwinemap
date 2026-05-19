const CATEGORY_LABELS = {
  winery: "Wineries",
  vineyard: "Vineyards",
  wine_cellar: "Wine cellars",
  wine_bar: "Wine bars",
  wine_shop: "Wine shops",
  wine_region: "Wine regions",
};

const OSM_CATEGORIES = ["winery", "vineyard", "wine_cellar", "wine_bar", "wine_shop"];
const ALL_CATEGORIES = [...OSM_CATEGORIES, "wine_region"];

const GLYPH_PATHS = {
  // bottle silhouette with shoulder
  winery:
    "M10 2 H14 V5 C14 5 16 7 16 9.5 V21 C16 21.6 15.6 22 15 22 H9 C8.4 22 8 21.6 8 21 V9.5 C8 7 10 5 10 5 Z " +
    "M10.4 11 H13.6 V18 H10.4 Z",
  // cluster of grapes
  vineyard:
    "M12 3 L14 5 H10 Z " +
    "M9 6.5 C 9.7 6.5 10.3 7.1 10.3 7.8 C 10.3 8.5 9.7 9.1 9 9.1 C 8.3 9.1 7.7 8.5 7.7 7.8 C 7.7 7.1 8.3 6.5 9 6.5 Z " +
    "M15 6.5 C 15.7 6.5 16.3 7.1 16.3 7.8 C 16.3 8.5 15.7 9.1 15 9.1 C 14.3 9.1 13.7 8.5 13.7 7.8 C 13.7 7.1 14.3 6.5 15 6.5 Z " +
    "M12 8 C 12.7 8 13.3 8.6 13.3 9.3 C 13.3 10 12.7 10.6 12 10.6 C 11.3 10.6 10.7 10 10.7 9.3 C 10.7 8.6 11.3 8 12 8 Z " +
    "M8 10 C 8.7 10 9.3 10.6 9.3 11.3 C 9.3 12 8.7 12.6 8 12.6 C 7.3 12.6 6.7 12 6.7 11.3 C 6.7 10.6 7.3 10 8 10 Z " +
    "M16 10 C 16.7 10 17.3 10.6 17.3 11.3 C 17.3 12 16.7 12.6 16 12.6 C 15.3 12.6 14.7 12 14.7 11.3 C 14.7 10.6 15.3 10 16 10 Z " +
    "M10 11.5 C 10.7 11.5 11.3 12.1 11.3 12.8 C 11.3 13.5 10.7 14.1 10 14.1 C 9.3 14.1 8.7 13.5 8.7 12.8 C 8.7 12.1 9.3 11.5 10 11.5 Z " +
    "M14 11.5 C 14.7 11.5 15.3 12.1 15.3 12.8 C 15.3 13.5 14.7 14.1 14 14.1 C 13.3 14.1 12.7 13.5 12.7 12.8 C 12.7 12.1 13.3 11.5 14 11.5 Z " +
    "M12 13 C 12.7 13 13.3 13.6 13.3 14.3 C 13.3 15 12.7 15.6 12 15.6 C 11.3 15.6 10.7 15 10.7 14.3 C 10.7 13.6 11.3 13 12 13 Z " +
    "M9.5 14.5 C 10.2 14.5 10.8 15.1 10.8 15.8 C 10.8 16.5 10.2 17.1 9.5 17.1 C 8.8 17.1 8.2 16.5 8.2 15.8 C 8.2 15.1 8.8 14.5 9.5 14.5 Z " +
    "M14.5 14.5 C 15.2 14.5 15.8 15.1 15.8 15.8 C 15.8 16.5 15.2 17.1 14.5 17.1 C 13.8 17.1 13.2 16.5 13.2 15.8 C 13.2 15.1 13.8 14.5 14.5 14.5 Z " +
    "M12 16 C 12.7 16 13.3 16.6 13.3 17.3 C 13.3 18 12.7 18.6 12 18.6 C 11.3 18.6 10.7 18 10.7 17.3 C 10.7 16.6 11.3 16 12 16 Z",
  // wine barrel
  wine_cellar:
    "M5 7 C 5 7 8 5 12 5 C 16 5 19 7 19 7 V17 C 19 17 16 19 12 19 C 8 19 5 17 5 17 Z " +
    "M5 9.5 C 5 9.5 8 8.2 12 8.2 C 16 8.2 19 9.5 19 9.5 " +
    "M5 14.5 C 5 14.5 8 15.8 12 15.8 C 16 15.8 19 14.5 19 14.5 " +
    "M3 7 H5 V17 H3 Z M19 7 H21 V17 H19 Z",
  // wine glass
  wine_bar:
    "M7 3 H17 L15.5 11 C 15 13.5 13.5 15 12 15 C 10.5 15 9 13.5 8.5 11 Z " +
    "M11 15 H13 V20 H11 Z " +
    "M8 20 H16 V21.5 H8 Z",
  // bottle with label (slightly different from winery)
  wine_shop:
    "M10 2 H14 V5 C14 5 15.5 6.5 15.5 8 V21 C15.5 21.6 15.2 22 14.7 22 H9.3 C8.8 22 8.5 21.6 8.5 21 V8 C 8.5 6.5 10 5 10 5 Z " +
    "M9 12 H15 V16 H9 Z",
  // vine leaf — used for wine regions
  wine_region:
    "M12 2 C 7 4 4 8 4 13 C 4 16 6 19 9 20 C 9 18 10 16 12 15 C 14 16 15 18 15 20 C 18 19 20 16 20 13 C 20 8 17 4 12 2 Z " +
    "M12 2 L12 20 " +
    "M12 8 L8 11 M12 8 L16 11 " +
    "M12 13 L9 15.5 M12 13 L15 15.5",
};

const CATEGORY_COLORS_LIGHT = {
  winery:       "#7d1f2a",
  vineyard:     "#4e7a3d",
  wine_cellar:  "#8a4a25",
  wine_bar:     "#a23a4c",
  wine_shop:    "#b06a1f",
  wine_region:  "#5a2a52",
};

const CATEGORY_COLORS_DARK = {
  winery:       "#e07a86",
  vineyard:     "#a8c98a",
  wine_cellar:  "#dca27a",
  wine_bar:     "#ef8c9a",
  wine_shop:    "#f0bc7a",
  wine_region:  "#c690ba",
};

const MAP_STYLES = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark:  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

const SOURCE_ID = "owm-pois";
const AREAS_SOURCE_ID = "owm-areas";
const VHEAT_SOURCE_ID = "owm-vineyards-heat";

const state = {
  manifest: null,
  current: null,            // current country entry, or null when viewing only regions
  features: [],             // current country OSM features
  regions: [],              // global wine-region features (always loaded)
  enabled: new Set(ALL_CATEGORIES),
  expanded: new Set(),      // category rows currently showing their item list
  theme: document.documentElement.getAttribute("data-theme") || "light",
  selectedFeatureId: null,
  youAreHereMarker: null,
  suppressNextMoveUrlWrite: false,
};

const map = new maplibregl.Map({
  container: "map",
  style: MAP_STYLES[state.theme],
  center: [10, 44],
  zoom: 3.6,
  maxZoom: 18,
  attributionControl: { compact: true },
});
map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "top-right");
map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-right");

const colorExpr = (palette) => {
  const expr = ["match", ["get", "category"]];
  for (const k of ALL_CATEGORIES) expr.push(k, palette[k]);
  expr.push(palette.winery);
  return expr;
};

const iconImageExpr = ["concat", "cat-", ["get", "category"]];

function currentPalette() {
  return state.theme === "dark" ? CATEGORY_COLORS_DARK : CATEGORY_COLORS_LIGHT;
}

async function buildImages() {
  const palette = currentPalette();
  const haloColor = state.theme === "dark" ? "#1a1010" : "#fcf6ea";
  await Promise.all(
    Object.entries(GLYPH_PATHS).map(([name, d]) => {
      const color = palette[name] || palette.winery;
      return addGlyphImage(name, d, color, haloColor);
    }),
  );
}

function addGlyphImage(name, d, fill, halo) {
  return new Promise((resolve) => {
    const id = `cat-${name}`;
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30" width="96" height="96">` +
      `<path d="${d}" fill="${halo}" fill-rule="evenodd" stroke="${halo}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>` +
      `<path d="${d}" fill="${fill}" fill-rule="evenodd"/>` +
      `</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image(96, 96);
    img.onload = () => {
      if (map.hasImage(id)) map.removeImage(id);
      map.addImage(id, img);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(); };
    img.src = url;
  });
}

function addCustomLayers() {
  const split = splitFeatures(filteredFeatures());

  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: featureCollection(split.points),
      cluster: true,
      clusterRadius: 50,
      clusterMaxZoom: 11,
    });
  } else {
    map.getSource(SOURCE_ID).setData(featureCollection(split.points));
  }

  if (!map.getSource(AREAS_SOURCE_ID)) {
    map.addSource(AREAS_SOURCE_ID, {
      type: "geojson",
      data: featureCollection(split.areas),
    });
  } else {
    map.getSource(AREAS_SOURCE_ID).setData(featureCollection(split.areas));
  }

  if (!map.getSource(VHEAT_SOURCE_ID)) {
    map.addSource(VHEAT_SOURCE_ID, {
      type: "geojson",
      data: featureCollection(split.vheat),
    });
  } else {
    map.getSource(VHEAT_SOURCE_ID).setData(featureCollection(split.vheat));
  }

  const palette = currentPalette();
  const clusterFill = readVarColor("--map-cluster-fill");
  const clusterStroke = readVarColor("--map-cluster-stroke");
  const clusterText = readVarColor("--map-cluster-text");
  const dotStroke = state.theme === "dark" ? "rgba(20,12,12,0.7)" : "rgba(255,250,240,0.85)";

  // Layer stack from bottom to top:
  //   1. vineyard heatmap (only visible at z<10 — fades out as polygons take over)
  //   2. polygon fills
  //   3. polygon outlines
  //   4. cluster circles
  //   5. point dots (only for *non-polygon* points, see filter)
  //   6. point symbols (icons) — sit on polygon centroids when applicable
  //   7. cluster count labels
  if (!map.getLayer("owm-vineyard-heat")) {
    map.addLayer({
      id: "owm-vineyard-heat",
      type: "heatmap",
      source: VHEAT_SOURCE_ID,
      maxzoom: 10,
      paint: {
        "heatmap-weight": 1,
        "heatmap-intensity": [
          "interpolate", ["linear"], ["zoom"],
          0, 0.4, 5, 0.9, 8, 1.4, 10, 0,
        ],
        "heatmap-color": [
          "interpolate", ["linear"], ["heatmap-density"],
          0,   "rgba(0,0,0,0)",
          0.15, state.theme === "dark" ? "rgba(232,159,116,0.18)" : "rgba(125,31,42,0.18)",
          0.45, state.theme === "dark" ? "rgba(220,118,80,0.40)"  : "rgba(125,31,42,0.42)",
          0.80, state.theme === "dark" ? "rgba(232,122,134,0.60)" : "rgba(125,31,42,0.65)",
        ],
        "heatmap-radius": [
          "interpolate", ["linear"], ["zoom"],
          0, 6, 5, 14, 8, 22, 10, 0,
        ],
        "heatmap-opacity": [
          "interpolate", ["linear"], ["zoom"],
          0, 0.85, 6, 0.85, 8, 0.65, 10, 0,
        ],
      },
    });
  }

  if (!map.getLayer("owm-areas-fill")) {
    map.addLayer({
      id: "owm-areas-fill",
      type: "fill",
      source: AREAS_SOURCE_ID,
      paint: {
        "fill-color": colorExpr(palette),
        "fill-opacity": [
          "interpolate", ["linear"], ["zoom"],
          6, 0.18, 10, 0.32, 14, 0.42, 18, 0.50,
        ],
      },
    });
    map.addLayer({
      id: "owm-areas-outline",
      type: "line",
      source: AREAS_SOURCE_ID,
      paint: {
        "line-color": colorExpr(palette),
        "line-width": [
          "interpolate", ["linear"], ["zoom"],
          6, 0.7, 10, 1.1, 14, 1.7, 18, 2.4,
        ],
        "line-opacity": 0.95,
      },
    });
  } else {
    map.setPaintProperty("owm-areas-fill", "fill-color", colorExpr(palette));
    map.setPaintProperty("owm-areas-outline", "line-color", colorExpr(palette));
  }

  // Suppress the dot for centroid points that already have a polygon under
  // them — the polygon + icon combination reads cleanly; a third mark in the
  // middle is noise.
  const pointDotFilter = [
    "all",
    ["!", ["has", "point_count"]],
    ["!=", ["coalesce", ["get", "has_area"], false], true],
  ];
  if (!map.getLayer("owm-points-dot")) {
    map.addLayer({
      id: "owm-points-dot",
      type: "circle",
      source: SOURCE_ID,
      filter: pointDotFilter,
      paint: {
        "circle-color": colorExpr(palette),
        "circle-radius": [
          "interpolate", ["linear"], ["zoom"],
          3, 2.2, 6, 3, 10, 3.8, 14, 5, 18, 7,
        ],
        "circle-stroke-color": dotStroke,
        "circle-stroke-width": 1,
        "circle-opacity": 0.95,
      },
    });
  } else {
    map.setPaintProperty("owm-points-dot", "circle-color", colorExpr(palette));
    map.setPaintProperty("owm-points-dot", "circle-stroke-color", dotStroke);
    map.setFilter("owm-points-dot", pointDotFilter);
  }

  if (!map.getLayer("owm-points")) {
    map.addLayer({
      id: "owm-points",
      type: "symbol",
      source: SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": iconImageExpr,
        "icon-size": [
          "interpolate", ["linear"], ["zoom"],
          5, 0.18, 9, 0.26, 12, 0.34, 15, 0.45, 18, 0.60,
        ],
        "icon-allow-overlap": ["step", ["zoom"], false, 14, true],
        "icon-ignore-placement": false,
        "icon-padding": 0,
      },
    });
  }

  if (!map.getLayer("owm-clusters")) {
    map.addLayer({
      id: "owm-clusters",
      type: "circle",
      source: SOURCE_ID,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": clusterFill,
        "circle-stroke-color": clusterStroke,
        "circle-stroke-width": 1.4,
        "circle-radius": [
          "step", ["get", "point_count"],
          15, 25, 19, 100, 23, 500, 28, 2000, 34,
        ],
      },
    });
  } else {
    map.setPaintProperty("owm-clusters", "circle-color", clusterFill);
    map.setPaintProperty("owm-clusters", "circle-stroke-color", clusterStroke);
  }

  if (!map.getLayer("owm-cluster-count")) {
    map.addLayer({
      id: "owm-cluster-count",
      type: "symbol",
      source: SOURCE_ID,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 12.5,
        "text-allow-overlap": true,
      },
      paint: { "text-color": clusterText },
    });
  } else {
    map.setPaintProperty("owm-cluster-count", "text-color", clusterText);
  }

  wireMapEvents();
}

function readVarColor(varName) {
  const probe = document.createElement("span");
  probe.style.color = `var(${varName})`;
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);
  const c = getComputedStyle(probe).color || "rgb(125,31,42)";
  probe.remove();
  return c;
}

let mapEventsWired = false;
function wireMapEvents() {
  if (mapEventsWired) return;
  mapEventsWired = true;

  map.on("click", "owm-clusters", (e) => {
    const f = e.features[0];
    map.getSource(SOURCE_ID).getClusterExpansionZoom(f.properties.cluster_id, (err, zoom) => {
      if (err) return;
      map.easeTo({ center: f.geometry.coordinates, zoom, duration: 500 });
    });
  });

  map.on("click", (e) => {
    // Symbols / dots win over polygon fills when both are under the cursor
    // (the user almost always means "open the winery I just tapped" rather
    // than "open the vineyard it sits inside").
    const ptHits = map.queryRenderedFeatures(e.point, { layers: ["owm-points", "owm-points-dot"] });
    if (ptHits.length) { openDetail(ptHits[0]); return; }
    const areaHits = map.queryRenderedFeatures(e.point, { layers: ["owm-areas-fill"] });
    if (areaHits.length) {
      // The rendered area feature lacks the centroid we use in the symbol
      // layer; look it up by id so the detail panel gets the full record
      // including the `tags` blob.
      const id = areaHits[0].properties && (areaHits[0].properties.osm_type
        ? `${areaHits[0].properties.osm_type}/${areaHits[0].properties.osm_id}`
        : areaHits[0].id);
      const full = state.features.find((x) => x.id === id) || areaHits[0];
      openDetail(full);
    }
  });

  for (const id of ["owm-points", "owm-points-dot", "owm-clusters", "owm-areas-fill"]) {
    map.on("mouseenter", id, () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", id, () => (map.getCanvas().style.cursor = ""));
  }
}

function featureCollection(features) {
  return { type: "FeatureCollection", features };
}

function filteredFeatures() {
  const out = [];
  for (const f of state.features) {
    if (state.enabled.has(normalizeCat(f.properties.category))) out.push(f);
  }
  if (state.enabled.has("wine_region")) {
    for (const f of state.regions) out.push(f);
  }
  return out;
}

// Split the filtered feature set into the three MapLibre sources we maintain:
// a clustered point source (one Point per feature — centroid for polygons,
// marked with `has_area: true` so the dot layer can suppress them and let the
// symbol icon sit on the polygon alone); an unclustered polygon source for
// fill rendering; and an unclustered vineyard-only source feeding the
// low-zoom heatmap, which exists purely so a country-zoom view conveys
// "this is wine country" without needing every dot to render.
function splitFeatures(features) {
  const points = [];
  const areas = [];
  const vheat = [];
  for (const f of features) {
    const g = f.geometry;
    if (!g) continue;
    const cat = normalizeCat(f.properties.category);
    if (g.type === "Point") {
      points.push(f);
      if (cat === "vineyard") {
        vheat.push({
          type: "Feature",
          geometry: g,
          properties: {},
        });
      }
      continue;
    }
    areas.push(f);
    const c = polygonCentroid(g);
    if (!c) continue;
    points.push({
      type: "Feature",
      id: f.id,
      geometry: { type: "Point", coordinates: c },
      properties: { ...f.properties, has_area: true },
    });
    if (cat === "vineyard") {
      vheat.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: c },
        properties: {},
      });
    }
  }
  return { points, areas, vheat };
}

// Polygon area in hectares. Equirectangular approximation around each
// polygon's mean latitude — good to a few percent at the latitudes wine is
// actually grown at; we're not going to mistake an acre for a megahectare.
function geomAreaHa(geom) {
  if (!geom || (geom.type !== "Polygon" && geom.type !== "MultiPolygon")) return 0;
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  let total = 0;
  for (const poly of polys) {
    if (!poly.length) continue;
    const outer = poly[0];
    if (outer.length < 3) continue;
    let latSum = 0;
    for (const [, y] of outer) latSum += y;
    const lat0 = latSum / outer.length;
    const cos = Math.cos(lat0 * Math.PI / 180);
    const mDegLon = 111320 * cos;
    const mDegLat = 110540;
    let s = 0;
    for (let i = 0; i < outer.length - 1; i++) {
      s += outer[i][0] * outer[i + 1][1] - outer[i + 1][0] * outer[i][1];
    }
    total += Math.abs(s) * mDegLon * mDegLat / 2;
    // Subtract inner rings (holes). We don't drop holes everywhere — the
    // harvester does, but defensive in case future data carries them.
    for (let r = 1; r < poly.length; r++) {
      const ring = poly[r];
      if (ring.length < 3) continue;
      let h = 0;
      for (let i = 0; i < ring.length - 1; i++) {
        h += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
      }
      total -= Math.abs(h) * mDegLon * mDegLat / 2;
    }
  }
  return Math.max(0, total / 10000);
}

function formatArea(ha) {
  if (!ha) return "";
  if (ha < 0.1) return `${Math.round(ha * 10000)} m²`;
  if (ha < 10) return `${ha.toFixed(2)} ha`;
  if (ha < 100) return `${ha.toFixed(1)} ha`;
  if (ha < 10000) return `${Math.round(ha).toLocaleString()} ha`;
  return `${(ha / 100).toFixed(0)} km²`;
}

function polygonCentroid(geom) {
  const rings = [];
  if (geom.type === "Polygon") {
    for (const r of geom.coordinates) rings.push(r);
  } else if (geom.type === "MultiPolygon") {
    for (const poly of geom.coordinates) for (const r of poly) rings.push(r);
  } else {
    return null;
  }
  let sx = 0, sy = 0, n = 0;
  for (const r of rings) {
    for (const [x, y] of r) { sx += x; sy += y; n++; }
  }
  if (!n) return null;
  return [sx / n, sy / n];
}

function normalizeCat(c) {
  return ALL_CATEGORIES.includes(c) ? c : "winery";
}

map.on("load", async () => {
  await buildImages();
  addCustomLayers();
  await bootstrap();
});

// ── Theme toggle ──────────────────────────────────────────────

const themeBtn = document.getElementById("theme-toggle");
themeBtn.addEventListener("click", () => setTheme(state.theme === "light" ? "dark" : "light"));

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem("owm-theme", theme); } catch (e) {}

  const cam = { center: map.getCenter(), zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() };
  mapEventsWired = false;
  map.setStyle(MAP_STYLES[theme]);
  map.once("style.load", async () => {
    await buildImages();
    map.jumpTo(cam);
    addCustomLayers();
  });
}

// ── Data loading ──────────────────────────────────────────────

async function bootstrap() {
  try {
    const r = await fetch("data/manifest.json", { cache: "no-cache" });
    state.manifest = await r.json();
  } catch (e) {
    state.manifest = { countries: [], generated_at: null };
  }
  renderMeta();
  renderCountries();

  // Load global regions in parallel with the initial country.
  const regionsP = loadRegions();

  const url = readUrl();
  const initial = pickInitialCountry(url.c);
  if (initial) {
    await loadCountry(initial, { skipFit: !!(url.lat != null && url.lon != null && url.z != null) });
  } else {
    renderCategories();
  }

  await regionsP;
  renderCategories();
  applyFilter();

  if (url.lat != null && url.lon != null && url.z != null) {
    state.suppressNextMoveUrlWrite = true;
    map.jumpTo({ center: [url.lon, url.lat], zoom: url.z });
  }

  if (url.p) {
    const f = [...state.features, ...state.regions].find((x) => x.id === url.p);
    if (f) {
      state.selectedFeatureId = url.p;
      openDetail(f, { fromUrl: true });
    }
  }

  writeUrl();
}

async function loadRegions() {
  const entry = state.manifest?.regions;
  if (!entry || !entry.file) return;
  try {
    const r = await fetch(`data/${entry.file}`, { cache: "no-cache" });
    const fc = await r.json();
    state.regions = (fc.features || []).map((f) => ({
      ...f,
      properties: { ...f.properties, category: "wine_region" },
    }));
  } catch (e) {
    state.regions = [];
  }
}

function pickInitialCountry(preferredCode) {
  const list = state.manifest?.countries || [];
  if (!list.length) return null;
  if (preferredCode && list.find((c) => c.code === preferredCode)) return preferredCode;
  const withData = list.filter((c) => (c.count || 0) > 0);
  if (withData.length) {
    const fr = withData.find((c) => c.code === "FR");
    return (fr || withData[0]).code;
  }
  return list[0].code;
}

function readUrl() {
  let h = (location.hash || "").replace(/^#/, "");
  if (!h) return {};
  if (/^[A-Za-z]{2}$/.test(h)) return { c: h.toUpperCase() };
  const params = new URLSearchParams(h);
  const out = {};
  const c = params.get("c"); if (c) out.c = c.toUpperCase();
  const lat = parseFloat(params.get("lat")); if (Number.isFinite(lat)) out.lat = lat;
  const lon = parseFloat(params.get("lon")); if (Number.isFinite(lon)) out.lon = lon;
  const z = parseFloat(params.get("z")); if (Number.isFinite(z)) out.z = z;
  const p = params.get("p"); if (p) out.p = p;
  return out;
}

function writeUrl({ push = false } = {}) {
  const params = new URLSearchParams();
  if (state.current?.code) params.set("c", state.current.code);
  if (map && typeof map.getCenter === "function") {
    try {
      const c = map.getCenter();
      params.set("lat", c.lat.toFixed(4));
      params.set("lon", c.lng.toFixed(4));
      params.set("z", map.getZoom().toFixed(2));
    } catch (e) {}
  }
  if (state.selectedFeatureId) params.set("p", state.selectedFeatureId);
  const target = "#" + params.toString();
  if (target === location.hash) return;
  if (push) history.pushState(null, "", target);
  else history.replaceState(null, "", target);
}

function renderMeta() {
  const el = document.getElementById("meta-updated");
  const m = state.manifest;
  if (!m || !m.generated_at) {
    el.textContent = "the cellar is being inventoried…";
    return;
  }
  const d = new Date(m.generated_at);
  const fmt = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const r = m.regions?.count || 0;
  el.innerHTML = `last poured <strong style="font-style:normal;color:var(--ink-soft)">${fmt}</strong> · ${m.countries.length} countries · ${r.toLocaleString()} regions`;
}

function renderCountries() {
  const sel = document.getElementById("country-select");
  const list = state.manifest?.countries || [];
  sel.innerHTML = "";
  if (!list.length) {
    sel.innerHTML = `<option>(awaiting first vintage)</option>`;
    sel.disabled = true;
    return;
  }
  for (const c of list) {
    const opt = document.createElement("option");
    opt.value = c.code;
    const count = c.count ? c.count.toLocaleString() : "—";
    const stale = c.stale ? " *" : "";
    opt.textContent = `${c.name} — ${count}${stale}`;
    sel.appendChild(opt);
  }
  sel.disabled = false;
  sel.onchange = (e) => {
    state.selectedFeatureId = null;
    closeDetailUI();
    loadCountry(e.target.value, { pushHistory: true });
  };
}

async function loadCountry(code, { skipFit = false, pushHistory = false } = {}) {
  const entry = (state.manifest?.countries || []).find((c) => c.code === code);
  if (!entry) return;
  state.current = entry;
  document.getElementById("country-select").value = code;
  const stat = document.getElementById("country-stat");
  if (entry.count) {
    stat.innerHTML = `<strong style="font-style:normal;color:var(--ink-soft)">${entry.count.toLocaleString()}</strong> wineries &amp; vineyards${entry.stale ? " · (cached — last harvest failed)" : ""}`;
  } else {
    stat.textContent = "no wineries gathered yet";
  }

  if (!entry.file || !entry.count) {
    state.features = [];
    applyFilter();
    renderCategories();
    writeUrl({ push: pushHistory });
    return;
  }

  try {
    const r = await fetch(`data/${entry.file}`, { cache: "no-cache" });
    const fc = await r.json();
    state.features = fc.features || [];
  } catch (e) {
    state.features = [];
  }
  renderCategories();
  applyFilter();
  if (!skipFit) {
    state.suppressNextMoveUrlWrite = true;
    fitToCountry();
  }
  writeUrl({ push: pushHistory });
}

function fitToCountry() {
  if (!state.features.length) return;
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  const accept = ([lon, lat]) => {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  };
  const walk = (coords) => {
    if (typeof coords[0] === "number") accept(coords);
    else for (const c of coords) walk(c);
  };
  for (const f of state.features) {
    if (!f.geometry) continue;
    walk(f.geometry.coordinates);
  }
  if (!isFinite(minLon)) return;
  map.fitBounds(
    [[minLon, minLat], [maxLon, maxLat]],
    { padding: { top: 60, bottom: 60, left: 60, right: 60 }, duration: 750, maxZoom: 9 },
  );
}

const CAT_LIST_LIMIT = 250;

function renderCategories() {
  const container = document.getElementById("cat-list");
  container.innerHTML = "";
  const counts = {};
  for (const k of ALL_CATEGORIES) counts[k] = 0;
  for (const f of state.features) counts[normalizeCat(f.properties.category)]++;
  counts.wine_region = state.regions.length;
  const palette = currentPalette();

  for (const k of ALL_CATEGORIES) {
    if (!counts[k]) continue;
    const row = document.createElement("div");
    row.className = "cat-row" + (state.enabled.has(k) ? "" : " off");
    row.dataset.cat = k;
    const isOpen = state.expanded.has(k);
    row.innerHTML = `
      <span class="cat-glyph" style="color:${palette[k]}">${inlineGlyph(k)}</span>
      <span class="cat-label">${CATEGORY_LABELS[k] || k}</span>
      <span class="cat-count">${counts[k].toLocaleString()}</span>
      <button class="cat-expand${isOpen ? " open" : ""}" aria-label="show items" type="button">
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.5 L6 8.5 L10 4.5" /></svg>
      </button>
    `;

    // Clicking the row toggles enabled/disabled; clicking the chevron
    // toggles the item list. The chevron stops propagation so the two
    // affordances don't trip each other.
    row.addEventListener("click", () => {
      if (state.enabled.has(k)) state.enabled.delete(k);
      else state.enabled.add(k);
      row.classList.toggle("off");
      applyFilter();
    });
    const expandBtn = row.querySelector(".cat-expand");
    expandBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (state.expanded.has(k)) state.expanded.delete(k);
      else state.expanded.add(k);
      renderCategories();
    });
    container.appendChild(row);

    if (isOpen) {
      container.appendChild(buildCatItemList(k));
    }
  }

  document.getElementById("cat-all").onclick = () => {
    state.enabled = new Set(ALL_CATEGORIES);
    renderCategories();
    applyFilter();
  };
  document.getElementById("cat-none").onclick = () => {
    state.enabled = new Set();
    renderCategories();
    applyFilter();
  };
}

// Build the named-item list shown when a category is expanded. Unnamed
// features (raw landuse=vineyard polygons with no tag-name) are counted in
// the row above but not listed — they're not navigable.
function buildCatItemList(category) {
  const items = [];
  if (category === "wine_region") {
    for (const f of state.regions) {
      const name = f.properties && f.properties.name;
      if (name && name !== f.properties.qid) items.push(f);
    }
  } else {
    for (const f of state.features) {
      if (normalizeCat(f.properties.category) !== category) continue;
      const name = f.properties && f.properties.name;
      if (name) items.push(f);
    }
  }
  items.sort((a, b) =>
    String(a.properties.name).localeCompare(String(b.properties.name), undefined, { sensitivity: "base" })
  );

  const list = document.createElement("div");
  list.className = "cat-itemlist";

  if (!items.length) {
    list.innerHTML = `<div class="cat-item-empty">no named items in this category</div>`;
    return list;
  }

  const shown = items.slice(0, CAT_LIST_LIMIT);
  const frag = document.createDocumentFragment();
  for (const f of shown) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cat-item";
    btn.dataset.id = f.id;
    btn.textContent = f.properties.name;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      zoomToFeature(f);
      openDetail(f);
    });
    frag.appendChild(btn);
  }
  list.appendChild(frag);
  if (items.length > CAT_LIST_LIMIT) {
    const more = document.createElement("div");
    more.className = "cat-item-more";
    more.textContent = `… and ${(items.length - CAT_LIST_LIMIT).toLocaleString()} more named items (zoom in to find them)`;
    list.appendChild(more);
  }
  return list;
}

function zoomToFeature(f) {
  if (!f || !f.geometry) return;
  if (f.geometry.type === "Point") {
    state.suppressNextMoveUrlWrite = true;
    map.flyTo({ center: f.geometry.coordinates, zoom: Math.max(map.getZoom(), 13), duration: 800 });
    return;
  }
  // Polygon / MultiPolygon: fit to its bounding box
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  const walk = (coords) => {
    if (typeof coords[0] === "number") {
      if (coords[0] < minLon) minLon = coords[0];
      if (coords[0] > maxLon) maxLon = coords[0];
      if (coords[1] < minLat) minLat = coords[1];
      if (coords[1] > maxLat) maxLat = coords[1];
    } else {
      for (const c of coords) walk(c);
    }
  };
  walk(f.geometry.coordinates);
  if (!isFinite(minLon)) return;
  state.suppressNextMoveUrlWrite = true;
  map.fitBounds(
    [[minLon, minLat], [maxLon, maxLat]],
    { padding: 80, duration: 800, maxZoom: 16 },
  );
}

function inlineGlyph(k) {
  const d = GLYPH_PATHS[k] || GLYPH_PATHS.winery;
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="currentColor" fill-rule="evenodd"/></svg>`;
}

function applyFilter() {
  const src = map.getSource(SOURCE_ID);
  if (!src) return;
  const split = splitFeatures(filteredFeatures());
  src.setData(featureCollection(split.points));
  const areas = map.getSource(AREAS_SOURCE_ID);
  if (areas) areas.setData(featureCollection(split.areas));
  const heat = map.getSource(VHEAT_SOURCE_ID);
  if (heat) heat.setData(featureCollection(split.vheat));
}

// ── Detail panel ──────────────────────────────────────────────

function openDetail(feature, { fromUrl = false } = {}) {
  const detail = document.getElementById("detail");
  const body = document.getElementById("detail-body");
  const p = feature.properties || {};
  if (!fromUrl) {
    state.selectedFeatureId = feature.id;
    writeUrl({ push: true });
  }
  const category = normalizeCat(p.category);
  const catLabel = CATEGORY_LABELS[category] || category;

  if (category === "wine_region") {
    renderRegionDetail(body, feature);
  } else {
    renderOsmDetail(body, feature, category, catLabel);
  }

  detail.classList.add("open");
  detail.setAttribute("aria-hidden", "false");
}

function renderOsmDetail(body, feature, category, catLabel) {
  const p = feature.properties || {};
  const tags = parseTags(p.tags);
  const addr = formatAddress(tags);
  const links = buildOsmLinks(p, tags);
  const areaHa = geomAreaHa(feature.geometry);
  const subLine = addr || tags["addr:city"] || "";
  const areaLine = areaHa ? formatArea(areaHa) : "";

  body.innerHTML = `
    <span class="detail-cat">
      <span class="cat-glyph">${inlineGlyph(category)}</span>
      ${escapeHtml(catLabel.toLowerCase())}${areaLine ? ` · ${escapeHtml(areaLine)}` : ""}
    </span>
    <h2 class="detail-title">${escapeHtml(p.name || "(unnamed)")}</h2>
    <div class="detail-sub">${escapeHtml(subLine)}</div>
    <div id="wd-slot"></div>
    <div class="detail-section">
      <h4>From OpenStreetMap</h4>
      <dl class="tag-grid">${renderTagRows(tags)}</dl>
    </div>
    ${links.length ? `<div class="detail-section"><h4>Elsewhere</h4><div class="detail-links">${links.join("")}</div></div>` : ""}
  `;

  if (p.wikidata) {
    renderWdSlot(document.getElementById("wd-slot"), p.wikidata, {
      heading: "From Wikidata",
    });
  }
}

function renderRegionDetail(body, feature) {
  const p = feature.properties || {};
  const qid = p.qid;
  const image = p.image;
  const parent = p.parent_name;
  const wpUrl = p.wikipedia;
  const country = p.country;
  const links = [];
  if (qid) {
    links.push(`<a href="https://www.wikidata.org/wiki/${encodeURIComponent(qid)}" target="_blank" rel="noopener">Wikidata · ${escapeHtml(qid)}</a>`);
  }
  if (wpUrl) {
    links.push(`<a href="${escapeAttr(wpUrl)}" target="_blank" rel="noopener">Wikipedia</a>`);
  }

  body.innerHTML = `
    <span class="detail-cat">
      <span class="cat-glyph">${inlineGlyph("wine_region")}</span>
      wine region
    </span>
    <h2 class="detail-title">${escapeHtml(p.name || qid || "(unnamed region)")}</h2>
    <div class="detail-sub">${parent ? `part of ${escapeHtml(parent)}` : country ? `(${escapeHtml(country)})` : ""}</div>
    ${image ? `<img class="detail-image" src="${escapeAttr(image)}" alt="${escapeAttr(p.name || "")}" loading="lazy" />` : ""}
    <div id="wd-slot"></div>
    <div class="detail-section" id="wines-section">
      <h4>Wines from here</h4>
      <div id="wines-slot">
        <div class="skeleton"></div>
        <div class="skeleton" style="width:75%"></div>
        <div class="skeleton" style="width:55%"></div>
      </div>
    </div>
    ${links.length ? `<div class="detail-section"><h4>Elsewhere</h4><div class="detail-links">${links.join("")}</div></div>` : ""}
  `;

  if (qid) {
    renderWdSlot(document.getElementById("wd-slot"), qid, {
      heading: "From Wikidata",
      hideImageIfDuplicate: !!image,
    });
    renderRegionWines(document.getElementById("wines-slot"), qid);
  } else {
    document.getElementById("wines-section").style.display = "none";
  }
}

function renderWdSlot(slot, qid, opts) {
  if (!slot) return;
  slot.innerHTML = `
    <div class="detail-section">
      <h4>${escapeHtml(opts.heading)} · ${escapeHtml(qid)}</h4>
      ${opts.hideImageIfDuplicate ? "" : `<div class="skeleton lg"></div>`}
      <div class="skeleton"></div>
      <div class="skeleton" style="width:60%"></div>
    </div>
  `;
  fetchWikidata(qid).then((data) => {
    if (!data) { slot.innerHTML = ""; return; }
    slot.innerHTML = `
      <div class="detail-section">
        <h4>${escapeHtml(opts.heading)} · <a href="https://www.wikidata.org/wiki/${encodeURIComponent(qid)}" target="_blank" rel="noopener">${escapeHtml(qid)}</a></h4>
        ${(data.image && !opts.hideImageIfDuplicate) ? `<img class="detail-image" src="${escapeAttr(data.image)}" alt="${escapeAttr(data.label || "")}" loading="lazy" />` : ""}
        ${data.label ? `<p style="font-family:var(--font-display);font-size:20px;line-height:1.25;color:var(--ink);margin-bottom:8px;">${escapeHtml(data.label)}</p>` : ""}
        ${data.desc ? `<p style="color:var(--ink-soft);">${escapeHtml(data.desc)}</p>` : ""}
        ${data.wikipediaUrl ? `<p style="margin-top:8px;"><a href="${escapeAttr(data.wikipediaUrl)}" target="_blank" rel="noopener">Read more on Wikipedia →</a></p>` : ""}
      </div>
    `;
  });
}

// Look up wine kinds linked to a region. We try several Wikidata predicates
// in one SPARQL UNION because the wine→region link is inconsistently modelled.
const WINE_SPARQL = `
SELECT DISTINCT ?w ?wLabel ?image ?kindLabel WHERE {
  {
    { ?w wdt:P495 wd:%QID% }
    UNION { ?w wdt:P276 wd:%QID% }
    UNION { ?w wdt:P361 wd:%QID% }
    UNION { ?w wdt:P5826 wd:%QID% }
    UNION { ?w wdt:P127 wd:%QID% }
    UNION { wd:%QID% wdt:P527 ?w }
  }
  ?w wdt:P31 ?kind .
  ?kind wdt:P279* wd:Q282 .
  OPTIONAL { ?w wdt:P18 ?image }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,it,es,de,pt". }
}
LIMIT 60
`;

const winesCache = new Map();

async function fetchRegionWines(qid) {
  if (!/^Q\d+$/.test(qid)) return [];
  if (winesCache.has(qid)) return winesCache.get(qid);
  const sparql = WINE_SPARQL.replaceAll("%QID%", qid);
  const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparql);
  try {
    const r = await fetch(url, { headers: { "Accept": "application/sparql-results+json" } });
    if (!r.ok) { winesCache.set(qid, []); return []; }
    const j = await r.json();
    const out = [];
    const seen = new Set();
    for (const row of j.results?.bindings || []) {
      const wQid = (row.w?.value || "").split("/").pop();
      if (!wQid || seen.has(wQid)) continue;
      seen.add(wQid);
      out.push({
        qid: wQid,
        label: row.wLabel?.value || wQid,
        kind: row.kindLabel?.value || null,
        image: row.image?.value || null,
      });
    }
    winesCache.set(qid, out);
    return out;
  } catch (e) {
    winesCache.set(qid, []);
    return [];
  }
}

async function renderRegionWines(slot, qid) {
  const wines = await fetchRegionWines(qid);
  if (!wines.length) {
    slot.innerHTML = `<p style="color:var(--ink-mute);font-style:italic;">No wines linked to this region in Wikidata yet.</p>`;
    return;
  }
  const rows = wines.map((w) => `
    <li class="wine-row">
      <span></span>
      <div>
        <div class="wine-name">${escapeHtml(w.label)}</div>
        ${w.kind ? `<div class="wine-kind">${escapeHtml(w.kind)}</div>` : ""}
        <div class="wine-qid"><a href="https://www.wikidata.org/wiki/${encodeURIComponent(w.qid)}" target="_blank" rel="noopener">${escapeHtml(w.qid)}</a></div>
      </div>
    </li>
  `).join("");
  slot.innerHTML = `<ul class="wine-list">${rows}</ul>`;
}

function parseTags(v) {
  if (!v) return {};
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return {}; }
  }
  return v;
}

function formatAddress(tags) {
  const parts = [
    [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" "),
    tags["addr:city"],
    tags["addr:country"],
  ].filter(Boolean);
  return parts.join(", ");
}

function buildOsmLinks(props, tags) {
  const out = [];
  if (props.osm_type && props.osm_id) {
    out.push(`<a href="https://www.openstreetmap.org/${props.osm_type}/${props.osm_id}" target="_blank" rel="noopener">OpenStreetMap</a>`);
  }
  if (tags.website || tags.url) {
    out.push(`<a href="${escapeAttr(tags.website || tags.url)}" target="_blank" rel="noopener">Official site</a>`);
  }
  if (tags.wikipedia) {
    const idx = tags.wikipedia.indexOf(":");
    if (idx > 0) {
      const lang = tags.wikipedia.slice(0, idx);
      const title = tags.wikipedia.slice(idx + 1);
      out.push(`<a href="https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}" target="_blank" rel="noopener">Wikipedia</a>`);
    }
  }
  if (props.wikidata || tags.wikidata) {
    const q = props.wikidata || tags.wikidata;
    out.push(`<a href="https://www.wikidata.org/wiki/${encodeURIComponent(q)}" target="_blank" rel="noopener">Wikidata</a>`);
  }
  return out;
}

const TAG_DISPLAY = {
  craft: "craft",
  industrial: "industrial",
  building: "building",
  landuse: "land use",
  shop: "shop",
  amenity: "amenity",
  cuisine: "cuisine",
  tourism: "tourism",
  man_made: "man-made",
  grape_variety: "grape variety",
  "grape_variety:en": "grape variety",
  wine_type: "wine type",
  wine: "wine",
  produce: "produce",
  production: "production",
  operator: "operator",
  brand: "brand",
  opening_hours: "open",
  phone: "phone",
  email: "email",
  wheelchair: "step-free",
  start_date: "established",
};

function renderTagRows(tags) {
  const rows = [];
  for (const [key, label] of Object.entries(TAG_DISPLAY)) {
    if (tags[key] != null) {
      rows.push(`<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(String(tags[key]))}</dd>`);
    }
  }
  if (!rows.length) return `<dt>—</dt><dd>no extra tags recorded</dd>`;
  return rows.join("");
}

const wikidataCache = new Map();

async function fetchWikidata(qid) {
  if (!/^Q\d+$/.test(qid)) return null;
  if (wikidataCache.has(qid)) return wikidataCache.get(qid);
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(qid)}&props=labels%7Cdescriptions%7Cclaims%7Csitelinks%2Furls&languages=en&format=json&origin=*`;
  try {
    const r = await fetch(url);
    const j = await r.json();
    const ent = j.entities?.[qid];
    if (!ent) { wikidataCache.set(qid, null); return null; }
    const label = ent.labels?.en?.value;
    const desc = ent.descriptions?.en?.value;
    const imageFile = ent.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    const wikipediaUrl = ent.sitelinks?.enwiki?.url || null;
    const image = imageFile
      ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageFile)}?width=720`
      : null;
    const out = { label, desc, image, wikipediaUrl };
    wikidataCache.set(qid, out);
    return out;
  } catch (e) {
    wikidataCache.set(qid, null);
    return null;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}
function escapeAttr(s) { return escapeHtml(s); }

function closeDetailUI() {
  const d = document.getElementById("detail");
  d.classList.remove("open");
  d.setAttribute("aria-hidden", "true");
}

document.getElementById("detail-close").addEventListener("click", () => {
  closeDetailUI();
  if (state.selectedFeatureId) {
    state.selectedFeatureId = null;
    writeUrl();
  }
});

map.on("moveend", () => {
  if (state.suppressNextMoveUrlWrite) {
    state.suppressNextMoveUrlWrite = false;
    return;
  }
  writeUrl();
});

window.addEventListener("popstate", () => {
  const url = readUrl();
  const wantPid = url.p || null;
  const wantCountry = url.c || null;

  const apply = async () => {
    if (wantCountry && wantCountry !== state.current?.code) {
      const skipFit = url.lat != null && url.lon != null && url.z != null;
      await loadCountry(wantCountry, { skipFit });
    }
    if (url.lat != null && url.lon != null && url.z != null) {
      state.suppressNextMoveUrlWrite = true;
      map.jumpTo({ center: [url.lon, url.lat], zoom: url.z });
    }
    if (wantPid !== state.selectedFeatureId) {
      if (wantPid) {
        const f = [...state.features, ...state.regions].find((x) => x.id === wantPid);
        if (f) {
          state.selectedFeatureId = wantPid;
          openDetail(f, { fromUrl: true });
        }
      } else {
        state.selectedFeatureId = null;
        closeDetailUI();
      }
    }
  };
  apply();
});

// ── Geolocation ────────────────────────────────────────────────

document.getElementById("locate-btn").addEventListener("click", () => {
  const btn = document.getElementById("locate-btn");
  if (!navigator.geolocation) {
    btn.querySelector("span").textContent = "geolocation unsupported";
    return;
  }
  btn.classList.add("locating");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      btn.classList.remove("locating");
      const { latitude, longitude } = pos.coords;
      if (state.youAreHereMarker) state.youAreHereMarker.remove();
      const el = document.createElement("div");
      el.className = "you-are-here";
      state.youAreHereMarker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([longitude, latitude])
        .setPopup(new maplibregl.Popup({ offset: 18, closeButton: false }).setText("you are here"))
        .addTo(map);
      map.flyTo({ center: [longitude, latitude], zoom: 12, duration: 1200 });
    },
    (err) => {
      btn.classList.remove("locating");
      const label = btn.querySelector("span");
      label.textContent = err.code === err.PERMISSION_DENIED
        ? "location permission denied"
        : "couldn't find you";
      setTimeout(() => { label.textContent = "Where am I?"; }, 4000);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
  );
});
