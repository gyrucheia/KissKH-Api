import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { DramaCard, DramaCardSkeleton } from "@/components/DramaCard";
import { api } from "@/lib/kisskh-api";
import { SearchX } from "lucide-react";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Search · DramaWave" }] }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();

  const { data, isLoading, error } = useQuery({
    queryKey: ["search", q],
    queryFn: () => api.search(q),
    enabled: q.length > 0,
    retry: 1,
  });

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8 space-y-2">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Search results</p>
        <h1 className="text-3xl font-bold md:text-5xl">
          {q ? (
            <>
              <span className="text-muted-foreground">for </span>
              <span className="text-gradient">"{q}"</span>
            </>
          ) : (
            <span className="text-gradient">Start searching</span>
          )}
        </h1>
      </div>

      {!q && (
        <p className="text-muted-foreground">Use the search bar above to find a drama.</p>
      )}

      {q && isLoading && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-full"><DramaCardSkeleton /></div>
          ))}
        </div>
      )}

      {q && error && (
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-lg font-semibold">Search failed</p>
          <p className="mt-1 text-sm text-muted-foreground">{(error as Error).message}</p>
        </div>
      )}

      {q && data && data.length === 0 && (
        <div className="glass mx-auto max-w-md rounded-xl p-10 text-center">
          <SearchX className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-semibold">No dramas found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different keyword or check the spelling.
          </p>
        </div>
      )}

      {q && data && data.length > 0 && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {data.map((d) => (
            <div key={String(d.id)} className="w-full">
              <DramaCard drama={d} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
