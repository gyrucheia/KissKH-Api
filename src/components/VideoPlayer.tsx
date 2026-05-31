import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface Subtitle {
  url: string;
  lang?: string;
  label?: string;
}

interface Props {
  src?: string;
  subtitles?: Subtitle[];
  poster?: string;
}

export function VideoPlayer({ src, subtitles = [], poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [showSubMenu, setShowSubMenu] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const isHls = src.includes(".m3u8");
    if (isHls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
    video.src = src;
  }, [src]);

  if (!src) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-card">
        <div className="text-center text-muted-foreground">
          <div className="mb-2 text-lg font-semibold">Stream unavailable</div>
          <p className="text-sm">We couldn't resolve a playable source for this episode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-card">
      <video
        ref={videoRef}
        controls
        poster={poster}
        crossOrigin="anonymous"
        className="aspect-video w-full"
      >
        {subtitles.map((s, i) => (
          <track
            key={i}
            kind="subtitles"
            src={s.url}
            srcLang={s.lang ?? "en"}
            label={s.label ?? s.lang ?? `Sub ${i + 1}`}
            default={activeSub === s.url}
          />
        ))}
      </video>

      {subtitles.length > 0 && (
        <div className="absolute right-4 top-4">
          <button
            onClick={() => setShowSubMenu((v) => !v)}
            className="glass rounded-full px-3 py-1.5 text-xs font-medium transition hover:glow-neon"
          >
            CC
          </button>
          {showSubMenu && (
            <div className="glass absolute right-0 mt-2 w-44 rounded-lg p-2 text-sm shadow-card">
              <button
                onClick={() => {
                  setActiveSub(null);
                  setShowSubMenu(false);
                }}
                className={`block w-full rounded px-3 py-2 text-left transition hover:bg-secondary ${
                  !activeSub ? "text-primary" : ""
                }`}
              >
                Off
              </button>
              {subtitles.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveSub(s.url);
                    setShowSubMenu(false);
                  }}
                  className={`block w-full rounded px-3 py-2 text-left transition hover:bg-secondary ${
                    activeSub === s.url ? "text-primary" : ""
                  }`}
                >
                  {s.label ?? s.lang ?? `Subtitle ${i + 1}`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
