import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ListVideo } from "lucide-react";
import { useState } from "react";
import { api, getPoster } from "@/lib/kisskh-api";
import { VideoPlayer } from "@/components/VideoPlayer";

export const Route = createFileRoute("/watch/$dramaId/$episodeId")({
  head: () => ({ meta: [{ title: "Watch · DramaWave" }] }),
  component: WatchPage,
});

function WatchPage() {
  const { dramaId, episodeId } = Route.useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const info = useQuery({
    queryKey: ["info", dramaId],
    queryFn: () => api.info(dramaId),
    retry: 1,
  });
  const stream = useQuery({
    queryKey: ["resolve", episodeId],
    queryFn: () => api.resolve(episodeId),
    retry: 1,
  });

  const drama = info.data;
  const episodes = drama?.episodes ?? [];
  const currentEp = episodes.find((e) => String(e.id) === episodeId);

  const resolved = stream.data;
  const src =
    (resolved?.hls as string) ||
    (resolved?.url as string) ||
    (resolved?.src as string) ||
    (typeof resolved === "object" && resolved
      ? (Object.values(resolved).find(
          (v) => typeof v === "string" && (v.includes(".m3u8") || v.includes(".mp4")),
        ) as string | undefined)
      : undefined);

  const subs = (resolved?.subtitles ?? []) as Array<{ url: string; lang?: string; label?: string }>;

  return (
    <main className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-40 flex items-center justify-between gap-4 px-4 py-3 md:px-8">
        <button
          onClick={() => navigate({ to: "/drama/$id", params: { id: dramaId } })}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="line-clamp-1 text-sm font-semibold">
          {drama?.title}
          {currentEp && (
            <span className="text-muted-foreground"> · EP {currentEp.number ?? episodeId}</span>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium lg:hidden"
        >
          <ListVideo className="h-4 w-4" /> Episodes
        </button>
      </header>

      <div className="grid gap-4 p-4 md:p-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {stream.isLoading ? (
            <div className="flex aspect-video w-full animate-pulse items-center justify-center rounded-xl bg-card">
              <span className="text-muted-foreground">Resolving stream…</span>
            </div>
          ) : stream.error ? (
            <div className="flex aspect-video items-center justify-center rounded-xl glass">
              <div className="text-center">
                <p className="text-lg font-semibold">Couldn't load stream</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {(stream.error as Error).message}
                </p>
              </div>
            </div>
          ) : (
            <VideoPlayer src={src} subtitles={subs} poster={getPoster(drama ?? undefined)} />
          )}

          {drama && (
            <div className="space-y-2">
              <h1 className="text-2xl font-bold md:text-3xl">
                <span className="text-gradient">{drama.title}</span>
              </h1>
              {currentEp && (
                <p className="text-sm text-muted-foreground">
                  Episode {currentEp.number ?? "?"} {currentEp.title ? `· ${currentEp.title}` : ""}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Episode sidebar */}
        <aside
          className={`${sidebarOpen ? "block" : "hidden"} glass rounded-xl p-4 lg:block`}
        >
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <ListVideo className="h-4 w-4" /> Episodes
          </h2>
          {info.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-card" />
              ))}
            </div>
          ) : (
            <div className="scrollbar-hide max-h-[70vh] space-y-1.5 overflow-y-auto pr-1">
              {episodes.map((ep) => {
                const active = String(ep.id) === episodeId;
                return (
                  <Link
                    key={String(ep.id)}
                    to="/watch/$dramaId/$episodeId"
                    params={{ dramaId, episodeId: String(ep.id) }}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-gradient-hero text-primary-foreground glow-primary"
                        : "hover:bg-secondary text-foreground"
                    }`}
                  >
                    <span className={`font-mono text-xs ${active ? "opacity-90" : "text-muted-foreground"}`}>
                      EP {String(ep.number ?? "?").padStart(2, "0")}
                    </span>
                    {ep.title && <span className="line-clamp-1">{ep.title}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
