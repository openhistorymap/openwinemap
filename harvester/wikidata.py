"""Minimal Wikidata Query Service client. Plain GET, polite retries.

WDQS enforces a 60s server-side timeout per query. Beyond that the endpoint
either returns HTTP 500 with a Java stack trace, or 200 OK with a truncated
JSON body and a stack trace appended. Both are surfaced as WdqsTimeout so the
caller can subdivide and retry.
"""

import time

import requests

ENDPOINT = "https://query.wikidata.org/sparql"
UA = "openwinemap/1.0 (https://github.com/openhistorymap/openwinemap; OpenHistoryMap)"


class WdqsTimeout(Exception):
    pass


_TIMEOUT_BODY_MARKERS = (
    "TimeoutException",
    "QueryTimeoutException",
    "QueuedThreadPool",
    "java.util.concurrent.ExecutionException",
)


def query(sparql, attempts=3, http_timeout=180):
    last = None
    for i in range(attempts):
        try:
            r = requests.get(
                ENDPOINT,
                params={"query": sparql, "format": "json"},
                headers={
                    "User-Agent": UA,
                    "Accept": "application/sparql-results+json",
                },
                timeout=http_timeout,
            )
            if r.status_code in (429, 502, 503, 504):
                last = f"HTTP {r.status_code}"
                time.sleep(30 + 20 * i)
                continue
            if r.status_code == 500:
                body = r.text or ""
                if any(m in body for m in _TIMEOUT_BODY_MARKERS):
                    raise WdqsTimeout("WDQS server-side timeout")
                last = f"HTTP 500: {body[:200]}"
                time.sleep(20 + 20 * i)
                continue
            r.raise_for_status()
            text = r.text
            tail = text[-2048:] if len(text) > 2048 else text
            if any(m in tail for m in _TIMEOUT_BODY_MARKERS):
                raise WdqsTimeout("WDQS soft timeout (truncated 200 OK)")
            return r.json()
        except WdqsTimeout:
            raise
        except requests.Timeout:
            last = "http client timeout"
            time.sleep(15 + 15 * i)
        except Exception as e:
            last = repr(e)
            time.sleep(15 + 15 * i)
    raise RuntimeError(f"WDQS failed: {last}")


def rows(result):
    return result.get("results", {}).get("bindings", [])


def val(binding, key):
    cell = binding.get(key)
    if not cell:
        return None
    return cell.get("value")


def qid_from_uri(uri):
    if not uri:
        return None
    return uri.rsplit("/", 1)[-1]


def parse_point(wkt):
    if not wkt or not wkt.startswith("Point("):
        return None
    inner = wkt[6:-1]
    parts = inner.split()
    if len(parts) != 2:
        return None
    try:
        lon = float(parts[0])
        lat = float(parts[1])
    except ValueError:
        return None
    if not (-180.0 <= lon <= 180.0 and -90.0 <= lat <= 90.0):
        return None
    return [round(lon, 5), round(lat, 5)]
