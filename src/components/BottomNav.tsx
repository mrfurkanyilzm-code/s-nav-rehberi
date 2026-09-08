import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  CalendarDays,
  CalendarCheck2,
  BookOpen,
  LineChart,
  UserCheck,
  GraduationCap,
} from "lucide-react";

export function BottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Koç panelinde alt navigasyon gizlenir
  if (currentPath.startsWith("/koc-paneli")) {
    return null;
  }

  const items = [
    { to: "/", label: "Ana Sayfa", icon: Home },
    { to: "/takvim", label: "Takvim", icon: CalendarDays },
    { to: "/program", label: "Program", icon: CalendarCheck2 },
    { to: "/konular", label: "Konular", icon: BookOpen },
    { to: "/analitik", label: "Analitik", icon: LineChart },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = currentPath === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 text-[10px] font-medium transition ${
                active
                  ? "text-primary font-bold scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Screen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const routerState = useRouterState();
  const isCoach = routerState.location.pathname.startsWith("/koc-paneli");

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Üst Bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div
          className={`mx-auto flex items-center justify-between px-4 py-2.5 transition-all ${
            isCoach ? "max-w-5xl" : "max-w-md"
          }`}
        >
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
            )}
          </div>

          <div className="shrink-0 pl-2">
            {isCoach ? (
              <Link
                to="/program"
                className="flex items-center gap-1 rounded-xl border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary transition hover:bg-primary hover:text-primary-foreground active:scale-95"
              >
                <GraduationCap className="h-3 w-3" />
                <span>Öğrenci ➔</span>
              </Link>
            ) : (
              <Link
                to="/koc-paneli"
                className="flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1 text-[11px] font-bold text-muted-foreground transition hover:border-primary/50 hover:text-primary active:scale-95"
              >
                <UserCheck className="h-3 w-3 text-primary" />
                <span>Koç Paneli ➔</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Gövde Alanı: Öğrenci ekranında max-w-md (tam mobil uygulama eni), Koçta max-w-5xl */}
      <main
        className={`mx-auto px-4 pt-3 transition-all ${
          isCoach ? "max-w-5xl" : "max-w-md"
        }`}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}

export function SectionTitle({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-2 mt-4 flex items-center justify-between">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {children}
      </h2>
      {right}
    </div>
  );
}