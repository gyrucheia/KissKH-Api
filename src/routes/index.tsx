import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { DramaRow } from "@/components/DramaRow";
import { api } from "@/lib/kisskh-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DramaWave — Stream Asian Dramas in HD" },
      {
        name: "description",
        content: "Watch trending K-dramas, C-dramas, J-dramas and Thai dramas. HD streaming, subtitles, and new episodes daily.",
      },
    ],
  }),
  component: HomePage,
});

function useRow(key: string, fn: () => Promise<unknown[]>) {
  return useQuery({
    queryKey: [key],
    queryFn: fn,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
}

function HomePage() {
  const popular = useRow("popular", () => api.popular(1, 18));
  const lastUpdates = useRow("last-updates", () => api.lastUpdates());
  const latest = useRow("latest", () => api.latest(1, 18));
  const newest = useRow("new", () => api.newest(1, 18));
  const ongoing = useRow("ongoing", () => api.ongoing(1, 18));
  const completed = useRow("completed", () => api.completed(1, 18));

  return (
    <main className="-mt-[72px]">
      <Hero
        dramas={popular.data as never}
        loading={popular.isLoading}
      />
      <div className="mx-auto max-w-[1600px] space-y-12 py-12">
        <DramaRow
          title="Trending Now"
          dramas={popular.data as never}
          loading={popular.isLoading}
          error={popular.error ? (popular.error as Error).message : null}
        />
        <DramaRow
          title="Latest Updates"
          dramas={lastUpdates.data as never}
          loading={lastUpdates.isLoading}
          error={lastUpdates.error ? (lastUpdates.error as Error).message : null}
        />
        <DramaRow
          title="New Arrivals"
          dramas={newest.data as never}
          loading={newest.isLoading}
          error={newest.error ? (newest.error as Error).message : null}
        />
        <DramaRow
          title="Currently Airing"
          dramas={ongoing.data as never}
          loading={ongoing.isLoading}
          error={ongoing.error ? (ongoing.error as Error).message : null}
        />
        <DramaRow
          title="Complete Series"
          dramas={completed.data as never}
          loading={completed.isLoading}
          error={completed.error ? (completed.error as Error).message : null}
        />
      </div>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>DramaWave · Powered by KissKH</p>
      </footer>
    </main>
  );
}
