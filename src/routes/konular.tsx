import { createFileRoute } from "@tanstack/react-router";
import { Screen, SectionTitle } from "@/components/BottomNav";
import { useTopics } from "@/lib/data";

export const Route = createFileRoute("/konular")({
  head: () => ({
    meta: [
      { title: "Konu Hakimiyeti — Ders ve Konu Bazlı Seviye" },
      {
        name: "description",
        content: "Her ders ve konu için hakimiyet yüzdeni gör, eksik kaldığın konuları önceliklendir.",
      },
      { property: "og:title", content: "Konu Hakimiyeti — Ders ve Konu Bazlı Seviye" },
      {
        property: "og:description",
        content: "Konu bazlı hakimiyet yüzdeleri ve öncelikli tekrar listesi.",
      },
    ],
  }),
  component: Konular,
});

function renk(oran: number) {
  if (oran >= 75) return "bg-success";
  if (oran >= 50) return "bg-star";
  return "bg-destructive";
}

function Konular() {
  const { data: konular = [], isLoading } = useTopics();

  const dersler = Array.from(new Set(konular.map((k) => k.subject)));

  return (
    <Screen title="Konu Hakimiyeti" subtitle="Kırmızı konular öncelikli tekrar listende.">
      {isLoading ? <p className="text-sm text-muted-foreground">Yükleniyor…</p> : null}
      {dersler.map((ders) => (
        <div key={ders}>
          <SectionTitle>{ders}</SectionTitle>
          <ul className="space-y-2">
            {konular
              .filter((k) => k.subject === ders)
              .map((k) => (
                <li key={k.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <p className="truncate text-sm font-medium text-foreground">{k.topic}</p>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                      %{k.mastery}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${renk(k.mastery)}`}
                      style={{ width: `${k.mastery}%` }}
                    />
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </Screen>
  );
}
