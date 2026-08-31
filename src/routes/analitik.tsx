import { createFileRoute } from "@tanstack/react-router";
import { Screen, SectionTitle } from "@/components/BottomNav";
import { TrendingUp } from "lucide-react";
import { useMockEvents, useTopics } from "@/lib/data";

export const Route = createFileRoute("/analitik")({
  head: () => ({
    meta: [
      { title: "Deneme Analitiği — Net ve Sıralama Takibi" },
      {
        name: "description",
        content: "Türkiye Geneli denemelerinde net gelişimini, sıralamanı ve ders bazlı performansını izle.",
      },
      { property: "og:title", content: "Deneme Analitiği — Net ve Sıralama Takibi" },
      {
        property: "og:description",
        content: "Deneme netleri, sıralama gelişimi ve ders bazlı analiz.",
      },
    ],
  }),
  component: Analitik,
});

function Analitik() {
  const { data: events = [], isLoading } = useMockEvents();
  const { data: topics = [] } = useTopics();

  const denemeler = events.filter((e) => e.status === "tamamlandi" && e.net !== null).slice(0, 4);
  const max = Math.max(1, ...denemeler.map((d) => Number(d.net)));
  const ortalama = denemeler.length
    ? (denemeler.reduce((t, d) => t + Number(d.net), 0) / denemeler.length).toFixed(1).replace(".", ",")
    : "—";

  const dersler = Array.from(new Set(topics.map((t) => t.subject))).map((ders) => {
    const list = topics.filter((t) => t.subject === ders);
    return {
      ad: ders,
      dogru: list.reduce((t, k) => t + k.correct_count, 0),
      yanlis: list.reduce((t, k) => t + k.wrong_count, 0),
      bos: list.reduce((t, k) => t + k.blank_count, 0),
    };
  });

  return (
    <Screen title="Deneme Analitiği" subtitle="Son Türkiye Geneli denemelerin">
      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-success" /> Ortalama net
        </div>
        <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
          {isLoading ? "—" : ortalama}
        </p>
        <div className="mt-5 flex h-32 items-end gap-3">
          {denemeler.map((d) => (
            <div key={d.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-xl bg-primary"
                style={{ height: `${(Number(d.net) / max) * 100}%` }}
              />
              <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                {d.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      <SectionTitle>Deneme Sonuçları</SectionTitle>
      <ul className="space-y-2">
        {denemeler.map((d) => (
          <li
            key={d.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{d.name}</p>
              <p className="text-xs text-muted-foreground">Sıralama: {d.rank ?? "—"}</p>
            </div>
            <span className="shrink-0 text-lg font-bold tabular-nums text-primary">
              {Number(d.net)}
            </span>
          </li>
        ))}
      </ul>

      <SectionTitle>Ders Bazlı Dağılım</SectionTitle>
      <ul className="space-y-2">
        {dersler.map((d) => {
          const toplam = Math.max(1, d.dogru + d.yanlis + d.bos);
          return (
            <li key={d.ad} className="rounded-2xl border border-border bg-card p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                <p className="truncate text-sm font-medium text-foreground">{d.ad}</p>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {d.dogru}D · {d.yanlis}Y · {d.bos}B
                </p>
              </div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-muted">
                <div className="bg-success" style={{ width: `${(d.dogru / toplam) * 100}%` }} />
                <div className="bg-destructive" style={{ width: `${(d.yanlis / toplam) * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}
