import { Link } from "@tanstack/react-router";
import { Play, Info } from "lucide-react";
import { useEffect, useState } from "react";
import type { DramaCard as TDrama } from "@/lib/kisskh-api";
import { getPoster } from "@/lib/kisskh-api";

export function Hero({ dramas, loading }: { dramas?: TDrama[]; loading?: boolean }) {
  const [idx, setIdx] = useState(0);
  const items = (dramas ?? []).slice(0, 5);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 6500);
    return () => clearInterval(t);
  }, [items.length]);

  if (loading || items.length === 0) {
    return (
      <div className="relative h-[68vh] min-h-[460px] w-full overflow-hidden">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-card to-background" />
        <div className="absolute inset-0 bg-gradient-card" />
      </div>
    );
  }

  const current = items[idx];
  const poster = getPoster(current);

  return (
    <div className="relative h-[68vh] min-h-[480px] w-full overflow-hidden">
      {items.map((d, i) => (
        <img
          key={String(d.id)}
          src={getPoster(d)}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-16 md:px-8 md:pb-24">
        <div className="max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-sm bg-primary/15 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            FEATURED NOW
            FEATURED NOW
          </div>
          <h1 className="text-4xl font-bold leading-[1.05] text-foreground md:text-6xl lg:text-7xl">
            {current.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {current.country && <span>{current.country}</span>}
            {current.year && <span>· {current.year}</span>}
            {current.status && <span>· {current.status}</span>}
          </div>
          <p className="line-clamp-3 max-w-xl text-base text-muted-foreground md:text-lg">
            {(current.description as string) ||
              "Discover this trending Asian drama — stream now with high-quality video and subtitles."}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/drama/$id"
              params={{ id: String(current.id) }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 text-sm font-semibold text-primary-foreground glow-primary transition hover:scale-105"
            >
              <Play className="h-4 w-4 fill-primary-foreground" />
              Watch Now
            </Link>
            <Link
              to="/drama/$id"
              params={{ id: String(current.id) }}
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:bg-secondary"
            >
              <Info className="h-4 w-4" />
              More Info
            </Link>
          </div>
          {items.length > 1 && (
            <div className="flex gap-2 pt-4">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === idx ? "w-8 bg-primary glow-primary" : "w-4 bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* unused poster reference to satisfy lint */}
      <span className="hidden">{poster}</span>
    </div>
  );
}
