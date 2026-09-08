import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Screen, SectionTitle } from "@/components/BottomNav";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Sparkles,
  User,
  Layers,
  X,
} from "lucide-react";
import { useMockEvents, useAddMockEvent, trTarih, MockEvent } from "@/lib/data";

export const Route = createFileRoute("/takvim")({
  head: () => ({
    meta: [
      { title: "Deneme Takvimi — Sınav Koçluğu" },
      { name: "description", content: "Aylık ve haftalık deneme sınavı takvimi." },
    ],
  }),
  component: TakvimPage,
});

// Yayınevi Mini Logosu (Kutucuklara tam oturan şık rozetler)
function PublisherLogoBadge({ provider, size = "sm" }: { provider: string; size?: "sm" | "md" }) {
  const p = provider.toLowerCase();

  if (p.includes("3d")) {
    return (
      <span
        className={`inline-flex items-center justify-center font-black tracking-tighter text-white bg-slate-900 rounded shadow-xs select-none ${
          size === "sm" ? "h-3.5 px-1 text-[7.5px]" : "h-5 px-1.5 text-[10px]"
        }`}
        title="3D Yayınları"
      >
        3D
      </span>
    );
  }
  if (p.includes("özdebir") || p.includes("ozdebir")) {
    return (
      <span
        className={`inline-flex items-center justify-center font-extrabold text-white bg-emerald-600 rounded shadow-xs select-none ${
          size === "sm" ? "h-3.5 px-1 text-[7.5px]" : "h-5 px-1.5 text-[10px]"
        }`}
        title="Özdebir Yayınları"
      >
        ÖZ
      </span>
    );
  }
  if (p.includes("bilgi sarmal")) {
    return (
      <span
        className={`inline-flex items-center justify-center font-extrabold text-amber-950 bg-amber-400 rounded shadow-xs select-none ${
          size === "sm" ? "h-3.5 px-1 text-[7.5px]" : "h-5 px-1.5 text-[10px]"
        }`}
        title="Bilgi Sarmal Yayınları"
      >
        BS
      </span>
    );
  }
  if (p.includes("töder") || p.includes("toder")) {
    return (
      <span
        className={`inline-flex items-center justify-center font-black text-white bg-rose-600 rounded shadow-xs select-none ${
          size === "sm" ? "h-3.5 px-1 text-[7.5px]" : "h-5 px-1.5 text-[10px]"
        }`}
        title="TÖDER Yayınları"
      >
        TD
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center font-bold text-muted-foreground bg-muted border border-border rounded select-none ${
        size === "sm" ? "h-3.5 px-1 text-[7.5px]" : "h-5 px-1.5 text-[10px]"
      }`}
    >
      KİŞİSEL
    </span>
  );
}

export function TakvimPage() {
  const { data: denemeler = [] } = useMockEvents();
  const addEventMutation = useAddMockEvent();

  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [viewMode, setViewMode] = useState<"aylik" | "liste">("aylik");
  const [filterType, setFilterType] = useState<"all" | "official" | "personal">("all");
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ ad: "", tarih: "", type: "TYT" as "TYT" | "AYT" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];

  const handlePrevMonth = () => {
    setSelectedDateStr(null);
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setSelectedDateStr(null);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Filtrelenmiş liste
  const filteredDenemeler = useMemo(() => {
    return denemeler.filter((exam: MockEvent) => {
      if (filterType === "official") return exam.is_official_tg;
      if (filterType === "personal") return !exam.is_official_tg;
      return true;
    });
  }, [denemeler, filterType]);

  // Seçilen günün sınavları
  const selectedDayExams = useMemo(() => {
    if (!selectedDateStr) return [];
    return denemeler.filter((d) => d.event_date === selectedDateStr);
  }, [denemeler, selectedDateStr]);

  // Ay günleri matrisi (Pazartesi = 0)
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) daysArray.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ad.trim() || !form.tarih) return;

    addEventMutation.mutate(
      {
        name: form.ad.trim(),
        event_date: form.tarih,
        type: form.type,
      },
      {
        onSuccess: () => {
          setForm({ ad: "", tarih: "", type: "TYT" });
          setIsModalOpen(false);
        },
      }
    );
  };

  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <Screen
      title="Deneme Takvimi"
      subtitle="Türkiye Geneli resmi sınavlar ve kişisel denemelerin"
    >
      <div className="space-y-4 pb-20">
        {/* Üst Görünüm Seçici & Ekle Butonu */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl bg-muted p-1">
            <button
              onClick={() => setViewMode("aylik")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "aylik" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setViewMode("liste")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "liste" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Liste
            </button>
          </div>

          <button
            onClick={() => {
              setForm({ ad: "", tarih: todayIso, type: "TYT" });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" /> Deneme Ekle
          </button>
        </div>

        {/* Kategori Filtresi */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterType("all")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition ${
              filterType === "all"
                ? "bg-foreground text-background"
                : "border border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>Tümü ({denemeler.length})</span>
          </button>
          <button
            onClick={() => setFilterType("official")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition ${
              filterType === "official"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Türkiye Geneli ({denemeler.filter((d) => d.is_official_tg).length})</span>
          </button>
          <button
            onClick={() => setFilterType("personal")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition ${
              filterType === "personal"
                ? "bg-foreground text-background"
                : "border border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <User className="h-3 w-3" />
            <span>Kişisel ({denemeler.filter((d) => !d.is_official_tg).length})</span>
          </button>
        </div>

        {/* Aylık Takvim Görünümü */}
        {viewMode === "aylik" && (
          <div className="space-y-3">
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              {/* Ay Değiştirme */}
              <div className="flex items-center justify-between pb-3">
                <button
                  onClick={handlePrevMonth}
                  className="rounded-xl border border-border p-1.5 text-muted-foreground hover:bg-muted transition cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h2 className="text-sm font-bold text-foreground">
                  {monthNames[month]} {year}
                </h2>
                <button
                  onClick={handleNextMonth}
                  className="rounded-xl border border-border p-1.5 text-muted-foreground hover:bg-muted transition cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Gün İsimleri */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted-foreground pb-2">
                <span>PZT</span>
                <span>SAL</span>
                <span>ÇAR</span>
                <span>PER</span>
                <span>CUM</span>
                <span>CMT</span>
                <span>PAZ</span>
              </div>

              {/* Gün Hücreleri */}
              <div className="grid grid-cols-7 gap-1">
                {daysArray.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="h-16 rounded-xl bg-muted/10" />;
                  }

                  const dayDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayExams = filteredDenemeler.filter((d) => d.event_date === dayDateStr);
                  const isToday = dayDateStr === todayIso;
                  const isSelected = selectedDateStr === dayDateStr;
                  const hasExams = dayExams.length > 0;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDateStr(isSelected ? null : dayDateStr)}
                      className={`relative flex h-16 flex-col justify-between rounded-xl border p-1 text-xs transition cursor-pointer text-left ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary shadow-md"
                          : isToday
                          ? "border-primary/60 bg-primary/5 font-bold"
                          : hasExams
                          ? "border-border bg-card hover:bg-muted/40"
                          : "border-border/40 bg-background/50 hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] ${isSelected || isToday ? "text-primary font-black" : "text-muted-foreground"}`}>
                          {day}
                        </span>
                        {hasExams && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </div>

                      {/* Hücre İçi Mini Rozet / Logo Alanı */}
                      <div className="space-y-1 overflow-hidden">
                        {dayExams.slice(0, 2).map((exam) => (
                          <div
                            key={exam.id}
                            title={`${exam.name} (${exam.provider})`}
                            className="flex items-center gap-1"
                          >
                            <PublisherLogoBadge provider={exam.provider} size="sm" />
                            <span className="text-[8px] font-bold text-foreground/80 truncate">
                              {exam.type}
                            </span>
                          </div>
                        ))}
                        {dayExams.length > 2 && (
                          <div className="text-[7.5px] font-bold text-muted-foreground pl-0.5">
                            +{dayExams.length - 2}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seçilen Gün Odak Kartı */}
            {selectedDateStr && (
              <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-primary/20">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      {trTarih(selectedDateStr)} Sınavları
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedDateStr(null)}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-primary/10 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {selectedDayExams.length === 0 ? (
                  <div className="pt-3 text-center text-xs text-muted-foreground">
                    Bu tarihe ait planlanmış sınav bulunmuyor.
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {selectedDayExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="flex items-center justify-between rounded-xl bg-card border border-border p-3 shadow-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <PublisherLogoBadge provider={exam.provider} size="md" />
                            <span className="font-semibold text-xs text-foreground truncate">
                              {exam.name}
                            </span>
                            {exam.is_official_tg && (
                              <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                                TG
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {exam.type} {exam.target_net ? `· Hedef: ${exam.target_net} Net` : ""}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                            exam.status === "tamamlandi"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {exam.status === "tamamlandi" ? "Tamamlandı" : "Planlandı"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Liste Görünümü & Takvimdeki Denemeler */}
        <div className="space-y-3 pt-2">
          <SectionTitle right={<span className="text-xs text-muted-foreground">{filteredDenemeler.length} Deneme</span>}>
            {filterType === "official"
              ? "Türkiye Geneli Takvimi"
              : filterType === "personal"
              ? "Kişisel Denemeler"
              : "Planlanmış Sınavlar"}
          </SectionTitle>

          <div className="space-y-2">
            {filteredDenemeler.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                Bu filtreye uygun deneme bulunamadı.
              </p>
            ) : (
              filteredDenemeler.map((exam) => {
                const isDone = exam.status === "tamamlandi";

                return (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card p-3.5 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          isDone ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-5 w-5" /> : <CalendarIcon className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <PublisherLogoBadge provider={exam.provider} size="sm" />
                          <p className="truncate text-sm font-semibold text-foreground">{exam.name}</p>
                          {exam.is_official_tg && (
                            <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                              TG
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {trTarih(exam.event_date)} · {exam.type} {exam.target_net ? `(Hedef: ${exam.target_net} Net)` : ""}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        isDone
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {isDone ? "Tamamlandı" : "Planlandı"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Deneme Ekle Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 pb-20 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold">Yeni Deneme Planla</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-xs text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div className="flex rounded-xl bg-muted p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "TYT" })}
                  className={`flex-1 rounded-lg py-1.5 transition ${
                    form.type === "TYT" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  TYT
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "AYT" })}
                  className={`flex-1 rounded-lg py-1.5 transition ${
                    form.type === "AYT" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  AYT
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Deneme Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Evde Branş Denemesi, Kurum Denemesi..."
                  value={form.ad}
                  onChange={(e) => setForm({ ...form, ad: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Sınav Tarihi</label>
                <input
                  type="date"
                  required
                  value={form.tarih}
                  onChange={(e) => setForm({ ...form, tarih: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={addEventMutation.isPending}
                  className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-50"
                >
                  {addEventMutation.isPending ? "Ekleniyor..." : "Takvime Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Screen>
  );
}