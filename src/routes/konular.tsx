import { createFileRoute } from "@tanstack/react-router";
import { Screen, SectionTitle } from "@/components/BottomNav";

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

const veri = [
  {
    ders: "Matematik",
    konular: [
      { ad: "Problemler", oran: 82 },
      { ad: "Fonksiyonlar", oran: 64 },
      { ad: "Türev", oran: 41 },
    ],
  },
  {
    ders: "Türkçe",
    konular: [
      { ad: "Paragraf", oran: 91 },
      { ad: "Dil Bilgisi", oran: 73 },
      { ad: "Sözcükte Anlam", oran: 86 },
    ],
  },
  {
    ders: "Sosyal",
    konular: [
      { ad: "İnkılap Tarihi", oran: 38 },
      { ad: "Nüfus ve Yerleşme", oran: 57 },
      { ad: "Felsefe", oran: 69 },
    ],
  },
];

function renk(oran: number) {
  if (oran >= 75) return "bg-success";
  if (oran >= 50) return "bg-star";
  return "bg-destructive";
}

function Konular() {
  return (
    <Screen title="Konu Hakimiyeti" subtitle="Kırmızı konular öncelikli tekrar listende.">
      {veri.map((grup) => (
        <div key={grup.ders}>
          <SectionTitle>{grup.ders}</SectionTitle>
          <ul className="space-y-2">
            {grup.konular.map((k) => (
              <li key={k.ad} className="rounded-2xl border border-border bg-card p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <p className="truncate text-sm font-medium text-foreground">{k.ad}</p>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                    %{k.oran}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${renk(k.oran)}`} style={{ width: `${k.oran}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Screen>
  );
}
