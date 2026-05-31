import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DramaCard, DramaCardSkeleton } from "@/components/DramaCard";
import { api } from "@/lib/kisskh-api";
import { useState } from "react";

export const Route = createFileRoute("/browse")({
  head: () => ({ meta: [{ title: "Browse · DramaWave" }] }),
  component: BrowsePage,
});

const COUNTRIES = [
  { v: 0, label: "All" },
  { v: 1, label: "Korea" },
  { v: 2, label: "China" },
  { v: 3, label: "Japan" },
  { v: 4, label: "Thailand" },
  { v: 5, label: "Other" },
];

const SORTS = [
  { v: "popular", label: "Popular" },
  { v: "latest", label: "Latest" },
  { v: "new", label: "New" },
  { v: "ongoing", label: "Ongoing" },
  { v: "completed", label: "Completed" },
];

function BrowsePage() {
  const [country, setCountry] = useState(0);
  const [sort, setSort] = useState("popular");

  const { data, isLoading, error } = useQuery({
    queryKey: ["browse", sort, country],
    queryFn: () => {
      switch (sort) {
        case "latest": return api.latest(1, 36);
        case "new": return api.newest(1, 36);
        case "ongoing": return api.ongoing(1, 36, country);
        case "completed": return api.completed(1, 36, country);
        default: return api.popular(1, 36);
      }
    },
    retry: 1,
  });

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8 space-y-2">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Discover</p>
        <h1 className="text-4xl font-bold md:text-5xl"><span className="text-gradient">Browse Dramas</span></h1>
      </div>

      <div className="mb-8 flex flex-wrap gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Sort</p>
          <div className="flex flex-wrap gap-2">
            {SORTS.map((s) => (
              <button
                key={s.v}
                onClick={() => setSort(s.v)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  sort === s.v
                    ? "bg-gradient-hero text-primary-foreground glow-primary"
                    : "glass hover:bg-secondary"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {(sort === "ongoing" || sort === "completed") && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Country</p>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c.v}
                  onClick={() => setCountry(c.v)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    country === c.v
                      ? "bg-neon text-neon-foreground glow-neon"
                      : "glass hover:bg-secondary"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error ? (
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-lg font-semibold">Couldn't load dramas</p>
          <p className="mt-1 text-sm text-muted-foreground">{(error as Error).message}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {isLoading
            ? Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="w-full"><DramaCardSkeleton /></div>
              ))
            : (data ?? []).map((d) => (
                <div key={String(d.id)} className="w-full">
                  <DramaCard drama={d} />
                </div>
              ))}
        </div>
      )}
    </main>
  );
}
