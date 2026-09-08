import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Screen } from "@/components/BottomNav";
import { Upload, Sparkles, FileCheck2, Plus, Target, Check, Edit2, Clock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useExamResults, useMockEvents, useSaveExamResult, trTarih, MockEvent } from "@/lib/data";

export const Route = createFileRoute("/analitik")({
  head: () => ({
    meta: [
      { title: "Deneme Analitiği — Sınav Koçluğu" },
      {
        name: "description",
        content: "Net eğrisi, branş dökümleri ve karne analiz ekranı.",
      },
    ],
  }),
  component: Analitik,
});

export function Analitik() {
  const [examType, setExamType] = useState<"TYT" | "AYT">("TYT");
  const { data: exams = [] } = useExamResults();
  const { data: mockEvents = [] } = useMockEvents();
  const saveResultMutation = useSaveExamResult();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMockEvent, setSelectedMockEvent] = useState<MockEvent | null>(null);

  // Hedef Net State'leri
  const [tytTargetNet, setTytTargetNet] = useState(105);
  const [aytTargetNet, setAytTargetNet] = useState(70);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(String(tytTargetNet));

  const currentTargetNet = examType === "TYT" ? tytTargetNet : aytTargetNet;

  // Modal State'leri
  const [entryMode, setEntryMode] = useState<"ocr" | "manual">("ocr");
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);

  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [lessonInputs, setLessonInputs] = useState<
    { name: string; dogru: number; yanlis: number }[]
  >([]);

  const filteredExams = exams.filter((e) => e.type === examType);

  // Takvimde henüz sonucu girilmemiş tüm bekleyen denemeler
  const pendingEvents = mockEvents.filter((m) => m.status !== "tamamlandi");

  const maxNet =
    filteredExams.length > 0
      ? Math.max(...filteredExams.map((e) => e.totalNet))
      : 0;

  const lastExam = filteredExams[filteredExams.length - 1];
  const lastNet = lastExam ? lastExam.totalNet : 0;

  const avgNet =
    filteredExams.length > 0
      ? (
          filteredExams.reduce((acc, curr) => acc + curr.totalNet, 0) /
          filteredExams.length
        ).toFixed(2)
      : "0";

  // Grafik Koordinat Hesapları (Orijin (0,0) Başlangıçlı)
  const svgWidth = 360;
  const svgHeight = 250;
  const padLeft = 40;
  const padRight = 30;
  const padTop = 45;
  const padBottom = 40;

  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const maxCap = examType === "TYT" ? 120 : 80;
  const yTicks = examType === "TYT" ? [0, 30, 60, 90, 120] : [0, 20, 40, 60, 80];

  const originX = padLeft;
  const originY = padTop + plotHeight;

  const totalSteps = Math.max(1, filteredExams.length);

  const points = filteredExams.map((exam, idx) => {
    const step = idx + 1;
    const x = padLeft + (step / totalSteps) * plotWidth;
    const y = padTop + plotHeight - (exam.totalNet / maxCap) * plotHeight;

    const matchedMock = mockEvents.find(
      (m) => m.id === exam.mock_event_id || m.name.toLowerCase() === exam.name.toLowerCase()
    );
    const targetNet = matchedMock?.target_net;
    const hasTarget = typeof targetNet === "number";
    const isSuccess = hasTarget ? exam.totalNet >= targetNet : undefined;

    return {
      x,
      y,
      net: exam.totalNet,
      step,
      label: `D${step}`,
      hasTarget,
      targetNet,
      isSuccess,
    };
  });

  const pathD =
    points.length > 0
      ? points.reduce(
          (acc, p) => `${acc} L ${p.x} ${p.y}`,
          `M ${originX} ${originY}`
        )
      : "";

  const targetY = padTop + plotHeight - (currentTargetNet / maxCap) * plotHeight;

  const handleSaveTarget = () => {
    const num = Number(tempTarget);
    if (!isNaN(num) && num > 0) {
      if (examType === "TYT") setTytTargetNet(num);
      else setAytTargetNet(num);
    }
    setIsEditingTarget(false);
  };

  const handleOpenModal = (presetEvent?: MockEvent) => {
    setScanCompleted(false);
    setIsScanning(false);
    setSelectedMockEvent(presetEvent ?? null);

    const targetType = presetEvent ? presetEvent.type : examType;
    setExamType(targetType);
    setExamName(presetEvent ? presetEvent.name : "");
    setExamDate(presetEvent ? trTarih(presetEvent.event_date) : "Bugün");

    setLessonInputs(
      targetType === "TYT"
        ? [
            { name: "Türkçe", dogru: 0, yanlis: 0 },
            { name: "Temel Mat", dogru: 0, yanlis: 0 },
            { name: "Sosyal Bil.", dogru: 0, yanlis: 0 },
            { name: "Fen Bil.", dogru: 0, yanlis: 0 },
          ]
        : [
            { name: "Matematik", dogru: 0, yanlis: 0 },
            { name: "Edebiyat", dogru: 0, yanlis: 0 },
            { name: "Tarih-1", dogru: 0, yanlis: 0 },
            { name: "Coğrafya-1", dogru: 0, yanlis: 0 },
          ]
    );
    setIsModalOpen(true);
  };

  const handleOcrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanCompleted(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanCompleted(true);
      if (!selectedMockEvent && !examName) {
        setExamName(
          examType === "TYT"
            ? "3D Türkiye Geneli TYT (Karneden Okundu)"
            : "Özdebir Türkiye Geneli AYT (Karneden Okundu)"
        );
      }
      if (examType === "TYT") {
        setLessonInputs([
          { name: "Türkçe", dogru: 35, yanlis: 4 },
          { name: "Temel Mat", dogru: 31, yanlis: 2 },
          { name: "Sosyal Bil.", dogru: 17, yanlis: 3 },
          { name: "Fen Bil.", dogru: 15, yanlis: 3 },
        ]);
      } else {
        setLessonInputs([
          { name: "Matematik", dogru: 33, yanlis: 2 },
          { name: "Edebiyat", dogru: 21, yanlis: 2 },
          { name: "Tarih-1", dogru: 9, yanlis: 1 },
          { name: "Coğrafya-1", dogru: 6, yanlis: 0 },
        ]);
      }
    }, 1200);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) return;

    let total = 0;
    const scores = lessonInputs.map((l) => {
      const net = Math.max(0, Number(l.dogru) - Number(l.yanlis) * 0.25);
      total += net;
      return {
        lesson: l.name,
        dogru: Number(l.dogru),
        yanlis: Number(l.yanlis),
        net: Number(net.toFixed(2)),
      };
    });

    const targetType = selectedMockEvent?.type ?? examType;

    saveResultMutation.mutate({
      mockEventId: selectedMockEvent?.id,
      name: examName,
      type: targetType,
      date: examDate || "Bugün",
      totalNet: Number(total.toFixed(2)),
      scores,
    });

    setIsModalOpen(false);
  };

  return (
    <Screen
      title="Deneme Analitiği"
      subtitle="Net eğrisi ve branş dökümleri"
    >
      <div className="space-y-4 pb-20">
        {/* 1. KISIM: Takvimden Gelen Sonuç Bekleyen Denemeler (En Üstte) */}
        {pendingEvents.length > 0 && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Takvimdeki Sınav Sonucunu Bekliyor ({pendingEvents.length})
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {pendingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between rounded-xl bg-card p-3 border border-border/70 shadow-sm"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate text-xs font-bold text-foreground">{evt.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {trTarih(evt.event_date)} · {evt.type} {typeof evt.target_net === "number" ? `(Hedef: ${evt.target_net})` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenModal(evt)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
                  >
                    <span>Karne Yükle</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. KISIM: TYT / AYT Seçimi ve Yeni Deneme */}
        <div className="flex items-center justify-between">
          <div className="flex w-48 rounded-xl bg-muted p-1">
            <button
              onClick={() => {
                setExamType("TYT");
                setTempTarget(String(tytTargetNet));
                setIsEditingTarget(false);
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                examType === "TYT"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              TYT ({exams.filter((e) => e.type === "TYT").length})
            </button>
            <button
              onClick={() => {
                setExamType("AYT");
                setTempTarget(String(aytTargetNet));
                setIsEditingTarget(false);
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                examType === "AYT"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              AYT ({exams.filter((e) => e.type === "AYT").length})
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" /> Yeni Deneme
          </button>
        </div>

        {/* 3. KISIM: İstatistik Özet Kartları */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
            <span className="text-[11px] text-muted-foreground">Son Net</span>
            <p className="mt-1 text-xl font-bold">{lastNet}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
            <span className="text-[11px] text-muted-foreground">Ortalama</span>
            <p className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">
              {avgNet}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
            <span className="text-[11px] text-muted-foreground">En Yüksek</span>
            <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {maxNet}
            </p>
          </div>
        </div>

        {/* 4. KISIM: Matematiksel Eksenli & Hedef Bazlı Renklenen Net Gelişim Grafiği */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {examType} Değer Skalası (Net Eğrisi)
              </h2>
            </div>

            {/* Genel Hedef Net Düzenleme */}
            {isEditingTarget ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max={maxCap}
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  className="w-14 rounded-lg border border-emerald-500 bg-background px-1.5 py-0.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveTarget}
                  className="rounded-lg bg-emerald-600 p-1 text-white hover:bg-emerald-700"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempTarget(String(currentTargetNet));
                  setIsEditingTarget(true);
                }}
                className="group flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 transition hover:border-emerald-500 hover:bg-emerald-500/15"
              >
                <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Genel Hedef: {currentTargetNet} Net</span>
                <Edit2 className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100" />
              </button>
            )}
          </div>

          {filteredExams.length === 0 ? (
            <div className="flex h-44 flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Henüz kaydedilmiş {examType} denemesi yok.</span>
              {pendingEvents.some((p) => p.type === examType) && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  Yukarıdaki "Karne Yükle" butonuna tıklayarak ilk sonucunuzu ekleyebilirsiniz.
                </span>
              )}
            </div>
          ) : (
            <div className="w-full">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="h-60 w-full overflow-visible"
              >
                {/* 1. Yatay Izgara Çizgileri ve Y Ekseni Değerleri */}
                {yTicks.map((val) => {
                  const y = padTop + plotHeight - (val / maxCap) * plotHeight;
                  return (
                    <g key={val}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={svgWidth - padRight}
                        y2={y}
                        stroke="currentColor"
                        className="text-border/60"
                        strokeWidth="1"
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 3.5}
                        textAnchor="end"
                        className="fill-muted-foreground text-[10px] font-medium"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* 2. Dikey Izgara Çizgileri */}
                {points.map((p) => (
                  <line
                    key={p.step}
                    x1={p.x}
                    y1={padTop}
                    x2={p.x}
                    y2={padTop + plotHeight}
                    stroke="currentColor"
                    className="text-border/60"
                    strokeWidth="1"
                  />
                ))}

                {/* 3. Ana Eksen Çizgileri */}
                <line
                  x1={padLeft}
                  y1={padTop}
                  x2={padLeft}
                  y2={padTop + plotHeight}
                  stroke="currentColor"
                  className="text-foreground/70"
                  strokeWidth="1.5"
                />
                <line
                  x1={padLeft}
                  y1={padTop + plotHeight}
                  x2={svgWidth - padRight}
                  y2={padTop + plotHeight}
                  stroke="currentColor"
                  className="text-foreground/70"
                  strokeWidth="1.5"
                />

                {/* Orijin (0) Etiketi */}
                <text
                  x={padLeft}
                  y={padTop + plotHeight + 14}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px] font-semibold"
                >
                  0
                </text>

                {/* 4. Hedef Baraj Çizgisi */}
                {targetY >= padTop && targetY <= padTop + plotHeight && (
                  <g>
                    <line
                      x1={padLeft}
                      y1={targetY}
                      x2={svgWidth - padRight}
                      y2={targetY}
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <rect
                      x={padLeft + 4}
                      y={targetY - 14}
                      width="60"
                      height="12"
                      rx="3"
                      className="fill-emerald-500/20"
                    />
                    <text
                      x={padLeft + 8}
                      y={targetY - 5}
                      className="fill-emerald-600 dark:fill-emerald-400 text-[9px] font-bold"
                    >
                      Hedef: {currentTargetNet}
                    </text>
                  </g>
                )}

                {/* 5. Ana Gelişim Çizgisi */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* 6. Veri Noktaları & Koordinat Etiketleri */}
                {points.map((p) => {
                  const strokeColor =
                    p.isSuccess === true
                      ? "#10b981"
                      : p.isSuccess === false
                      ? "#f43f5e"
                      : "#3b82f6";

                  const textColor =
                    p.isSuccess === true
                      ? "fill-emerald-600 dark:fill-emerald-400"
                      : p.isSuccess === false
                      ? "fill-rose-600 dark:fill-rose-400"
                      : "fill-foreground";

                  const badgeBg =
                    p.isSuccess === true
                      ? "fill-emerald-500/10 stroke-emerald-500/40"
                      : p.isSuccess === false
                      ? "fill-rose-500/10 stroke-rose-500/40"
                      : "fill-card stroke-border/70";

                  return (
                    <g key={p.step} className="transition-transform hover:scale-105">
                      <rect
                        x={p.x - 24}
                        y={p.y - 20}
                        width="48"
                        height="14"
                        rx="4"
                        strokeWidth="1"
                        className={badgeBg}
                      />
                      <text
                        x={p.x}
                        y={p.y - 10}
                        textAnchor="middle"
                        className={`text-[10px] font-bold ${textColor}`}
                      >
                        ({p.step}, {p.net})
                      </text>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        fill="white"
                        stroke={strokeColor}
                        strokeWidth="2.5"
                        className="dark:fill-slate-900"
                      />
                      <text
                        x={p.x}
                        y={padTop + plotHeight + 14}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[10px] font-semibold"
                      >
                        {p.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="flex items-center justify-center gap-1 pt-1 text-[11px] font-medium text-muted-foreground">
                <span>Aralıklar (Denemeler)</span>
                <span>⟶</span>
              </div>
            </div>
          )}
        </div>

        {/* 5. KISIM: Deneme Geçmişi Listesi (En Son Girilen En Üstte) */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {examType} Deneme Geçmişi
          </h2>

          {[...filteredExams].reverse().map((exam) => {
            const matchedMock = mockEvents.find(
              (m) => m.id === exam.mock_event_id || m.name.toLowerCase() === exam.name.toLowerCase()
            );
            const targetNet = matchedMock?.target_net;
            const hasTarget = typeof targetNet === "number";
            const isTargetPassed = hasTarget && exam.totalNet >= targetNet;
            const diff = hasTarget ? Number((exam.totalNet - targetNet).toFixed(2)) : 0;

            return (
              <div
                key={exam.id}
                className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition"
              >
                {hasTarget && (
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      isTargetPassed
                        ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                        : "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                    }`}
                  />
                )}

                <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                  <div className="min-w-0 pl-1">
                    <h3 className="truncate text-sm font-semibold">{exam.name}</h3>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[11px] text-muted-foreground">{exam.date}</span>
                      {hasTarget && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                            isTargetPassed
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isTargetPassed ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          Hedef: {targetNet} ({diff >= 0 ? `+${diff}` : diff})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-primary">
                      {exam.totalNet}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">Net</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {exam.scores.map((sc, i) => (
                    <div key={i} className="rounded-xl bg-muted/50 p-2">
                      <p className="truncate text-[10px] font-medium text-muted-foreground">
                        {sc.lesson}
                      </p>
                      <p className="mt-0.5 text-xs font-bold">{sc.net}</p>
                      <span className="text-[9px] text-muted-foreground">
                        {sc.dogru}D {sc.yanlis}Y
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Yeni Deneme Ekle & OCR Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 pb-16 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-3xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold">
                {selectedMockEvent ? `${selectedMockEvent.name} Sonucu Ekle` : `Yeni ${examType} Denemesi Ekle`}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-xs text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto pr-1">
              <div className="mt-3 flex rounded-xl bg-muted p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setEntryMode("ocr")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition ${
                    entryMode === "ocr"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Karne Oku (OCR)
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode("manual")}
                  className={`flex-1 rounded-lg py-1.5 transition ${
                    entryMode === "manual"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  Elle Gir
                </button>
              </div>

              <form onSubmit={handleSaveExam} className="mt-3 space-y-3">
                {entryMode === "ocr" && (
                  <div>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-3 text-center transition hover:bg-primary/10">
                      <Upload className="h-5 w-5 text-primary" />
                      <span className="mt-1 text-xs font-bold text-foreground">
                        {isScanning
                          ? "Karne Okunuyor & Netler Çıkarılıyor..."
                          : "Karne Fotoğrafı veya PDF Seç"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        PNG, JPG veya PDF formatında yükleyin
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleOcrUpload}
                        disabled={isScanning}
                        className="hidden"
                      />
                    </label>

                    {scanCompleted && (
                      <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-emerald-500/10 p-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <FileCheck2 className="h-4 w-4 shrink-0" />
                        Karne başarıyla okundu, dersler dolduruldu!
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Deneme / Yayın Adı
                  </label>
                  <input
                    type="text"
                    required
                    readOnly={Boolean(selectedMockEvent)}
                    placeholder="Örn: 3D TG-1, Bilgi Sarmal..."
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary read-only:opacity-75"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Tarih
                  </label>
                  <input
                    type="text"
                    readOnly={Boolean(selectedMockEvent)}
                    placeholder="Örn: 14 Kasım veya Bugün"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary read-only:opacity-75"
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Ders Sonuçları (Doğru / Yanlış)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {lessonInputs.map((lesson, idx) => (
                      <div
                        key={lesson.name}
                        className="flex items-center justify-between rounded-xl bg-muted/40 p-2 text-xs"
                      >
                        <span className="truncate text-[11px] font-medium">{lesson.name}</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            placeholder="D"
                            value={lesson.dogru || ""}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setLessonInputs((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, dogru: val } : item
                                )
                              );
                            }}
                            className="w-9 rounded-lg border border-border bg-background py-1 text-center text-xs font-bold outline-none"
                          />
                          <input
                            type="number"
                            min="0"
                            placeholder="Y"
                            value={lesson.yanlis || ""}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setLessonInputs((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, yanlis: val } : item
                                )
                              );
                            }}
                            className="w-9 rounded-lg border border-border bg-background py-1 text-center text-xs font-bold outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isScanning || saveResultMutation.isPending}
                    className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-50"
                  >
                    {saveResultMutation.isPending ? "Kaydediliyor..." : "Sonuçları Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}