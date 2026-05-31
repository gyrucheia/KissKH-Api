import { Link } from "@tanstack/react-router";
import { Play, Star } from "lucide-react";
import type { DramaCard as TDrama } from "@/lib/kisskh-api";
import { getPoster } from "@/lib/kisskh-api";

export function DramaCard({ drama }: { drama: TDrama }) {
  const poster = getPoster(drama);
  const id = String(drama.id);

  return (
    <Link
      to="/drama/$id"
      params={{ id }}
      className="group relative block w-[160px] sm:w-[180px] md:w-[200px] shrink-0"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-border bg-card shadow-card transition-all duration-300 group-hover:scale-[1.03] group-hover:border-primary">
        {poster ? (
          <img
            src={poster}
            alt={drama.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-hero text-4xl font-bold text-primary-foreground">
            {drama.title?.[0] ?? "?"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-card opacity-80" />
        <div className="absolute inset-0 flex items-end justify-center pb-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground">
            <Play className="h-4 w-4 fill-primary text-primary" />
            Watch
          </div>
        </div>
        {drama.episode != null && (
          <div className="absolute right-2 top-2 glass rounded-md px-2 py-1 text-xs font-semibold">
            EP {drama.episode}
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {drama.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {drama.country && <span>{drama.country}</span>}
          {drama.year && <span>· {drama.year}</span>}
          {drama.status && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-primary" /> {drama.status}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function DramaCardSkeleton() {
  return (
    <div className="w-[160px] shrink-0 sm:w-[180px] md:w-[200px]">
      <div className="aspect-[2/3] animate-pulse rounded-xl bg-card" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-2 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
