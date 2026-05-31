import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ListVideo } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { a as api, g as getPoster } from "./kisskh-api-ByVGp9Uk.js";
import Hls from "hls.js";
import { b as Route } from "./router-CFLhNw2M.js";
import "@tanstack/zod-adapter";
import "zod";
function VideoPlayer({ src, subtitles = [], poster }) {
  const videoRef = useRef(null);
  const [activeSub, setActiveSub] = useState(null);
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
    return /* @__PURE__ */ jsx("div", { className: "flex aspect-video w-full items-center justify-center rounded-xl bg-card", children: /* @__PURE__ */ jsxs("div", { className: "text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-2 text-lg font-semibold", children: "Stream unavailable" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: "We couldn't resolve a playable source for this episode." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full overflow-hidden rounded-xl bg-black shadow-card", children: [
    /* @__PURE__ */ jsx(
      "video",
      {
        ref: videoRef,
        controls: true,
        poster,
        crossOrigin: "anonymous",
        className: "aspect-video w-full",
        children: subtitles.map((s, i) => /* @__PURE__ */ jsx(
          "track",
          {
            kind: "subtitles",
            src: s.url,
            srcLang: s.lang ?? "en",
            label: s.label ?? s.lang ?? `Sub ${i + 1}`,
            default: activeSub === s.url
          },
          i
        ))
      }
    ),
    subtitles.length > 0 && /* @__PURE__ */ jsxs("div", { className: "absolute right-4 top-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowSubMenu((v) => !v),
          className: "glass rounded-full px-3 py-1.5 text-xs font-medium transition hover:glow-neon",
          children: "CC"
        }
      ),
      showSubMenu && /* @__PURE__ */ jsxs("div", { className: "glass absolute right-0 mt-2 w-44 rounded-lg p-2 text-sm shadow-card", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setActiveSub(null);
              setShowSubMenu(false);
            },
            className: `block w-full rounded px-3 py-2 text-left transition hover:bg-secondary ${!activeSub ? "text-primary" : ""}`,
            children: "Off"
          }
        ),
        subtitles.map((s, i) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setActiveSub(s.url);
              setShowSubMenu(false);
            },
            className: `block w-full rounded px-3 py-2 text-left transition hover:bg-secondary ${activeSub === s.url ? "text-primary" : ""}`,
            children: s.label ?? s.lang ?? `Subtitle ${i + 1}`
          },
          i
        ))
      ] })
    ] })
  ] });
}
function WatchPage() {
  const {
    dramaId,
    episodeId
  } = Route.useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const info = useQuery({
    queryKey: ["info", dramaId],
    queryFn: () => api.info(dramaId),
    retry: 1
  });
  const stream = useQuery({
    queryKey: ["resolve", episodeId],
    queryFn: () => api.resolve(episodeId),
    retry: 1
  });
  const drama = info.data;
  const episodes = drama?.episodes ?? [];
  const currentEp = episodes.find((e) => String(e.id) === episodeId);
  const resolved = stream.data;
  const src = resolved?.hls || resolved?.url || resolved?.src || (typeof resolved === "object" && resolved ? Object.values(resolved).find((v) => typeof v === "string" && (v.includes(".m3u8") || v.includes(".mp4"))) : void 0);
  const subs = resolved?.subtitles ?? [];
  return /* @__PURE__ */ jsxs("main", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxs("header", { className: "glass sticky top-0 z-40 flex items-center justify-between gap-4 px-4 py-3 md:px-8", children: [
      /* @__PURE__ */ jsxs("button", { onClick: () => navigate({
        to: "/drama/$id",
        params: {
          id: dramaId
        }
      }), className: "flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Back"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "line-clamp-1 text-sm font-semibold", children: [
        drama?.title,
        currentEp && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
          " · EP ",
          currentEp.number ?? episodeId
        ] })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => setSidebarOpen((v) => !v), className: "glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium lg:hidden", children: [
        /* @__PURE__ */ jsx(ListVideo, { className: "h-4 w-4" }),
        " Episodes"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 p-4 md:p-6 lg:grid-cols-[1fr_320px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        stream.isLoading ? /* @__PURE__ */ jsx("div", { className: "flex aspect-video w-full animate-pulse items-center justify-center rounded-xl bg-card", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Resolving stream…" }) }) : stream.error ? /* @__PURE__ */ jsx("div", { className: "flex aspect-video items-center justify-center rounded-xl glass", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: "Couldn't load stream" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: stream.error.message })
        ] }) }) : /* @__PURE__ */ jsx(VideoPlayer, { src, subtitles: subs, poster: getPoster(drama ?? void 0) }),
        drama && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold md:text-3xl", children: /* @__PURE__ */ jsx("span", { className: "text-gradient", children: drama.title }) }),
          currentEp && /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Episode ",
            currentEp.number ?? "?",
            " ",
            currentEp.title ? `· ${currentEp.title}` : ""
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: `${sidebarOpen ? "block" : "hidden"} glass rounded-xl p-4 lg:block`, children: [
        /* @__PURE__ */ jsxs("h2", { className: "mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsx(ListVideo, { className: "h-4 w-4" }),
          " Episodes"
        ] }),
        info.isLoading ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: Array.from({
          length: 8
        }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "h-12 animate-pulse rounded-lg bg-card" }, i)) }) : /* @__PURE__ */ jsx("div", { className: "scrollbar-hide max-h-[70vh] space-y-1.5 overflow-y-auto pr-1", children: episodes.map((ep) => {
          const active = String(ep.id) === episodeId;
          return /* @__PURE__ */ jsxs(Link, { to: "/watch/$dramaId/$episodeId", params: {
            dramaId,
            episodeId: String(ep.id)
          }, className: `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-gradient-hero text-primary-foreground glow-primary" : "hover:bg-secondary text-foreground"}`, children: [
            /* @__PURE__ */ jsxs("span", { className: `font-mono text-xs ${active ? "opacity-90" : "text-muted-foreground"}`, children: [
              "EP ",
              String(ep.number ?? "?").padStart(2, "0")
            ] }),
            ep.title && /* @__PURE__ */ jsx("span", { className: "line-clamp-1", children: ep.title })
          ] }, String(ep.id));
        }) })
      ] })
    ] })
  ] });
}
export {
  WatchPage as component
};
