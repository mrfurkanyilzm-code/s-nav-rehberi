import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Screen } from "@/components/BottomNav";
import {
  CheckCircle2,
  Circle,
  Clock,
  Printer,
  Sparkles,
  AlertTriangle,
  Flame,
  X,
  FileText,
  Video,
  ExternalLink,
  MessageSquare,
  Target,
  BarChart3,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  useWeeklySchedule,
  useToggleScheduleSlot,
  useSelectMeetingOption,
  useMarkMeetingJoined,
  useDismissMeetingPoll,
  useSubmitSlotRequest,
  DayKey,
  StudySlot,
} from "@/lib/data";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export const Route = createFileRoute("/program")({
  component: ProgramPage,
});

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: "pazartesi", label: "Pazartesi", short: "Pzt" },
  { key: "sali", label: "Salı", short: "Sal" },
  { key: "carsamba", label: "Çarşamba", short: "Çar" },
  { key: "persembe", label: "Perşembe", short: "Per" },
  { key: "cuma", label: "Cuma", short: "Cum" },
  { key: "cumartesi", label: "Cumartesi", short: "Cmt" },
  { key: "pazar", label: "Pazar", short: "Paz" },
];

export function ProgramPage() {
  const { data: schedule } = useWeeklySchedule();
  const toggleSlotMutation = useToggleScheduleSlot();
  const selectOptionMutation = useSelectMeetingOption();
  const markJoinedMutation = useMarkMeetingJoined();
  const dismissPollMutation = useDismissMeetingPoll();
  const submitRequestMutation = useSubmitSlotRequest();

  const [selectedDay, setSelectedDay] = useState<DayKey>("sali");
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [targetSlotForRequest, setTargetSlotForRequest] = useState<StudySlot | null>(null);
  const [requestType, setRequestType] = useState<"tasi" | "hafiflet">("tasi");
  const [targetDaySelect, setTargetDaySelect] = useState<DayKey>("cuma");
  const [requestReason, setRequestReason] = useState("");

  const poll = schedule?.meeting_poll;

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (poll?.joined_at) {
      timer = setTimeout(() => {
        dismissPollMutation.mutate();
      }, 4000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [poll?.joined_at, dismissPollMutation]);

  if (!schedule) {
    return (
      <Screen title="Haftalık Program" subtitle="Yükleniyor...">
        <div className="p-8 text-center text-xs text-muted-foreground">
          Program yükleniyor...
        </div>
      </Screen>
    );
  }

  const daySlots = schedule.slots.filter((s) => s.day === selectedDay);
  const dayTotal = daySlots.length;
  const dayCompleted = daySlots.filter((s) => s.is_completed).length;
  const dayPercent = dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;

  const totalSlots = schedule.slots.length;
  const completedSlots = schedule.slots.filter((s) => s.is_completed).length;
  const weeklyPercent = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

  const activeDayLabel = DAYS.find((d) => d.key === selectedDay)?.label ?? "Gün";

  const handleJoinCall = () => {
    if (poll?.meet_url) {
      window.open(poll.meet_url, "_blank");
    }
    markJoinedMutation.mutate();
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSlotForRequest || !requestReason.trim()) return;

    submitRequestMutation.mutate(
      {
        slotId: targetSlotForRequest.id,
        type: requestType,
        requested_day: requestType === "tasi" ? targetDaySelect : undefined,
        reason: requestReason.trim(),
      },
      {
        onSuccess: () => {
          setTargetSlotForRequest(null);
          setRequestReason("");
        },
      }
    );
  };

  const handlePrint = async () => {
    const isNative = typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform();
    const isEmbeddedBrowser =
      typeof navigator !== "undefined" &&
      (/vscode|electron/i.test(navigator.userAgent) || !window.matchMedia);

    // 1. Mobil Capacitor ortamı veya Cursor içi: Gerçek PDF dosyası üret ve paylaş/indir
    if (isNative || isEmbeddedBrowser) {
      const element = document.getElementById("pdf-table-container");
      if (!element) return;

      try {
        setIsGeneratingPdf(true);

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);

        if (isNative) {
          const pdfBase64 = pdf.output("datauristring").split(",")[1] || "";
          const fileName = `Haftalik_Cizelge_${Date.now()}.pdf`;
          
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: pdfBase64,
            directory: Directory.Cache,
          });
          await Share.share({
            title: "Haftalık Çalışma Çizelgesi",
            url: savedFile.uri,
            dialogTitle: "Çizelgeyi Yazdır veya Paylaş",
          });
        } else {
          pdf.save("Haftalik_Calisma_Cizelgesi.pdf");
        }
      } catch (err) {
        console.error("PDF oluşturma hatası:", err);
        alert("PDF oluşturulurken bir hata meydana geldi.");
      } finally {
        setIsGeneratingPdf(false);
      }
      return;
    }

    // 2. Normal masaüstü web tarayıcısı
    if (typeof window !== "undefined" && typeof window.print === "function") {
      try {
        window.print();
      } catch (err) {
        console.error("Yazdırma sırasında hata oluştu:", err);
      }
    }
  };

  return (
    <Screen
      title="Haftalık Program"
      subtitle={`${schedule.week_range}`}
    >
      <div className="space-y-4 pb-24">

        {/* 1. KISIM: Canlı Görüşme Randevusu */}
        {poll?.is_poll_active && (
          <div className="relative overflow-hidden rounded-3xl border-2 border-primary/40 bg-gradient-to-r from-primary/15 via-primary/5 to-card p-4 shadow-lg animate-in fade-in duration-300">
            <button
              onClick={() => dismissPollMutation.mutate()}
              className="absolute top-3 right-3 rounded-full p-1 text-muted-foreground hover:bg-muted cursor-pointer"
              title="Kapat"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow">
                <Calendar className="h-5 w-5" />
              </div>

              <div className="flex-1 pr-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                  Canlı Görüşme Randevusu
                </span>

                {poll.status === "secim_bekleniyor" ? (
                  <div>
                    <h4 className="text-xs font-bold text-foreground mt-0.5">
                      Görüşme Gün ve Saatini Seç
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Koçun haftalık değerlendirme için sana 3 farklı seçenek sundu:
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {poll.options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => selectOptionMutation.mutate(opt)}
                          className="flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-card p-2.5 text-center transition hover:border-primary hover:bg-primary/10 active:scale-95 shadow-sm cursor-pointer"
                        >
                          <span className="text-[10px] font-bold text-foreground">{opt.day_label}</span>
                          <span className="text-[11px] font-black text-primary mt-0.5">{opt.time_range}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-xs font-bold text-foreground mt-0.5">
                      ✓ Randevun Onaylandı: {poll.selected_option?.day_label} {poll.selected_option?.time_range}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Görüşme bağlantın hazır. Başlamak için tıkla:
                    </p>

                    <div className="mt-3">
                      {poll.joined_at ? (
                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Görüşmeye geçildi · Bu bildirim kapanıyor...</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleJoinCall}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-95 cursor-pointer"
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span>Görüşmeye Katıl</span>
                          <ExternalLink className="h-3 w-3 opacity-80" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. KISIM: Üst Durum & A4 Çizelge Butonu */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" /> Canlı Plan Aktif
          </span>

          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-sm transition hover:bg-muted active:scale-95 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span>A4 Çizelgeyi Gör</span>
          </button>
        </div>

        {schedule.coach_feedback && (
          <div className="rounded-2xl border border-border bg-muted/40 p-3.5 text-xs shadow-sm flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground block">Koçunun Geri Bildirimi:</span>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">"{schedule.coach_feedback}"</p>
            </div>
          </div>
        )}

        {/* Günlük & Haftalık İkili İlerleme */}
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-muted/30 p-3 border border-border/50 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" /> {activeDayLabel} Hedefi
                </span>
                <span className={`text-xs font-black ${dayPercent === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}`}>
                  %{dayPercent}
                </span>
              </div>
              <div className="mt-2.5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      dayPercent === 100 ? "bg-emerald-500" : "bg-primary"
                    }`}
                    style={{ width: `${dayPercent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground font-semibold flex justify-between">
                  <span>{dayTotal === 0 ? "Planlanmış etüt yok" : `${dayCompleted} / ${dayTotal} Etüt Tamamlandı`}</span>
                  {dayPercent === 100 && dayTotal > 0 && <span>🎉 Gün Bitti!</span>}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-muted/30 p-3 border border-border/50 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" /> Haftalık Büyük Resim
                </span>
                <span className="text-xs font-bold text-foreground">
                  %{weeklyPercent}
                </span>
              </div>
              <div className="mt-2.5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500/80 transition-all duration-300"
                    style={{ width: `${weeklyPercent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground font-semibold">
                  Toplam {completedSlots} / {totalSlots} Etüt Tamamlandı
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gün Seçici Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {DAYS.map((d) => {
            const dayItems = schedule.slots.filter((s) => s.day === d.key);
            const count = dayItems.length;
            const isAllDone = count > 0 && dayItems.every((s) => s.is_completed);
            const isSelected = selectedDay === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setSelectedDay(d.key)}
                className={`relative flex flex-col items-center rounded-2xl px-3 py-2 text-xs font-bold transition min-w-[54px] cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{d.short}</span>
                <span className={`mt-0.5 text-[10px] ${isSelected ? "opacity-90" : "text-muted-foreground"}`}>
                  {count} Etüt
                </span>
                {isAllDone && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background" />
                )}
              </button>
            );
          })}
        </div>

        {/* Seçili Günün Etütleri */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {activeDayLabel} Planı ({daySlots.length} Etüt)
            </h3>
            <span className="text-[11px] text-muted-foreground">Beklenmedik krizde talep iletebilirsin</span>
          </div>

          {daySlots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-xs text-muted-foreground">
              Bu güne atanmış bir etüt yok. Dinlenme veya serbest tekrar yapabilirsin.
            </div>
          ) : (
            daySlots.map((slot) => {
              const hasQ = typeof slot.target_questions === "number";
              const hasD = typeof slot.duration_minutes === "number";
              const req = slot.active_request;

              return (
                <div
                  key={slot.id}
                  className={`rounded-2xl border p-4 shadow-sm transition bg-card ${
                    slot.is_completed ? "border-emerald-500/40 bg-emerald-500/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() =>
                        toggleSlotMutation.mutate({
                          slotId: slot.id,
                          is_completed: !slot.is_completed,
                        })
                      }
                      className="mt-0.5 shrink-0 text-muted-foreground transition hover:text-primary cursor-pointer"
                    >
                      {slot.is_completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-sm text-foreground">{slot.lesson}</span>
                        <span className="text-xs text-muted-foreground">· {slot.topic}</span>
                      </div>

                      {(hasQ || hasD) && (
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                          {hasQ && (
                            <span className="flex items-center gap-1">
                              <Flame className="h-3.5 w-3.5 text-primary" /> {slot.target_questions} Soru
                            </span>
                          )}
                          {hasD && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {slot.duration_minutes} Dk
                            </span>
                          )}
                        </div>
                      )}

                      {req && (
                        <div className="mt-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2 text-[10px] text-amber-700 dark:text-amber-300">
                          <strong>Koç Onayında:</strong> {req.type === "tasi" ? `${DAYS.find((d) => d.key === req.requested_day)?.label}'e taşıma` : "Yük hafifletme"} talebi iletildi ({req.reason}).
                        </div>
                      )}
                    </div>

                    {!req && (
                      <button
                        onClick={() => {
                          setTargetSlotForRequest(slot);
                          setRequestReason("");
                        }}
                        className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:border-primary hover:text-primary transition cursor-pointer"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        <span>Talep</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Hafta İçi Talep Modalı */}
      {targetSlotForRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 pb-20 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Hafta İçi Değişiklik Talebi Bildir</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              "{targetSlotForRequest.lesson} - {targetSlotForRequest.topic}" görevi için beklenmedik bir durum mu çıktı?
            </p>

            <form onSubmit={handleSendRequest} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Talep Türü</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestType("tasi")}
                    className={`rounded-xl py-2 text-xs font-semibold transition cursor-pointer ${
                      requestType === "tasi" ? "bg-primary text-primary-foreground" : "border border-border bg-muted/40"
                    }`}
                  >
                    Başka Güne Al
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType("hafiflet")}
                    className={`rounded-xl py-2 text-xs font-semibold transition cursor-pointer ${
                      requestType === "hafiflet" ? "bg-primary text-primary-foreground" : "border border-border bg-muted/40"
                    }`}
                  >
                    Soru/Süre Azalt
                  </button>
                </div>
              </div>

              {requestType === "tasi" && (
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Hangi Güne Alalım?</label>
                  <select
                    value={targetDaySelect}
                    onChange={(e) => setTargetDaySelect(e.target.value as DayKey)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2 text-xs font-bold outline-none"
                  >
                    {DAYS.map((d) => (
                      <option key={d.key} value={d.key}>{d.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Gerekçen (Koçun görecek)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Örn: Yarın Kimya yazılısı açıklandı, bu akşam Kimya tekrarı yapmam gerek..."
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetSlotForRequest(null)}
                  className="rounded-xl px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitRequestMutation.isPending}
                  className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 cursor-pointer"
                >
                  {submitRequestMutation.isPending ? "İletiliyor..." : "Koça İlet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* A4 Haftalık Çizelge Modalı */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4 bg-muted/30">
              <div>
                <h3 className="text-sm font-bold text-foreground">Haftalık Çalışma Çizelgesi (A4 Görünümü)</h3>
                <p className="text-[11px] text-muted-foreground">Öğrenci: {schedule.student_name} · {schedule.week_range}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Hazırlanıyor...
                    </>
                  ) : (
                    <>
                      <Printer className="h-3.5 w-3.5" /> Yazdır / PDF
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto p-4">
              <div id="pdf-table-container" className="min-w-[700px] rounded-2xl border border-border bg-background p-3">
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((d) => {
                    const items = schedule.slots.filter((s) => s.day === d.key);
                    return (
                      <div key={d.key} className="flex flex-col rounded-xl border border-border/80 bg-card p-2 min-h-[320px]">
                        <div className="border-b border-border/70 pb-1.5 text-center">
                          <span className="block text-[11px] font-bold text-foreground uppercase">{d.label}</span>
                          <span className="text-[9px] text-muted-foreground">{items.length} Etüt</span>
                        </div>
                        <div className="mt-2 space-y-1.5 flex-1 overflow-y-auto">
                          {items.length === 0 ? (
                            <span className="block pt-6 text-center text-[10px] text-muted-foreground italic">- Serbest -</span>
                          ) : (
                            items.map((it) => {
                              const hasQ = typeof it.target_questions === "number";
                              const hasD = typeof it.duration_minutes === "number";
                              return (
                                <div key={it.id} className="rounded-lg border border-border/60 bg-muted/40 p-1.5 text-[10px]">
                                  <strong className="block text-foreground truncate">{it.lesson}</strong>
                                  <span className="block text-muted-foreground leading-tight text-[9px] mt-0.5 line-clamp-2">{it.topic}</span>
                                  {(hasQ || hasD) && (
                                    <div className="mt-1 flex flex-wrap gap-1 text-[8px] font-semibold text-primary border-t border-border/40 pt-0.5">
                                      {hasQ && <span>🎯 {it.target_questions} Soru</span>}
                                      {hasD && <span>⏱️ {it.duration_minutes} Dk</span>}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}