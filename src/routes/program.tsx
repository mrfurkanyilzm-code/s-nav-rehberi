import { createFileRoute } from "@tanstack/react-router";
import { Screen, SectionTitle } from "@/components/BottomNav";
import { MessageCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/program")({
  head: () => ({
    meta: [
      { title: "Koçluk Programı — Haftalık Plan ve Koç Notları" },
      {
        name: "description",
        content: "Koçunun hazırladığı haftalık çalışma planını, görüşme saatlerini ve notları takip et.",
      },
      { property: "og:title", content: "Koçluk Programı — Haftalık Plan ve Koç Notları" },
      {
        property: "og:description",
        content: "Haftalık çalışma planı, koç görüşmesi ve haftanın hedefleri.",
      },
    ],
  }),
  component: Program,
});

const hafta = [
  { gun: "Pzt", plan: "Mat. Türev + Türkçe Paragraf", saat: "4 sa" },
  { gun: "Sal", plan: "Tarih İnkılap + Deneme analizi", saat: "3 sa" },
  { gun: "Çar", plan: "Mat. Problemler + Coğrafya", saat: "4 sa" },
  { gun: "Per", plan: "Fizik tekrar + Paragraf", saat: "3 sa" },
  { gun: "Cum", plan: "Genel tekrar + yanlış defteri", saat: "2 sa" },
  { gun: "Cmt", plan: "3D TYT-11 Türkiye Geneli", saat: "Deneme" },
  { gun: "Paz", plan: "Deneme analizi + dinlenme", saat: "2 sa" },
];

function Program() {
  return (
    <Screen title="Koçluk Programı" subtitle="1–7 Eylül haftası">
      <section className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-3xl border border-border bg-card p-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent">
          <MessageCircle className="h-5 w-5 text-accent-foreground" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">Koç görüşmesi — Elif Hoca</p>
          <p className="truncate text-xs text-muted-foreground">Çarşamba 20:30 · Online</p>
        </div>
      </section>

      <SectionTitle>Haftanın Planı</SectionTitle>
      <ul className="space-y-2">
        {hafta.map((g) => (
          <li
            key={g.gun}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted text-xs font-semibold text-foreground">
              {g.gun}
            </span>
            <p className="min-w-0 truncate text-sm text-foreground">{g.plan}</p>
            <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {g.saat}
            </span>
          </li>
        ))}
      </ul>

      <SectionTitle>Koç Notu</SectionTitle>
      <p className="rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
        Türev netlerin son iki denemede düştü. Bu hafta günde 20 soruluk türev bloğu ekledim.
        Deneme sonrası yanlış defterini aynı gün doldurmayı unutma.
      </p>
    </Screen>
  );
}
