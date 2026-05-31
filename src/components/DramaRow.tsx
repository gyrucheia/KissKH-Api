import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DramaCard, DramaCardSkeleton } from "./DramaCard";
import type { DramaCard as TDrama } from "@/lib/kisskh-api";

interface Props {
  title: string;
  dramas?: TDrama[];
  loading?: boolean;
  error?: string | null;
}

export function DramaRow({ title, dramas, loading, error }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });
  };

  return (
    <section className="group/row relative space-y-4">
      <div className="flex items-center justify-between px-4 md:px-8">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          <span className="text-gradient">{title}</span>
        </h2>
        <div className="hidden gap-2 md:flex">
          <button
            onClick={() => scroll("left")}
            className="glass flex h-9 w-9 items-center justify-center rounded-full transition-all hover:glow-neon"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="glass flex h-9 w-9 items-center justify-center rounded-full transition-all hover:glow-neon"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error ? (
        <div className="mx-4 md:mx-8 rounded-xl glass p-6 text-sm text-muted-foreground">
          Couldn't load {title.toLowerCase()}. {error}
        </div>
      ) : (
        <div
          ref={ref}
          className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-4 md:px-8"
        >
          {loading || !dramas
            ? Array.from({ length: 8 }).map((_, i) => <DramaCardSkeleton key={i} />)
            : dramas.length === 0
              ? <p className="text-sm text-muted-foreground">No results.</p>
              : dramas.map((d) => <DramaCard key={String(d.id)} drama={d} />)}
        </div>
      )}
    </section>
  );
}
