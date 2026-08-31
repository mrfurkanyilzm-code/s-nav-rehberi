import { Link } from "@tanstack/react-router";
import { Home, CalendarDays, ClipboardList, BookOpen, BarChart3 } from "lucide-react";

const items = [
  { to: "/", label: "Ana Sayfa", icon: Home },
  { to: "/takvim", label: "Takvim", icon: CalendarDays },
  { to: "/program", label: "Program", icon: ClipboardList },
  { to: "/konular", label: "Konular", icon: BookOpen },
  { to: "/analitik", label: "Analitik", icon: BarChart3 },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <ul className="mx-auto grid max-w-md grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="min-w-0">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center gap-1 py-3 text-[10px] font-medium text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              <span className="w-full truncate text-center">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Screen({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="mx-auto max-w-md px-5 pt-8">
        <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {action}
        </header>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-7 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <h2 className="truncate text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {children}
      </h2>
      {right}
    </div>
  );
}
