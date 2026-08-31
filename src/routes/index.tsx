import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Flame, Star, Plus, GraduationCap, Check } from "lucide-react";
import { Screen, SectionTitle } from "@/components/BottomNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sınav Koçluğu — Hedef Takip ve Günlük Görevler" },
      {
        name: "description",
        content:
          "Sınav geri sayımı, deneme takvimi, günlük soru hedefleri ve seri takibi tek ekranda.",
      },
      { property: "og:title", content: "Sınav Koçluğu — Hedef Takip ve Günlük Görevler" },
      {
        property: "og:description",
        content: "Geri sayım, deneme takvimi, günlük görevler ve streak takibi.",
      },
    ],
  }),
  component: Home,
});

const EXAM_DATE = new Date("2027-06-19T10:15:00+03:00");

function useCountdown() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => {
    if (!now) return null;
    const diff = Math.max(0, EXAM_DATE.getTime() - now.getTime());
    return {
      gun: Math.floor(diff / 86400000),
      saat: Math.floor(diff / 3600000) % 24,
      dakika: Math.floor(diff / 60000) % 60,
      saniye: Math.floor(diff / 1000) % 60,
    };
  }, [now]);
}

type Deneme = { ad: string; kurum: string; tarih: string; durum: "planlandi" | "tamamlandi" };

const baslangicDenemeler: Deneme[] = [
  { ad: "3D TYT-11", kurum: "Türkiye Geneli", tarih: "6 Eyl Cmt", durum: "planlandi" },
  { ad: "345 AYT-4", kurum: "Türkiye Geneli", tarih: "13 Eyl Cmt", durum: "planlandi" },
  { ad: "Bilfen TYT-3", kurum: "Türkiye Geneli", tarih: "20 Eyl Cmt", durum: "planlandi" },
  { ad: "3D AYT-9", kurum: "Türkiye Geneli", tarih: "30 Ağu Cmt", durum: "tamamlandi" },
];

type Gorev = { id: number; baslik: string; detay: string; bitti: boolean };

const baslangicGorevler: Gorev[] = [
  { id: 1, baslik: "Matematik — Problemler", detay: "40 soru", bitti: true },
  { id: 2, baslik: "Türkçe — Paragraf", detay: "30 soru", bitti: true },
  { id: 3, baslik: "Tarih — İnkılap konu tekrarı", detay: "1 konu + 20 soru", bitti: false },
  { id: 4, baslik: "Coğrafya — Nüfus", detay: "25 soru", bitti: false },
  { id: 5, baslik: "Deneme analizi (3D AYT-9)", detay: "Yanlış defteri", bitti: false },
];

function Home() {
  const kalan = useCountdown();
  const [gorevler, setGorevler] = useState(baslangicGorevler);
  const [denemeler, setDenemeler] = useState(baslangicDenemeler);
  const [form, setForm] = useState({ ad: "", tarih: "" });
  const [acik, setAcik] = useState(false);

  const tamam = gorevler.filter((g) => g.bitti).length;
  const yuzde = Math.round((tamam / gorevler.length) * 100);

  return (
    <Screen title="Merhaba Furkan 👋" subtitle="Bugün de bir adım daha yaklaşıyoruz.">
      {/* Hedef + geri sayım */}
      <section className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-[var(--shadow-soft)]">
        <div className="flex min-w-0 items-center gap-2 text-xs font-medium opacity-80">
          <GraduationCap className="h-4 w-4 shrink-0" />
          <span className="truncate">Boğaziçi Üniversitesi — YBS</span>
        </div>
        <p className="mt-1 text-lg font-semibold">Hedef: 709. sıra</p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            ["Gün", kalan?.gun],
            ["Saat", kalan?.saat],
            ["Dk", kalan?.dakika],
            ["Sn", kalan?.saniye],
          ].map(([etiket, deger]) => (
            <div key={etiket as string} className="rounded-2xl bg-primary-soft px-2 py-3 text-center">
              <p className="text-xl font-bold tabular-nums">
                {deger === undefined || deger === null ? "—" : String(deger).padStart(2, "0")}
              </p>
              <p className="text-[11px] opacity-75">{etiket}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] opacity-75">YKS'ye kalan süre</p>
      </section>

      {/* Streak & yıldız */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-streak" />
            <span className="text-2xl font-bold text-foreground tabular-nums">37</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Günlük seri</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-star" fill="currentColor" />
            <span className="text-2xl font-bold text-foreground tabular-nums">1.240</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Yıldız</p>
        </div>
      </div>

      {/* Deneme takvimi */}
      <SectionTitle
        right={
          <button
            onClick={() => setAcik((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Deneme ekle
          </button>
        }
      >
        Deneme Takvimi
      </SectionTitle>

      {acik ? (
        <form
          className="mb-3 space-y-2 rounded-2xl border border-border bg-card p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.ad.trim()) return;
            setDenemeler((d) => [
              ...d,
              {
                ad: form.ad,
                kurum: "Manuel",
                tarih: form.tarih || "Tarihsiz",
                durum: "planlandi",
              },
            ]);
            setForm({ ad: "", tarih: "" });
            setAcik(false);
          }}
        >
          <input
            value={form.ad}
            onChange={(e) => setForm({ ...form, ad: e.target.value })}
            placeholder="Deneme adı (örn. 345 TYT-5)"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
          <input
            value={form.tarih}
            onChange={(e) => setForm({ ...form, tarih: e.target.value })}
            placeholder="Tarih (örn. 27 Eyl Cmt)"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
          <button className="w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground">
            Takvime ekle
          </button>
        </form>
      ) : null}

      <ul className="space-y-2">
        {denemeler.map((d) => (
          <li
            key={d.ad}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{d.ad}</p>
              <p className="truncate text-xs text-muted-foreground">
                {d.kurum} · {d.tarih}
              </p>
            </div>
            <span
              className={
                d.durum === "tamamlandi"
                  ? "shrink-0 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success"
                  : "shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
              }
            >
              {d.durum === "tamamlandi" ? "Tamamlandı" : "Planlandı"}
            </span>
          </li>
        ))}
      </ul>

      {/* Günün görevleri */}
      <SectionTitle right={<span className="text-xs text-muted-foreground">%{yuzde}</span>}>
        Günün Görevleri
      </SectionTitle>
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${yuzde}%` }} />
      </div>
      <ul className="space-y-2">
        {gorevler.map((g) => (
          <li key={g.id}>
            <button
              onClick={() =>
                setGorevler((list) =>
                  list.map((x) => (x.id === g.id ? { ...x, bitti: !x.bitti } : x)),
                )
              }
              className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left"
            >
              <span
                className={
                  "grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition-colors " +
                  (g.bitti ? "border-primary bg-primary" : "border-border bg-background")
                }
              >
                {g.bitti ? <Check className="h-4 w-4 text-primary-foreground" /> : null}
              </span>
              <span className="min-w-0">
                <span
                  className={
                    "block truncate text-sm font-medium " +
                    (g.bitti ? "text-muted-foreground line-through" : "text-foreground")
                  }
                >
                  {g.baslik}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{g.detay}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
