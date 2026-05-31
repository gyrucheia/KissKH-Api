const __vite_import_meta_env__ = {};
const KISSKH_BASE = __vite_import_meta_env__?.VITE_API_BASE_URL || "https://kiss-kh-api.vercel.app";
const KISSKH_DIRECT_BASE = "https://kisskh.do/api";
async function getJSON(path) {
  const backendUrl = `${KISSKH_BASE}${path}`;
  const directUrl = `${KISSKH_DIRECT_BASE}${path}`;
  try {
    console.log(`[API] Trying backend: ${backendUrl}`);
    const res = await fetch(backendUrl);
    if (!res.ok) {
      throw new Error(`Backend request failed (${res.status})`);
    }
    console.log(`[API] Backend successful!`);
    return await res.json();
  } catch (e) {
    console.warn("[API] Backend failed:", e);
  }
  try {
    console.log(`[API] Trying AllOrigins proxy: ${directUrl}`);
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(directUrl)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) {
      throw new Error(`AllOrigins request failed (${res.status})`);
    }
    const data = await res.json();
    const actualData = JSON.parse(data.contents);
    console.log(`[API] AllOrigins successful!`);
    return actualData;
  } catch (e) {
    console.warn("[API] AllOrigins fallback failed:", e);
  }
  try {
    console.log(`[API] Trying corsproxy.io: ${directUrl}`);
    const proxyUrl = `https://corsproxy.io/?${directUrl}`;
    const res = await fetch(proxyUrl, {
      headers: {
        "Referer": "https://kisskh.do/"
      }
    });
    if (!res.ok) {
      throw new Error(`corsproxy.io request failed (${res.status})`);
    }
    console.log(`[API] corsproxy.io successful!`);
    return await res.json();
  } catch (e) {
    console.warn("[API] corsproxy.io fallback failed:", e);
  }
  throw new Error(`Failed to fetch ${path} from all sources. Please check your connection.`);
}
function normalizeList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const obj = raw;
    for (const key of ["data", "results", "items", "dramas", "list"]) {
      const v = obj[key];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}
function getPoster(d) {
  if (!d) return "";
  return d.thumbnail || d.poster || d.image || d.cover || "";
}
const api = {
  popular: (page = 1, pageSize = 20) => getJSON(`/home/popular?page=${page}&page_size=${pageSize}`).then(normalizeList),
  lastUpdates: () => getJSON(`/last-updates`).then(normalizeList),
  latest: (page = 1, pageSize = 20) => getJSON(`/home/latest?page=${page}&page_size=${pageSize}`).then(normalizeList),
  newest: (page = 1, pageSize = 20) => getJSON(`/home/new?page=${page}&page_size=${pageSize}`).then(normalizeList),
  ongoing: (page = 1, pageSize = 20, country = 0) => getJSON(`/home/ongoing?page=${page}&page_size=${pageSize}&country=${country}`).then(
    normalizeList
  ),
  completed: (page = 1, pageSize = 20, country = 0) => getJSON(`/home/completed?page=${page}&page_size=${pageSize}&country=${country}`).then(
    normalizeList
  ),
  search: (q) => getJSON(`/search?q=${encodeURIComponent(q)}`).then(normalizeList),
  info: (dramaId) => getJSON(`/info/${encodeURIComponent(dramaId)}`),
  resolve: (episodeId) => getJSON(`/resolve/${encodeURIComponent(episodeId)}`)
};
export {
  api as a,
  getPoster as g
};
