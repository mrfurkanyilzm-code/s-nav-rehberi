import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Screen } from "@/components/BottomNav";
import {
  Check,
  X,
  Plus,
  AlertTriangle,
  Calendar,
  Send,
  Link as LinkIcon,
  ExternalLink,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Video,
} from "lucide-react";
import {
  useWeeklySchedule,
  useUpdateWeeklySchedule,
  useResolveSlotRequest,
  useSendMeetingPoll,
  useDismissMeetingPoll,
  useUpdateMeetingUrl,
  DayKey,
  StudySlot,
} from "@/lib/data";

export const Route = createFileRoute("/koc-paneli")({
  component: KocPaneliPage,
});

const ORDERED_DAYS = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: "pazartesi", label: "Pazartesi", short: "Pzt" },
  { key: "sali", label: "Salı", short: "Sal" },
  { key: "carsamba", label: "Çarşamba", short: "Çar" },
  { key: "persembe", label: "Perşembe", short: "Per" },
  { key: "cuma", label: "Cuma", short: "Cum" },
  { key: "cumartesi", label: "Cumartesi", short: "Cmt" },
  { key: "pazar", label: "Pazar", short: "Paz" },
];

const QUICK_LESSONS: readonly string[] = [
  "TYT Matematik",
  "AYT Matematik",
  "Geometri",
  "Türkçe / Paragraf",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Tarih",
  "Coğrafya",
  "Deneme Sınavı",
];

const PRESET_HOURS = [
  "11:00",
  "13:00",
  "14:00",
  "15:30",
  "16:30",
  "18:00",
  "19:30",
  "20:00",
  "21:00",
  "21:30",
];

