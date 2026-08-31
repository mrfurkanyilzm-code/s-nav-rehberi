import { createFileRoute } from "@tanstack/react-router";
import { Screen, SectionTitle } from "@/components/BottomNav";
import { TrendingUp } from "lucide-react";

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

const denemeler = [
  { ad: "3D AYT-9", net: 62.5, siralama: 1420 },
  { ad: "345 TYT-3", net: 88.25, siralama: 980 },
  { ad: "Bilfen AYT-2", net: 58, siralama: 1810 },
  { ad: "3D TYT-10", net: 84.75, siralama: 1130 },
];

const dersler = [
  { ad: "Matematik", dogru: 32, yanlis: 6, bos: 2 },
  { ad: "Türkçe", dogru: 34, yanlis: 4, bos: 2 },
  { ad: "Tarih", dogru: 8, yanlis: 3, bos: 1 },
  { ad: "Coğrafya", dogru: 9, yanlis: 2, bos: 1 },
];

function Analitik() {
  const max = Math.max(...denemeler.map((d) => d.net));
  return (
    <Screen title="Deneme Analitiği" subtitle="Son 4 Türkiye Geneli denemen">
      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-success" /> Ortalama net
        </div>
        <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">73,4</p>
        <div className="mt-5 flex h-32 items-end gap-3">
          {denemeler.map((d) => (
            <div key={d.ad} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-xl bg-primary"
                style={{ height: `${(d.net / max) * 100}%` }}
              />
              <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                {d.ad}
              </span>
            </div>
          ))}
        </div>
      </section>

      <SectionTitle>Deneme Sonuçları</SectionTitle>
      <ul className="space-y-2">
        {denemeler.map((d) => (
          <li
            key={d.ad}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{d.ad}</p>
              <p className="text-xs text-muted-foreground">Sıralama: {d.siralama}</p>
            </div>
            <span className="shrink-0 text-lg font-bold tabular-nums text-primary">{d.net}</span>
          </li>
        ))}
      </ul>

      <SectionTitle>Ders Bazlı Dağılım</SectionTitle>
      <ul className="space-y-2">
        {dersler.map((d) => {
          const toplam = d.dogru + d.yanlis + d.bos;
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
