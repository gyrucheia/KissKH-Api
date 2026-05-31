// KissKH API service — single source of truth for all network calls
export const KISSKH_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";

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
  const res = await fetch(`${KISSKH_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${path}`);
  }
  return (await res.json()) as T;
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
