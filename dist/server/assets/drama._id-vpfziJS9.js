import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Globe, Calendar, Clapperboard, Play } from "lucide-react";
import { a as api, g as getPoster } from "./kisskh-api-ByVGp9Uk.js";
import { a as Route } from "./router-CFLhNw2M.js";
import "react";
import "@tanstack/zod-adapter";
import "zod";
function DramaDetail() {
  const {
    id
  } = Route.useParams();
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["info", id],
    queryFn: () => api.info(id),
    retry: 1
  });
  if (isLoading) {
    return /* @__PURE__ */ jsx("main", { className: "mx-auto max-w-[1600px] px-4 py-8 md:px-8", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-8 md:grid-cols-[300px_1fr]", children: [
      /* @__PURE__ */ jsx("div", { className: "aspect-[2/3] w-full animate-pulse rounded-2xl bg-card" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-3/4 animate-pulse rounded bg-card" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 w-1/2 animate-pulse rounded bg-muted" }),
        /* @__PURE__ */ jsx("div", { className: "h-32 w-full animate-pulse rounded bg-card" })
      ] })
    ] }) });
  }
  if (error || !data) {
    return /* @__PURE__ */ jsx("main", { className: "mx-auto max-w-md px-4 py-20 text-center", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl p-8", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: "Couldn't load this drama" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: error?.message ?? "Unknown error" })
    ] }) });
  }
  const poster = getPoster(data);
  const episodes = data.episodes ?? [];
  const description = data.description || data.synopsis || "No synopsis available.";
  return /* @__PURE__ */ jsxs("main", { children: [
    /* @__PURE__ */ jsxs("div", { className: "relative h-[40vh] min-h-[280px] w-full overflow-hidden -mt-[72px]", children: [
      poster && /* @__PURE__ */ jsx("img", { src: poster, alt: "", "aria-hidden": true, className: "h-full w-full scale-110 object-cover blur-2xl opacity-50" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto -mt-40 max-w-[1600px] px-4 pb-16 md:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-8 md:grid-cols-[280px_1fr]", children: [
        /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx("div", { className: "aspect-[2/3] overflow-hidden rounded-2xl shadow-card glow-primary", children: poster ? /* @__PURE__ */ jsx("img", { src: poster, alt: data.title, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center bg-gradient-hero text-6xl font-bold", children: data.title?.[0] }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6 pt-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold leading-tight md:text-6xl", children: /* @__PURE__ */ jsx("span", { className: "text-gradient", children: data.title }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-sm text-muted-foreground", children: [
              data.country && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4" }),
                " ",
                data.country
              ] }),
              data.year && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }),
                " ",
                data.year
              ] }),
              data.status && /* @__PURE__ */ jsx("span", { className: "rounded-sm bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary", children: data.status }),
              episodes.length > 0 && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Clapperboard, { className: "h-4 w-4" }),
                " ",
                episodes.length,
                " episodes"
              ] })
            ] })
          ] }),
          data.genres && data.genres.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: data.genres.map((g) => /* @__PURE__ */ jsx("span", { className: "glass rounded-full px-3 py-1 text-xs font-medium", children: g }, g)) }),
          /* @__PURE__ */ jsx("p", { className: "max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg", children: description }),
          episodes[0] && /* @__PURE__ */ jsxs(Link, { to: "/watch/$dramaId/$episodeId", params: {
            dramaId: String(data.id),
            episodeId: String(episodes[0].id)
          }, className: "inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 text-sm font-semibold text-primary-foreground glow-primary transition hover:scale-105", children: [
            /* @__PURE__ */ jsx(Play, { className: "h-4 w-4 fill-primary-foreground" }),
            " Play Episode 1"
          ] })
        ] })
      ] }),
      episodes.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mt-16 space-y-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold md:text-3xl", children: /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Episodes" }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8", children: episodes.map((ep) => /* @__PURE__ */ jsxs(Link, { to: "/watch/$dramaId/$episodeId", params: {
          dramaId: String(data.id),
          episodeId: String(ep.id)
        }, className: "group glass aspect-square flex flex-col items-center justify-center rounded-xl transition-all hover:scale-105 hover:glow-neon", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "EP" }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-foreground group-hover:text-primary", children: ep.number ?? "?" })
        ] }, String(ep.id))) })
      ] })
    ] })
  ] });
}
export {
  DramaDetail as component
};
