import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Play,
  FileText,
  Send,
  MessageCirclePlus,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Screen } from "@/components/BottomNav";
import { useWeeklyPlan, useUpdatePlanItem, useSendCoachRequest } from "@/lib/data";

export const Route = createFileRoute("/program")({
  head: () => ({
    meta: [
      { title: "Haftalık Program — Koçluk Çalışma Çizelgesi" },
      {
        name: "description",
        content:
          "Günlere ayrılmış ders görevleri, kitap ve soru hedefleri, video/PDF materyalleri ve koça onay gönderme.",
      },
      { property: "og:title", content: "Haftalık Program — Koçluk Çalışma Çizelgesi" },
      {
        property: "og:description",
        content: "Ders bazlı görev kartları, sürükle-bırak planlama ve koç onayı.",
      },
    ],
  }),
  component: Program,
});

const GUN_ADLARI = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function haftaBasi(d: Date) {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(0, 0, 0, 0);
  return x;
}

function Program() {
  const [hafta, setHafta] = useState(() => haftaBasi(new Date()));
  const weekStart = iso(hafta);
  const { data: gorevler = [] } = useWeeklyPlan(weekStart);
  const guncelle = useUpdatePlanItem(weekStart);
  const talepGonder = useSendCoachRequest();
  const [surukle, setSurukle] = useState<string | null>(null);
  const [hedefGun, setHedefGun] = useState<number | null>(null);
  const [talep, setTalep] = useState("");
  const [talepAcik, setTalepAcik] = useState(false);

  const gunlere = useMemo(() => {
    return GUN_ADLARI.map((_, i) => gorevler.filter((g) => g.day_index === i));
  }, [gorevler]);

  const bitis = new Date(hafta);
  bitis.setDate(hafta.getDate() + 6);
  const haftaEtiketi = `${hafta.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })} – ${bitis.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}`;

  const kaydir = (yon: number) => {
    const d = new Date(hafta);
    d.setDate(d.getDate() + yon * 7);
    setHafta(d);
  };

  const tasi = (id: string, gun: number) => {
    guncelle.mutate({ id, day_index: gun });
    toast.success(`Görev ${GUN_ADLARI[gun]} gününe taşındı`);
  };

  return (
    <Screen title="Haftalık Program" subtitle="Koçluk çalışma çizelgen">
      <button
        onClick={() => setTalepAcik((v) => !v)}
        className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent">
          <MessageCirclePlus className="h-5 w-5 text-accent-foreground" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">Haftalık Talep İlet</span>
          <span className="block truncate text-xs text-muted-foreground">
            Koçuna bu hafta için isteklerini yaz
          </span>
        </span>
      </button>

      {talepAcik ? (
        <form
          className="mt-2 space-y-2 rounded-2xl border border-border bg-card p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!talep.trim()) return;
            talepGonder.mutate(
              { week_start: weekStart, kind: "talep", message: talep.trim() },
              {
                onSuccess: () => {
                  setTalep("");
                  setTalepAcik(false);
                  toast.success("Talebin koçuna iletildi");
                },
              },
            );
          }}
        >
          <textarea
            value={talep}
            onChange={(e) => setTalep(e.target.value)}
            rows={3}
            placeholder="Örn. Türev soru sayısını artıralım, paragraf azalsın."
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
          <button
            disabled={talepGonder.isPending}
            className="w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            Talebi gönder
          </button>
        </form>
      ) : null}

      <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        <button onClick={() => kaydir(-1)} className="rounded-xl border border-border bg-card p-2">
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
        <p className="truncate text-center text-sm font-semibold text-foreground">{haftaEtiketi} Haftası</p>
        <button onClick={() => kaydir(1)} className="rounded-xl border border-border bg-card p-2">
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {GUN_ADLARI.map((ad, i) => {
          const gunun = gunlere[i];
          const tarih = new Date(hafta);
          tarih.setDate(hafta.getDate() + i);
          return (
            <section
              key={ad}
              onDragOver={(e) => {
                e.preventDefault();
                setHedefGun(i);
              }}
              onDragLeave={() => setHedefGun((g) => (g === i ? null : g))}
              onDrop={(e) => {
                e.preventDefault();
                setHedefGun(null);
                if (surukle) tasi(surukle, i);
                setSurukle(null);
              }}
              className={
                "rounded-3xl border p-3 transition-colors " +
                (hedefGun === i ? "border-primary bg-primary/5" : "border-border bg-card")
              }
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-1 pb-2">
                <p className="truncate text-sm font-semibold text-foreground">
                  {ad}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {tarih.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                  </span>
                </p>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {gunun.filter((g) => g.is_done).length}/{gunun.length}
                </span>
              </div>

              {gunun.length === 0 ? (
                <p className="px-1 pb-1 text-xs text-muted-foreground">Boş gün — buraya görev sürükleyebilirsin.</p>
              ) : null}

              <ul className="space-y-2">
                {gunun.map((g) => (
                  <li
                    key={g.id}
                    draggable
                    onDragStart={() => setSurukle(g.id)}
                    onDragEnd={() => setSurukle(null)}
                    className={
                      "rounded-2xl border border-border bg-background p-3 " +
                      (surukle === g.id ? "opacity-50" : "")
                    }
                  >
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2">
                      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {g.subject} — {g.topic}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {g.book ?? "Kaynak yok"}
                          {g.question_count ? ` · ${g.question_count} Soru` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => guncelle.mutate({ id: g.id, is_done: !g.is_done })}
                        aria-label="Yaptım"
                        className={
                          "grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition-colors " +
                          (g.is_done ? "border-primary bg-primary" : "border-border bg-card")
                        }
                      >
                        {g.is_done ? <Check className="h-4 w-4 text-primary-foreground" /> : null}
                      </button>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {g.video_url ? (
                        <a
                          href={g.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary"
                        >
                          <Play className="h-3.5 w-3.5" /> Videoyu İzle
                        </a>
                      ) : null}
                      {g.pdf_url ? (
                        <a
                          href={g.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-[11px] font-semibold text-foreground"
                        >
                          <FileText className="h-3.5 w-3.5" /> PDF Aç
                        </a>
                      ) : null}
                      <select
                        value={g.day_index}
                        onChange={(e) => tasi(g.id, Number(e.target.value))}
                        className="ml-auto rounded-full border border-border bg-card px-2 py-1 text-[11px] font-semibold text-muted-foreground outline-none"
                      >
                        {GUN_ADLARI.map((d, di) => (
                          <option key={d} value={di}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <button
        onClick={() =>
          talepGonder.mutate(
            {
              week_start: weekStart,
              kind: "onay",
              message: "Öğrenci haftalık plan değişikliklerini onaya gönderdi.",
            },
            { onSuccess: () => toast.success("Değişiklikler koça onaya gönderildi") },
          )
        }
        disabled={talepGonder.isPending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        <Send className="h-4 w-4" /> Değişiklikleri Koça Onaya Gönder
      </button>
    </Screen>
  );
}
