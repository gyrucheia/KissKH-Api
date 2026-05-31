import { jsxs, jsx } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { a as DramaCardSkeleton, D as DramaCard } from "./DramaCard-fRbYqTa5.js";
import { a as api } from "./kisskh-api-ByVGp9Uk.js";
import { useState } from "react";
import "@tanstack/react-router";
import "lucide-react";
const COUNTRIES = [{
  v: 0,
  label: "All"
}, {
  v: 1,
  label: "Korea"
}, {
  v: 2,
  label: "China"
}, {
  v: 3,
  label: "Japan"
}, {
  v: 4,
  label: "Thailand"
}, {
  v: 5,
  label: "Other"
}];
const SORTS = [{
  v: "popular",
  label: "Popular"
}, {
  v: "latest",
  label: "Latest"
}, {
  v: "new",
  label: "New"
}, {
  v: "ongoing",
  label: "Ongoing"
}, {
  v: "completed",
  label: "Completed"
}];
function BrowsePage() {
  const [country, setCountry] = useState(0);
  const [sort, setSort] = useState("popular");
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["browse", sort, country],
    queryFn: () => {
      switch (sort) {
        case "latest":
          return api.latest(1, 36);
        case "new":
          return api.newest(1, 36);
        case "ongoing":
          return api.ongoing(1, 36, country);
        case "completed":
          return api.completed(1, 36, country);
        default:
          return api.popular(1, 36);
      }
    },
    retry: 1
  });
  return /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-[1600px] px-4 py-8 md:px-8 md:py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-widest text-muted-foreground", children: "Discover" }),
      /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold md:text-5xl", children: /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Browse Dramas" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 flex flex-wrap gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Sort" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: SORTS.map((s) => /* @__PURE__ */ jsx("button", { onClick: () => setSort(s.v), className: `rounded-full px-4 py-1.5 text-sm font-medium transition ${sort === s.v ? "bg-gradient-hero text-primary-foreground glow-primary" : "glass hover:bg-secondary"}`, children: s.label }, s.v)) })
      ] }),
      (sort === "ongoing" || sort === "completed") && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Country" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: COUNTRIES.map((c) => /* @__PURE__ */ jsx("button", { onClick: () => setCountry(c.v), className: `rounded-full px-4 py-1.5 text-sm font-medium transition ${country === c.v ? "bg-neon text-neon-foreground glow-neon" : "glass hover:bg-secondary"}`, children: c.label }, c.v)) })
      ] })
    ] }),
    error ? /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl p-8 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: "Couldn't load dramas" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: error.message })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6", children: isLoading ? Array.from({
      length: 18
    }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(DramaCardSkeleton, {}) }, i)) : (data ?? []).map((d) => /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(DramaCard, { drama: d }) }, String(d.id))) })
  ] });
}
export {
  BrowsePage as component
};
