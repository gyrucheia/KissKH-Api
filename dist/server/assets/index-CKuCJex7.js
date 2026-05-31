import { jsxs, jsx } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { g as getPoster, a as api } from "./kisskh-api-ByVGp9Uk.js";
import { a as DramaCardSkeleton, D as DramaCard } from "./DramaCard-fRbYqTa5.js";
function Hero({ dramas, loading }) {
  const [idx, setIdx] = useState(0);
  const items = (dramas ?? []).slice(0, 5);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 6500);
    return () => clearInterval(t);
  }, [items.length]);
  if (loading || items.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "relative h-[68vh] min-h-[460px] w-full overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 animate-pulse bg-gradient-to-br from-card to-background" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-card" })
    ] });
  }
  const current = items[idx];
  const poster = getPoster(current);
  return /* @__PURE__ */ jsxs("div", { className: "relative h-[68vh] min-h-[480px] w-full overflow-hidden", children: [
    items.map((d, i) => /* @__PURE__ */ jsx(
      "img",
      {
        src: getPoster(d),
        alt: "",
        "aria-hidden": true,
        className: `absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === idx ? "opacity-100" : "opacity-0"}`
      },
      String(d.id)
    )),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" }),
    /* @__PURE__ */ jsx("div", { className: "relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-16 md:px-8 md:pb-24", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-sm bg-primary/15 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-primary", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-primary" }),
        "FEATURED NOW FEATURED NOW"
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold leading-[1.05] text-foreground md:text-6xl lg:text-7xl", children: current.title }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 text-sm text-muted-foreground", children: [
        current.country && /* @__PURE__ */ jsx("span", { children: current.country }),
        current.year && /* @__PURE__ */ jsxs("span", { children: [
          "· ",
          current.year
        ] }),
        current.status && /* @__PURE__ */ jsxs("span", { children: [
          "· ",
          current.status
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "line-clamp-3 max-w-xl text-base text-muted-foreground md:text-lg", children: current.description || "Discover this trending Asian drama — stream now with high-quality video and subtitles." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 pt-2", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/drama/$id",
            params: { id: String(current.id) },
            className: "inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 text-sm font-semibold text-primary-foreground glow-primary transition hover:scale-105",
            children: [
              /* @__PURE__ */ jsx(Play, { className: "h-4 w-4 fill-primary-foreground" }),
              "Watch Now"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/drama/$id",
            params: { id: String(current.id) },
            className: "glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:bg-secondary",
            children: [
              /* @__PURE__ */ jsx(Info, { className: "h-4 w-4" }),
              "More Info"
            ]
          }
        )
      ] }),
      items.length > 1 && /* @__PURE__ */ jsx("div", { className: "flex gap-2 pt-4", children: items.map((_, i) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setIdx(i),
          "aria-label": `Slide ${i + 1}`,
          className: `h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-primary glow-primary" : "w-4 bg-muted"}`
        },
        i
      )) })
    ] }) }),
    /* @__PURE__ */ jsx("span", { className: "hidden", children: poster })
  ] });
}
function DramaRow({ title, dramas, loading, error }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });
  };
  return /* @__PURE__ */ jsxs("section", { className: "group/row relative space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 md:px-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold tracking-tight md:text-3xl", children: /* @__PURE__ */ jsx("span", { className: "text-gradient", children: title }) }),
      /* @__PURE__ */ jsxs("div", { className: "hidden gap-2 md:flex", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => scroll("left"),
            className: "glass flex h-9 w-9 items-center justify-center rounded-full transition-all hover:glow-neon",
            "aria-label": "Scroll left",
            children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => scroll("right"),
            className: "glass flex h-9 w-9 items-center justify-center rounded-full transition-all hover:glow-neon",
            "aria-label": "Scroll right",
            children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }),
    error ? /* @__PURE__ */ jsxs("div", { className: "mx-4 md:mx-8 rounded-xl glass p-6 text-sm text-muted-foreground", children: [
      "Couldn't load ",
      title.toLowerCase(),
      ". ",
      error
    ] }) : /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        className: "scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-4 md:px-8",
        children: loading || !dramas ? Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsx(DramaCardSkeleton, {}, i)) : dramas.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No results." }) : dramas.map((d) => /* @__PURE__ */ jsx(DramaCard, { drama: d }, String(d.id)))
      }
    )
  ] });
}
function useRow(key, fn) {
  return useQuery({
    queryKey: [key],
    queryFn: fn,
    retry: 1,
    staleTime: 1e3 * 60 * 5
  });
}
function HomePage() {
  const popular = useRow("popular", () => api.popular(1, 18));
  const lastUpdates = useRow("last-updates", () => api.lastUpdates());
  useRow("latest", () => api.latest(1, 18));
  const newest = useRow("new", () => api.newest(1, 18));
  const ongoing = useRow("ongoing", () => api.ongoing(1, 18));
  const completed = useRow("completed", () => api.completed(1, 18));
  return /* @__PURE__ */ jsxs("main", { className: "-mt-[72px]", children: [
    /* @__PURE__ */ jsx(Hero, { dramas: popular.data, loading: popular.isLoading }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1600px] space-y-12 py-12", children: [
      /* @__PURE__ */ jsx(DramaRow, { title: "Trending Now", dramas: popular.data, loading: popular.isLoading, error: popular.error ? popular.error.message : null }),
      /* @__PURE__ */ jsx(DramaRow, { title: "Latest Updates", dramas: lastUpdates.data, loading: lastUpdates.isLoading, error: lastUpdates.error ? lastUpdates.error.message : null }),
      /* @__PURE__ */ jsx(DramaRow, { title: "New Arrivals", dramas: newest.data, loading: newest.isLoading, error: newest.error ? newest.error.message : null }),
      /* @__PURE__ */ jsx(DramaRow, { title: "Currently Airing", dramas: ongoing.data, loading: ongoing.isLoading, error: ongoing.error ? ongoing.error.message : null }),
      /* @__PURE__ */ jsx(DramaRow, { title: "Complete Series", dramas: completed.data, loading: completed.isLoading, error: completed.error ? completed.error.message : null })
    ] }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border py-8 text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsx("p", { children: "DramaWave · Powered by KissKH" }) })
  ] });
}
export {
  HomePage as component
};
