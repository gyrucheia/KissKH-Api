import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { a as DramaCardSkeleton, D as DramaCard } from "./DramaCard-fRbYqTa5.js";
import { a as api } from "./kisskh-api-ByVGp9Uk.js";
import { SearchX } from "lucide-react";
import { R as Route } from "./router-CFLhNw2M.js";
import "@tanstack/react-router";
import "react";
import "@tanstack/zod-adapter";
import "zod";
function SearchPage() {
  const {
    q
  } = Route.useSearch();
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["search", q],
    queryFn: () => api.search(q),
    enabled: q.length > 0,
    retry: 1
  });
  return /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-[1600px] px-4 py-8 md:px-8 md:py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-widest text-muted-foreground", children: "Search results" }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold md:text-5xl", children: q ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "for " }),
        /* @__PURE__ */ jsxs("span", { className: "text-gradient", children: [
          '"',
          q,
          '"'
        ] })
      ] }) : /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Start searching" }) })
    ] }),
    !q && /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Use the search bar above to find a drama." }),
    q && isLoading && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6", children: Array.from({
      length: 12
    }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(DramaCardSkeleton, {}) }, i)) }),
    q && error && /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl p-8 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: "Search failed" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: error.message })
    ] }),
    q && data && data.length === 0 && /* @__PURE__ */ jsxs("div", { className: "glass mx-auto max-w-md rounded-xl p-10 text-center", children: [
      /* @__PURE__ */ jsx(SearchX, { className: "mx-auto mb-4 h-12 w-12 text-muted-foreground" }),
      /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: "No dramas found" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Try a different keyword or check the spelling." })
    ] }),
    q && data && data.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6", children: data.map((d) => /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(DramaCard, { drama: d }) }, String(d.id))) })
  ] });
}
export {
  SearchPage as component
};
