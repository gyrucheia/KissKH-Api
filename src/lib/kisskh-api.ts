// KissKH API service — single source of truth for all network calls
// The frontend must always call the app's own backend proxy.
// This prevents browser CORS blocking and avoids calling KissKH or proxies directly.
export const KISSKH_BASE = "/api";
export const KISSKH_DIRECT_BASE = "https://kisskh.do/api";
export const CORS_PROXY = "https://corsproxy.io/?";

export interface DramaCard {
  id: string | number;
  title: string;
  thumbnail?: string;
  poster?: string;
  image?: string;
  cover?: string;
  country?: string;
  type?: string;
  episodesCount?: number;
  episode?: number;
  status?: string;
  year?: number | string;
  [k: string]: unknown;
}

export interface Episode {
  id: string | number;
  number?: number;
  title?: string;
  thumbnail?: string;
  [k: string]: unknown;
}

export interface DramaInfo extends DramaCard {
  description?: string;
  synopsis?: string;
  genres?: string[];
  episodes?: Episode[];
}

export interface ResolvedStream {
  url?: string;
  src?: string;
  hls?: string;
  subtitles?: Array<{ url: string; lang?: string; label?: string }>;
  [k: string]: unknown;
}

async function getJSON<T>(path: string): Promise<T> {
  const backendUrl = `${KISSKH_BASE}${path}`;

  // Only use the app backend proxy from the frontend.
  // Do not bypass this by calling KissKH or proxy services directly from the browser.
  const res = await fetch(backendUrl);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Backend request failed (${res.status}) - ${errText}`);
  }

  const data = await res.json();
  if (
    data &&
    typeof data === "object" &&
    ("error" in data || (typeof (data as Record<string, unknown>).status === "number" && (data as Record<string, unknown>).status >= 400))
  ) {
    throw new Error(`Backend error response: ${JSON.stringify(data)}`);
  }

  return data as T;
}

// Normalize varied API list shapes into a clean array of cards
export function normalizeList(raw: unknown): DramaCard[] {
  if (Array.isArray(raw)) return raw as DramaCard[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of ["data", "results", "items", "dramas", "list"]) {
      const v = obj[key];
      if (Array.isArray(v)) return v as DramaCard[];
    }
  }
  return [];
}

export function getPoster(d: DramaCard | undefined | null): string {
  if (!d) return "";
  return (
    (d.thumbnail as string) ||
    (d.poster as string) ||
    (d.image as string) ||
    (d.cover as string) ||
    ""
  );
}

export const api = {
  popular: (page = 1, pageSize = 20) =>
    getJSON(`/home/popular?page=${page}&page_size=${pageSize}`).then(normalizeList),
  lastUpdates: () =>
    getJSON(`/last-updates`).then(normalizeList),
  latest: (page = 1, pageSize = 20) =>
    getJSON(`/home/latest?page=${page}&page_size=${pageSize}`).then(normalizeList),
  newest: (page = 1, pageSize = 20) =>
    getJSON(`/home/new?page=${page}&page_size=${pageSize}`).then(normalizeList),
  ongoing: (page = 1, pageSize = 20, country = 0) =>
    getJSON(`/home/ongoing?page=${page}&page_size=${pageSize}&country=${country}`).then(
      normalizeList,
    ),
  completed: (page = 1, pageSize = 20, country = 0) =>
    getJSON(`/home/completed?page=${page}&page_size=${pageSize}&country=${country}`).then(
      normalizeList,
    ),
  search: (q: string) =>
    getJSON(`/search?q=${encodeURIComponent(q)}`).then(normalizeList),
  info: (dramaId: string) => getJSON<DramaInfo>(`/info/${encodeURIComponent(dramaId)}`),
  resolve: (episodeId: string) =>
    getJSON<ResolvedStream>(`/resolve/${encodeURIComponent(episodeId)}`),
};
