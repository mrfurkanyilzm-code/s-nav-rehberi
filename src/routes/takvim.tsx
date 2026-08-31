import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Screen } from "@/components/BottomNav";
import { useAddMockEvent, useMockEvents, trTarih } from "@/lib/data";

export const Route = createFileRoute("/takvim")({
  head: () => ({
    meta: [
      { title: "Deneme Takvimi — Aylık ve Haftalık Görünüm" },
      {
        name: "description",
        content:
          "Türkiye Geneli denemeleri ve kendi eklediğin denemeleri aylık veya haftalık takvimde renkli bloklar hâlinde gör.",
      },
      { property: "og:title", content: "Deneme Takvimi — Aylık ve Haftalık Görünüm" },
      {
        property: "og:description",
        content: "3D, 345, Özdebir denemeleri ve kendi planların tek takvimde.",
      },
    ],
  }),
  component: Takvim,
});

const GUNLER = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function haftaBasi(d: Date) {
  const x = new Date(d);
  const gun = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - gun);
  x.setHours(0, 0, 0, 0);
  return x;
}
function renk(provider: string) {
  const p = provider.toLowerCase();
  if (p.includes("3d")) return "bg-primary/15 text-primary";
  if (p.includes("345")) return "bg-success-soft text-success";
  if (p.includes("özdebir")) return "bg-star/20 text-star";
  if (p.includes("manuel")) return "bg-accent text-accent-foreground";
  return "bg-muted text-muted-foreground";
}

function Takvim() {
  const { data: denemeler = [] } = useMockEvents();
  const addEvent = useAddMockEvent();
  const [gorunum, setGorunum] = useState<"ay" | "hafta">("ay");
  const [imlec, setImlec] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [acik, setAcik] = useState(false);
  const [form, setForm] = useState({ ad: "", tarih: "" });

  const gunler = useMemo(() => {
    if (gorunum === "hafta") {
      const bas = haftaBasi(imlec);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(bas);
        d.setDate(bas.getDate() + i);
        return d;
      });
    }
    const ilk = new Date(imlec.getFullYear(), imlec.getMonth(), 1);
    const bas = haftaBasi(ilk);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(bas);
      d.setDate(bas.getDate() + i);
      return d;
    });
  }, [imlec, gorunum]);

  const gunGrup = useMemo(() => {
    const m = new Map<string, typeof denemeler>();
    for (const d of denemeler) {
      const list = m.get(d.event_date) ?? [];
      list.push(d);
      m.set(d.event_date, list);
    }
    return m;
  }, [denemeler]);

  const kaydir = (yon: number) => {
    const d = new Date(imlec);
    if (gorunum === "hafta") d.setDate(d.getDate() + yon * 7);
    else d.setMonth(d.getMonth() + yon);
    setImlec(d);
  };

  const bugun = iso(new Date());
  const baslik =
    gorunum === "ay"
      ? imlec.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })
      : `${haftaBasi(imlec).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} haftası`;

  const listeGunleri = gorunum === "hafta" ? gunler : gunler.filter((d) => d.getMonth() === imlec.getMonth());

  return (
    <Screen
      title="Deneme Takvimi"
      subtitle="Türkiye Geneli ve kendi denemelerin"
      action={
        <button
          onClick={() => setAcik(true)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Deneme
        </button>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
        {(["ay", "hafta"] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGorunum(g)}
            className={
              "rounded-xl py-2 text-sm font-semibold transition-colors " +
              (gorunum === g ? "bg-card text-foreground shadow-[var(--shadow-soft)]" : "text-muted-foreground")
            }
          >
            {g === "ay" ? "Aylık" : "Haftalık"}
          </button>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        <button onClick={() => kaydir(-1)} className="rounded-xl border border-border bg-card p-2">
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
        <p className="truncate text-center text-sm font-semibold capitalize text-foreground">{baslik}</p>
        <button onClick={() => kaydir(1)} className="rounded-xl border border-border bg-card p-2">
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      </div>

      <div className="rounded-3xl border border-border bg-card p-2">
        <div className="grid grid-cols-7 gap-1 pb-1">
          {GUNLER.map((g) => (
            <p key={g} className="text-center text-[10px] font-semibold uppercase text-muted-foreground">
              {g}
            </p>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {gunler.map((d) => {
            const k = iso(d);
            const olaylar = gunGrup.get(k) ?? [];
            const ayDisi = gorunum === "ay" && d.getMonth() !== imlec.getMonth();
            return (
              <button
                key={k}
                onClick={() => setForm((f) => ({ ...f, tarih: k }))}
                className={
                  "min-h-[54px] rounded-xl border p-1 text-left transition-colors " +
                  (k === bugun ? "border-primary bg-primary/5 " : "border-transparent ") +
                  (ayDisi ? "opacity-35" : "")
                }
              >
                <span className="block text-[11px] font-semibold tabular-nums text-foreground">
                  {d.getDate()}
                </span>
                <span className="mt-0.5 flex flex-col gap-0.5">
                  {olaylar.slice(0, 2).map((o) => (
                    <span
                      key={o.id}
                      className={"block truncate rounded px-1 text-[8px] font-semibold " + renk(o.provider)}
                    >
                      {o.name}
                    </span>
                  ))}
                  {olaylar.length > 2 ? (
                    <span className="text-[8px] text-muted-foreground">+{olaylar.length - 2}</span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {listeGunleri
          .flatMap((d) => gunGrup.get(iso(d)) ?? [])
          .map((o) => (
            <li
              key={o.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <span className={"h-9 w-1.5 shrink-0 rounded-full " + renk(o.provider).split(" ")[0]} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{o.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {o.provider} · {trTarih(o.event_date)}
                </p>
              </div>
              <span
                className={
                  o.status === "tamamlandi"
                    ? "shrink-0 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success"
                    : "shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
                }
              >
                {o.status === "tamamlandi" ? "Tamamlandı" : "Planlandı"}
              </span>
            </li>
          ))}
      </ul>

      {acik ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4">
          <form
            className="w-full max-w-md space-y-2 rounded-3xl border border-border bg-card p-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.ad.trim() || !form.tarih) return;
              addEvent.mutate(
                { name: form.ad.trim(), event_date: form.tarih },
                {
                  onSuccess: () => {
                    setForm({ ad: "", tarih: "" });
                    setAcik(false);
                  },
                },
              );
            }}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground">Deneme ekle</p>
              <button type="button" onClick={() => setAcik(false)} className="rounded-lg p-1">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <input
              value={form.ad}
              onChange={(e) => setForm({ ...form, ad: e.target.value })}
              placeholder="Deneme adı (örn. 345 TYT-5)"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
            <input
              type="date"
              value={form.tarih}
              onChange={(e) => setForm({ ...form, tarih: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
            <button
              disabled={addEvent.isPending}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {addEvent.isPending ? "Ekleniyor…" : "Takvime ekle"}
            </button>
          </form>
        </div>
      ) : null}
    </Screen>
  );
}
