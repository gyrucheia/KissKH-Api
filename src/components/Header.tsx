import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, Tv } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate({ to: "/search", search: { q: term } });
  };

  const isPlayer = path.startsWith("/watch");
  if (isPlayer) return null;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur border-b border-border" : "bg-gradient-to-b from-background to-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 md:gap-8 md:px-8 md:py-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <Tv className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden text-xl font-bold tracking-tight text-foreground md:inline">
            Drama<span className="text-primary">Wave</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground" }}
            className="text-muted-foreground transition hover:text-foreground"
          >
            Home
          </Link>
          <Link
            to="/browse"
            activeProps={{ className: "text-foreground" }}
            className="text-muted-foreground transition hover:text-foreground"
          >
            Browse
          </Link>
        </nav>

        <form onSubmit={submit} className="ml-auto flex-1 max-w-md">
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 transition focus-within:border-primary">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search dramas, titles, actors..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </form>

        <ThemeToggle />
      </div>
    </header>
  );
}
