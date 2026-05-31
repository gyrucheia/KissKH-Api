import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Play, Star } from "lucide-react";
import { g as getPoster } from "./kisskh-api-ByVGp9Uk.js";
function DramaCard({ drama }) {
  const poster = getPoster(drama);
  const id = String(drama.id);
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: "/drama/$id",
      params: { id },
      className: "group relative block w-[160px] sm:w-[180px] md:w-[200px] shrink-0",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative aspect-[2/3] overflow-hidden rounded-md border border-border bg-card shadow-card transition-all duration-300 group-hover:scale-[1.03] group-hover:border-primary", children: [
          poster ? /* @__PURE__ */ jsx(
            "img",
            {
              src: poster,
              alt: drama.title,
              loading: "lazy",
              className: "h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            }
          ) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-hero text-4xl font-bold text-primary-foreground", children: drama.title?.[0] ?? "?" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-card opacity-80" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-end justify-center pb-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100", children: /* @__PURE__ */ jsxs("div", { className: "glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground", children: [
            /* @__PURE__ */ jsx(Play, { className: "h-4 w-4 fill-primary text-primary" }),
            "Watch"
          ] }) }),
          drama.episode != null && /* @__PURE__ */ jsxs("div", { className: "absolute right-2 top-2 glass rounded-md px-2 py-1 text-xs font-semibold", children: [
            "EP ",
            drama.episode
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary", children: drama.title }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
            drama.country && /* @__PURE__ */ jsx("span", { children: drama.country }),
            drama.year && /* @__PURE__ */ jsxs("span", { children: [
              "· ",
              drama.year
            ] }),
            drama.status && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Star, { className: "h-3 w-3 text-primary" }),
              " ",
              drama.status
            ] })
          ] })
        ] })
      ]
    }
  );
}
function DramaCardSkeleton() {
  return /* @__PURE__ */ jsxs("div", { className: "w-[160px] shrink-0 sm:w-[180px] md:w-[200px]", children: [
    /* @__PURE__ */ jsx("div", { className: "aspect-[2/3] animate-pulse rounded-xl bg-card" }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-2", children: [
      /* @__PURE__ */ jsx("div", { className: "h-3 w-3/4 animate-pulse rounded bg-muted" }),
      /* @__PURE__ */ jsx("div", { className: "h-2 w-1/2 animate-pulse rounded bg-muted" })
    ] })
  ] });
}
export {
  DramaCard as D,
  DramaCardSkeleton as a
};
