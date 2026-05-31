import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useNavigate, useRouterState, Link, createRootRouteWithContext, useRouter, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Sun, Moon, Tv, Search } from "lucide-react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
const appCss = "/assets/styles-9jc9T9ur.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const KEY = "dramawave-theme";
function applyTheme(t) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(t);
}
function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const stored = localStorage.getItem(KEY) ?? "dark";
    setTheme(stored);
    applyTheme(stored);
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(KEY, next);
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: toggle,
      "aria-label": `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
      className: "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary",
      children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4" })
    }
  );
}
function Header() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate({ to: "/search", search: { q: term } });
  };
  const isPlayer = path.startsWith("/watch");
  if (isPlayer) return null;
  return /* @__PURE__ */ jsx(
    "header",
    {
      className: `sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur border-b border-border" : "bg-gradient-to-b from-background to-transparent"}`,
      children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 md:gap-8 md:px-8 md:py-4", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-md bg-primary", children: /* @__PURE__ */ jsx(Tv, { className: "h-5 w-5 text-primary-foreground" }) }),
          /* @__PURE__ */ jsxs("span", { className: "hidden text-xl font-bold tracking-tight text-foreground md:inline", children: [
            "Drama",
            /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Wave" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "hidden items-center gap-6 text-sm font-medium md:flex", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/",
              activeOptions: { exact: true },
              activeProps: { className: "text-foreground" },
              className: "text-muted-foreground transition hover:text-foreground",
              children: "Home"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/browse",
              activeProps: { className: "text-foreground" },
              className: "text-muted-foreground transition hover:text-foreground",
              children: "Browse"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("form", { onSubmit: submit, className: "ml-auto flex-1 max-w-md", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 transition focus-within:border-primary", children: [
          /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "search",
              value: q,
              onChange: (e) => setQ(e.target.value),
              placeholder: "Search dramas, titles, actors...",
              className: "w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx(ThemeToggle, {})
      ] })
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-gradient", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-full bg-gradient-hero px-6 py-2.5 text-sm font-semibold text-primary-foreground glow-primary",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong. Try refreshing or head home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "rounded-full bg-gradient-hero px-5 py-2 text-sm font-semibold text-primary-foreground glow-primary",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "glass rounded-full px-5 py-2 text-sm font-semibold",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$5 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DramaWave — Stream Asian Dramas" },
      {
        name: "description",
        content: "Stream the best Korean, Chinese, Japanese, and Thai dramas with HD video and subtitles."
      },
      { property: "og:title", content: "DramaWave — Stream Asian Dramas" },
      { property: "og:description", content: "The modern home for Asian drama streaming." },
      { property: "og:type", content: "website" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "dark", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx(HeadContent, {}),
      /* @__PURE__ */ jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `(function(){try{var t=localStorage.getItem('dramawave-theme')||'dark';document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(t);}catch(e){}})();`
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$5.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx(Outlet, {})
  ] }) });
}
const $$splitComponentImporter$4 = () => import("./search-DLx1Ml7I.js");
const searchSchema = z.object({
  q: fallback(z.string(), "").default("")
});
const Route$4 = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [{
      title: "Search · DramaWave"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./browse-DEaHVV_5.js");
const Route$3 = createFileRoute("/browse")({
  head: () => ({
    meta: [{
      title: "Browse · DramaWave"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./index-CKuCJex7.js");
const Route$2 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "DramaWave — Stream Asian Dramas in HD"
    }, {
      name: "description",
      content: "Watch trending K-dramas, C-dramas, J-dramas and Thai dramas. HD streaming, subtitles, and new episodes daily."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./drama._id-vpfziJS9.js");
const Route$1 = createFileRoute("/drama/$id")({
  head: () => ({
    meta: [{
      title: "Drama · DramaWave"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./watch._dramaId._episodeId-CY9ui8XC.js");
const Route = createFileRoute("/watch/$dramaId/$episodeId")({
  head: () => ({
    meta: [{
      title: "Watch · DramaWave"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SearchRoute = Route$4.update({
  id: "/search",
  path: "/search",
  getParentRoute: () => Route$5
});
const BrowseRoute = Route$3.update({
  id: "/browse",
  path: "/browse",
  getParentRoute: () => Route$5
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$5
});
const DramaIdRoute = Route$1.update({
  id: "/drama/$id",
  path: "/drama/$id",
  getParentRoute: () => Route$5
});
const WatchDramaIdEpisodeIdRoute = Route.update({
  id: "/watch/$dramaId/$episodeId",
  path: "/watch/$dramaId/$episodeId",
  getParentRoute: () => Route$5
});
const rootRouteChildren = {
  IndexRoute,
  BrowseRoute,
  SearchRoute,
  DramaIdRoute,
  WatchDramaIdEpisodeIdRoute
};
const routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$4 as R,
  Route$1 as a,
  Route as b,
  router as r
};