function calcEnd(start: string): string {
  const [hStr, mStr] = start.split(":");
  const h = parseInt(hStr || "0", 10);
  const m = parseInt(mStr || "0", 10);
  const totalMin = h * 60 + m + 45;
  const newH = Math.floor(totalMin / 60) % 24;
  const newM = totalMin % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export function KocPaneliPage() {
  const { data: schedule } = useWeeklySchedule();
  const updateScheduleMutation = useUpdateWeeklySchedule();
  const resolveRequestMutation = useResolveSlotRequest();
  const sendPollMutation = useSendMeetingPoll();
  const dismissPollMutation = useDismissMeetingPoll();
  const updateUrlMutation = useUpdateMeetingUrl();

  const [activeDay, setActiveDay] = useState<DayKey>("pazartesi");

  // Talep Paneli Aç/Kapa
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 3 Tercih State'leri
  const [slot1Day, setSlot1Day] = useState("Cumartesi");
  const [slot1Start, setSlot1Start] = useState("20:00");

  const [slot2Day, setSlot2Day] = useState("Pazar");
  const [slot2Start, setSlot2Start] = useState("14:00");

  const [slot3Day, setSlot3Day] = useState("Pazar");
  const [slot3Start, setSlot3Start] = useState("18:00");

  // Saat kesinleştiğinde girilecek link
  const [meetUrlInput, setMeetUrlInput] = useState("");
  const [isLinkSavedToast, setIsLinkSavedToast] = useState(false);

  // Yeni Etüt Ekle Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetDay, setTargetDay] = useState<DayKey>("pazartesi");
  const [selectedLesson, setSelectedLesson] = useState<string>("TYT Matematik");
  const [topicInput, setTopicInput] = useState("");
  const [questionCount, setQuestionCount] = useState<string>("");
  const [durationMin, setDurationMin] = useState<string>("");

  // Reddetme Gerekçesi Modalı
  const [rejectSlotId, setRejectSlotId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (!schedule) {
    return (
      <Screen title="Koç Yönetim Paneli" subtitle="Yükleniyor...">
        <div className="p-8 text-center text-xs text-muted-foreground">
          Panel yükleniyor...
        </div>
      </Screen>
    );
  }

  const poll = schedule.meeting_poll;
  const pendingRequests = schedule.slots.filter((s) => Boolean(s.active_request));

  const handleSend3Slots = (e: React.FormEvent) => {
    e.preventDefault();
    sendPollMutation.mutate(
      {
        options: [
          { day_label: slot1Day, start: slot1Start, end: calcEnd(slot1Start) },
          { day_label: slot2Day, start: slot2Start, end: calcEnd(slot2Start) },
          { day_label: slot3Day, start: slot3Start, end: calcEnd(slot3Start) },
        ],
        meet_url: "", // Başlangıçta boş gönderiyoruz, öğrenci saati seçince koç ekleyecek
      },
      {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      }
    );
  };

  const handleSendMeetUrlToStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetUrlInput.trim()) return;
    updateUrlMutation.mutate(meetUrlInput.trim(), {
      onSuccess: () => {
        setIsLinkSavedToast(true);
        setTimeout(() => setIsLinkSavedToast(false), 2500);
      },
    });
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    const qNum = questionCount.trim() !== "" ? Number(questionCount) : undefined;
    const dNum = durationMin.trim() !== "" ? Number(durationMin) : undefined;

    const newSlot: StudySlot = {
      id: Date.now().toString(),
      day: targetDay,
      lesson: selectedLesson || "Genel Ders",
      topic: topicInput.trim(),
      target_questions: qNum,
      duration_minutes: dNum,
      is_completed: false,
      is_coach_assigned: true,
    };

    updateScheduleMutation.mutate({
      slots: [...schedule.slots, newSlot],
    });

    setTopicInput("");
    setQuestionCount("");
    setDurationMin("");
    setIsAddModalOpen(false);
  };

  const handleDeleteSlot = (id: string) => {
    updateScheduleMutation.mutate({
      slots: schedule.slots.filter((s) => s.id !== id),
    });
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectSlotId || !rejectReason.trim()) return;

    resolveRequestMutation.mutate({
      slotId: rejectSlotId,
      decision: "reddet",
      coach_reply: rejectReason.trim(),
    });

    setRejectSlotId(null);
    setRejectReason("");
  };

  return (
    <Screen
      title="Koç Yönetim Paneli"
      subtitle={`Öğrenci: ${schedule.student_name} (${schedule.week_range})`}
    >
      <div className="space-y-4 pb-24">

        {/* 1. KISIM: AKILLI VE SÜRECE GÖRE DEĞİŞEN CANLI GÖRÜŞME KARTI */}
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-4 shadow-sm transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Haftalık Canlı Görüşme</span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                  poll.is_poll_active
                    ? poll.status === "saat_kesinlesti"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/15 text-amber-600"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {poll.is_poll_active
                  ? poll.status === "saat_kesinlesti"
                    ? "✓ Saat Belirlendi"
                    : "Öğrenci Seçiyor"
                  : "Planlanmadı"}
              </span>

              {poll.is_poll_active ? (
                <button
                  type="button"
                  onClick={() => dismissPollMutation.mutate()}
                  disabled={dismissPollMutation.isPending}
                  className="flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 shadow-sm transition hover:bg-rose-500/20 active:scale-95"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Sıfırla</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
                >
                  <Send className="h-3 w-3" />
                  <span>{isFormOpen ? "Kapat" : "Canlı Görüşme Talep Et"}</span>
                  {isFormOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              )}
            </div>
          </div>

          {/* DURUM 1: ÖĞRENCİ HENÜZ SAATİ SEÇMEDİYSE BEKLEME MESAJI */}
          {poll.is_poll_active && poll.status === "secim_bekleniyor" && (
            <div className="mt-3 rounded-2xl bg-card p-3 border border-border">
              <span className="text-[10px] font-bold text-amber-600 uppercase">
                Öğrenciye 3 Tercih İletildi (Seçim Bekleniyor):
              </span>
              <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
                {poll.options.map((o) => `${o.day_label} ${o.time_range}`).join(" · ")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-2 italic bg-muted/40 p-2 rounded-xl">
                ℹ️ Öğrenci bu seçeneklerden birini onayladığında, burada görüşme davet linkini (Meet / Zoom) girebileceğiniz alan açılacaktır.
              </p>
            </div>
          )}

          {/* DURUM 2: ÖĞRENCİ SAATİ SEÇTİĞİNDE BELİREN "DAVET LİNKİ GÖNDER" BÖLÜMÜ */}
          {poll.is_poll_active && poll.status === "saat_kesinlesti" && poll.selected_option && (
            <div className="mt-3 rounded-2xl bg-card p-3.5 border-2 border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    🎉 Öğrencinin Tercih Ettiği Zaman:
                  </span>
                  <p className="text-sm font-black text-foreground mt-0.5">
                    {poll.selected_option.day_label} Günü {poll.selected_option.time_range}
                  </p>
                </div>
                {poll.meet_url && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    ✓ Link Gönderildi
                  </span>
                )}
              </div>

              {/* Davet Linki Girişi ve Gönder Butonu */}
              <form onSubmit={handleSendMeetUrlToStudent} className="pt-2 border-t border-border space-y-2">
                <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-primary" />
                  <span>Öğrenciye Davet Linki Gönder (Google Meet / Zoom URL):</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    defaultValue={poll.meet_url}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    onChange={(e) => setMeetUrlInput(e.target.value)}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono outline-none focus:ring-1 focus:ring-primary"
                  />

                  <button
                    type="submit"
                    disabled={updateUrlMutation.isPending}
                    className="flex shrink-0 items-center gap-1 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95"
                  >
                    <Send className="h-3 w-3" />
                    <span>{isLinkSavedToast ? "✓ İletildi!" : "Davet Linki Gönder"}</span>
                  </button>

                  {poll.meet_url && (
                    <a
                      href={poll.meet_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-border bg-muted/40 p-2 text-muted-foreground hover:text-foreground"
                      title="Linke Git"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* SADECE KOÇ "CANLI GÖRÜŞME TALEP ET" BUTONUNA BASTIĞINDA AÇILAN 3 TERCİH PANELİ */}
          {isFormOpen && !poll.is_poll_active && (
            <form onSubmit={handleSend3Slots} className="mt-3.5 pt-3 border-t border-border/70 space-y-3 animate-in fade-in duration-200">
              <p className="text-xs font-semibold text-foreground">
                Öğrenciye sunacağın 3 farklı saat aralığını seç:
              </p>

              {/* 1. SEÇENEK */}
              <div className="rounded-2xl border border-border bg-card p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">1. Tercih</span>
                  <span className="text-xs font-black text-primary bg-muted/60 px-2 py-0.5 rounded-md border border-border">
                    {slot1Day} · {slot1Start} - {calcEnd(slot1Start)}
                  </span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {ORDERED_DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSlot1Day(d)}
                      className={`rounded-lg px-2 py-1 text-[10px] font-bold shrink-0 transition ${
                        slot1Day === d
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/40 border border-border text-muted-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 items-center pt-1 border-t border-border/40">
                  {PRESET_HOURS.slice(0, 5).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setSlot1Start(h)}
                      className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition ${
                        slot1Start === h
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/40 border border-border text-muted-foreground"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                  <input
                    type="time"
                    value={slot1Start}
                    onChange={(e) => setSlot1Start(e.target.value)}
                    className="rounded-lg border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold outline-none"
                  />
                </div>
              </div>

              {/* 2. SEÇENEK */}
              <div className="rounded-2xl border border-border bg-card p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">2. Tercih</span>
                  <span className="text-xs font-black text-primary bg-muted/60 px-2 py-0.5 rounded-md border border-border">
                    {slot2Day} · {slot2Start} - {calcEnd(slot2Start)}
                  </span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {ORDERED_DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSlot2Day(d)}
                      className={`rounded-lg px-2 py-1 text-[10px] font-bold shrink-0 transition ${
                        slot2Day === d
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/40 border border-border text-muted-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 items-center pt-1 border-t border-border/40">
                  {PRESET_HOURS.slice(2, 7).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setSlot2Start(h)}
                      className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition ${
                        slot2Start === h
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/40 border border-border text-muted-foreground"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                  <input
                    type="time"
                    value={slot2Start}
                    onChange={(e) => setSlot2Start(e.target.value)}
                    className="rounded-lg border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold outline-none"
                  />
                </div>
              </div>

              {/* 3. SEÇENEK */}
              <div className="rounded-2xl border border-border bg-card p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">3. Tercih</span>
                  <span className="text-xs font-black text-primary bg-muted/60 px-2 py-0.5 rounded-md border border-border">
                    {slot3Day} · {slot3Start} - {calcEnd(slot3Start)}
                  </span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {ORDERED_DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSlot3Day(d)}
                      className={`rounded-lg px-2 py-1 text-[10px] font-bold shrink-0 transition ${
                        slot3Day === d
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/40 border border-border text-muted-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 items-center pt-1 border-t border-border/40">
                  {PRESET_HOURS.slice(5).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setSlot3Start(h)}
                      className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition ${
                        slot3Start === h
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/40 border border-border text-muted-foreground"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                  <input
                    type="time"
                    value={slot3Start}
                    onChange={(e) => setSlot3Start(e.target.value)}
                    className="rounded-lg border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold outline-none"
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={sendPollMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-95"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{sendPollMutation.isPending ? "İletiliyor..." : "3 Tercihi Öğrenciye Gönder"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 2. KISIM: Hafta İçi Kriz Talepleri */}
        {pendingRequests.length > 0 && (
          <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-4 shadow-md">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h3 className="text-xs font-bold text-foreground">
                  Öğrenciden Hafta İçi Değişiklik Talebi ({pendingRequests.length})
                </h3>
              </div>
              <span className="text-[10px] font-bold text-amber-600 uppercase">Karar Bekliyor</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {pendingRequests.map((s) => {
                const req = s.active_request;
                if (!req) return null;

                return (
                  <div key={s.id} className="rounded-2xl bg-card p-3 border border-border space-y-2">
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold">{s.lesson}</span> - <span>{s.topic}</span>
                        <p className="text-[11px] text-amber-600 font-semibold pt-0.5">
                          {req.type === "tasi"
                            ? `📍 ${DAYS.find((d) => d.key === s.day)?.label}'den ➔ ${DAYS.find((d) => d.key === req.requested_day)?.label}'e taşımak istiyor.`
                            : "🛑 Yük ağır geldi, etüdü hafifletmek istiyor."}
                        </p>
                        <p className="text-[11px] italic text-muted-foreground mt-1 bg-muted/40 p-2 rounded-xl">
                          Öğrenci Gerekçesi: "{req.reason}"
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
                      <button
                        onClick={() => setRejectSlotId(s.id)}
                        className="flex items-center justify-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-500/20"
                      >
                        <X className="h-3.5 w-3.5" /> Gerekçeyle Reddet
                      </button>
                      <button
                        onClick={() => resolveRequestMutation.mutate({ slotId: s.id, decision: "onayla" })}
                        className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5" /> Değişikliği Onayla
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. KISIM: Çizelge Başlığı & Etüt Ekleme */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Canlı Plan Çizelgesi ({schedule.slots.length} Etüt)
          </span>

          <button
            onClick={() => {
              setTargetDay(activeDay);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" /> + Etüt Ekle
          </button>
        </div>

        {/* 4. KISIM: 7 Kolonlu Ajanda */}
        <div className="overflow-x-auto pb-3 -mx-2 px-2 no-scrollbar">
          <div className="grid grid-cols-7 gap-2.5 min-w-[840px]">
            {DAYS.map((d) => {
              const daySlots = schedule.slots.filter((s) => s.day === d.key);
              const totalQ = daySlots.reduce((acc, curr) => acc + (curr.target_questions ?? 0), 0);

              return (
                <div key={d.key} className="rounded-2xl border border-border bg-card p-2.5 flex flex-col justify-between min-h-[380px] shadow-sm w-[116px]">
                  <div>
                    <div className="border-b border-border pb-1.5 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-foreground uppercase">{d.label}</p>
                        {totalQ > 0 ? (
                          <span className="text-[9px] text-muted-foreground">{totalQ} Soru</span>
                        ) : (
                          <span className="text-[9px] text-muted-foreground">{daySlots.length} Etüt</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setTargetDay(d.key);
                          setIsAddModalOpen(true);
                        }}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                        title="Etüt Ekle"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {daySlots.length === 0 ? (
                        <p className="text-[9px] text-muted-foreground text-center italic pt-4">- Boş -</p>
                      ) : (
                        daySlots.map((s) => (
                          <div key={s.id} className="group relative rounded-xl border border-border/80 bg-muted/40 p-2 text-xs">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-[10px] text-foreground truncate pr-2">{s.lesson}</p>
                              <button
                                onClick={() => handleDeleteSlot(s.id)}
                                className="text-muted-foreground hover:text-rose-500 transition shrink-0"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                            <p className="text-[9px] text-muted-foreground line-clamp-2 mt-0.5 leading-tight">{s.topic}</p>
                            {(typeof s.target_questions === "number" || typeof s.duration_minutes === "number") && (
                              <div className="mt-1 flex flex-wrap gap-1 text-[8px] font-semibold text-primary pt-1 border-t border-border/50">
                                {typeof s.target_questions === "number" && <span>🎯 {s.target_questions}S</span>}
                                {typeof s.duration_minutes === "number" && <span>⏱️ {s.duration_minutes}Dk</span>}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Yeni Etüt Ata Modalı */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 pb-20 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Yeni Etüt Ata</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-xs text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="mt-3 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Hedef Gün</label>
                <select
                  value={targetDay}
                  onChange={(e) => setTargetDay(e.target.value as DayKey)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2 text-xs font-bold outline-none"
                >
                  {DAYS.map((d) => (
                    <option key={d.key} value={d.key}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Ders Seç</label>
                <div className="mt-1 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {QUICK_LESSONS.map((ls) => (
                    <button
                      key={ls}
                      type="button"
                      onClick={() => setSelectedLesson(ls)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                        selectedLesson === ls
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {ls}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Konu & Ödev Açıklaması</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Limit & Süreklilik Fasikül Test 3-4"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Hedef Soru <span className="opacity-60">(Opsiyonel)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Örn: 40"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Süre (Dk) <span className="opacity-60">(Opsiyonel)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Örn: 60"
                    value={durationMin}
                    onChange={(e) => setDurationMin(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-95"
                >
                  Etütü Programa Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reddetme Modalı */}
      {rejectSlotId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 pb-20 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Talebi Reddet</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Öğrencinin kriz talebini reddetmeden önce pedagojik gerekçeni yazmalısın.
            </p>

            <form onSubmit={handleConfirmReject} className="mt-4 space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Örn: Yazılıya 45 dk ayırabilirsin fakat Geometri etüdünü tamamen iptal etmek yerine soru sayısını 15'e düşürelim..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:ring-1 focus:ring-rose-500"
                autoFocus
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectSlotId(null)}
                  className="rounded-xl px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 active:scale-95"
                >
                  Gerekçeyle Reddet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Screen>
  );
}