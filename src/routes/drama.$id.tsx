import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Play, Calendar, Globe, Clapperboard } from "lucide-react";
import { api, getPoster } from "@/lib/kisskh-api";

export const Route = createFileRoute("/drama/$id")({
  head: () => ({ meta: [{ title: "Drama · DramaWave" }] }),
  component: DramaDetail,
});

function DramaDetail() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["info", id],
    queryFn: () => api.info(id),
    retry: 1,
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1600px] px-4 py-8 md:px-8">
        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          <div className="aspect-[2/3] w-full animate-pulse rounded-2xl bg-card" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 animate-pulse rounded bg-card" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-32 w-full animate-pulse rounded bg-card" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="glass rounded-xl p-8">
          <p className="text-lg font-semibold">Couldn't load this drama</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {(error as Error)?.message ?? "Unknown error"}
          </p>
        </div>
      </main>
    );
  }

  const poster = getPoster(data);
  const episodes = data.episodes ?? [];
  const description = data.description || data.synopsis || "No synopsis available.";

  return (
    <main>
      {/* Backdrop */}
      <div className="relative h-[40vh] min-h-[280px] w-full overflow-hidden -mt-[72px]">
        {poster && (
          <img
            src={poster}
            alt=""
            aria-hidden
            className="h-full w-full scale-110 object-cover blur-2xl opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
      </div>

      <div className="mx-auto -mt-40 max-w-[1600px] px-4 pb-16 md:px-8">
        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <div className="relative">
            <div className="aspect-[2/3] overflow-hidden rounded-2xl shadow-card glow-primary">
              {poster ? (
                <img src={poster} alt={data.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-hero text-6xl font-bold">
                  {data.title?.[0]}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                <span className="text-gradient">{data.title}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {data.country && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4" /> {data.country}
                  </span>
                )}
                {data.year && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> {data.year}
                  </span>
                )}
                {data.status && (
                  <span className="rounded-sm bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    {data.status}
                  </span>
                )}
                {episodes.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clapperboard className="h-4 w-4" /> {episodes.length} episodes
                  </span>
                )}
              </div>
            </div>

            {data.genres && data.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.genres.map((g) => (
                  <span key={g} className="glass rounded-full px-3 py-1 text-xs font-medium">
                    {g}
                  </span>
                ))}
              </div>
            )}

            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {description}
            </p>

            {episodes[0] && (
              <Link
                to="/watch/$dramaId/$episodeId"
                params={{ dramaId: String(data.id), episodeId: String(episodes[0].id) }}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 text-sm font-semibold text-primary-foreground glow-primary transition hover:scale-105"
              >
                <Play className="h-4 w-4 fill-primary-foreground" /> Play Episode 1
              </Link>
            )}
          </div>
        </div>

        {/* Episodes */}
        {episodes.length > 0 && (
          <section className="mt-16 space-y-6">
            <h2 className="text-2xl font-bold md:text-3xl">
              <span className="text-gradient">Episodes</span>
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {episodes.map((ep) => (
                <Link
                  key={String(ep.id)}
                  to="/watch/$dramaId/$episodeId"
                  params={{ dramaId: String(data.id), episodeId: String(ep.id) }}
                  className="group glass aspect-square flex flex-col items-center justify-center rounded-xl transition-all hover:scale-105 hover:glow-neon"
                >
                  <span className="text-xs text-muted-foreground">EP</span>
                  <span className="text-xl font-bold text-foreground group-hover:text-primary">
                    {ep.number ?? "?"}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
