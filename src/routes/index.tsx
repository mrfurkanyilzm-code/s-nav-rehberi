import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Flame,
  Star,
  Plus,
  GraduationCap,
  Check,
  Building2,
  Clock,
  Users,
  Target,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Lock,
  BookOpen,
} from "lucide-react";
import { Screen, SectionTitle } from "@/components/BottomNav";
import {
  useAddMockEvent,
  useGoal,
  useMockEvents,
  useUpdateMockEventTarget,
  useTasks,
  useToggleTask,
  trTarih,
} from "@/lib/data";
import { getStudentProfile, StudentProfileData } from "@/lib/onboardingStore";
import { OnboardingModal } from "@/components/OnboardingModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sınav Koçluğu — Hedef Takip ve Günlük Görevler" },
      {
        name: "description",
        content:
          "Sınav geri sayımı, deneme takvimi, günlük soru hedefleri ve seri takibi tek ekranda.",
      },
    ],
  }),
  component: Home,
});

function useCountdown(examDate?: string | null) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!now || !examDate) return null;
    const diff = Math.max(0, new Date(examDate).getTime() - now.getTime());
    return {
      gun: Math.floor(diff / 86400000),
      saat: Math.floor(diff / 3600000) % 24,
      dakika: Math.floor(diff / 60000) % 60,
      saniye: Math.floor(diff / 1000) % 60,
    };
  }, [now, examDate]);
}

export function Home() {
  const navigate = useNavigate();

  // Oturum kontrolü: Oturum yoksa doğrudan giriş/kayıt ekranına yönlendirir
  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      navigate({ to: "/auth" });
    }
  }, [navigate]);

  const { data: hedef } = useGoal();
  const { data: denemeler = [] } = useMockEvents();
  const { data: gorevler = [] } = useTasks();
  const toggleTask = useToggleTask();
  const addEvent = useAddMockEvent();
  const updateTargetMutation = useUpdateMockEventTarget();
  const kalan = useCountdown(hedef?.exam_date);

  // Onboarding & Profil State'i
  const [profile, setProfile] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Ana sayfaya girişte kayıtlı profili yükler
  useEffect(() => {
    const loadProfile = () => {
      try {
        const rawLocal = localStorage.getItem("student_profile_data") || localStorage.getItem("user_profile");
        if (rawLocal) {
          setProfile(JSON.parse(rawLocal));
          return;
        }
      } catch (e) {
        console.error("Profil parse hatası:", e);
      }
      const saved = getStudentProfile();
      if (saved) {
        setProfile(saved);
      }
    };

    loadProfile();
  }, []);

  // Topluluk State'leri
  const [communityCode, setCommunityCode] = useState("");
  const [studentNo, setStudentNo] = useState("");
  const [membershipStatus, setMembershipStatus] = useState<"idle" | "pending" | "approved">("idle");
  const [joinedCommunity, setJoinedCommunity] = useState<string | null>(null);

  // Takvim Modal State'i
  const [acik, setAcik] = useState(false);
  const [form, setForm] = useState({ ad: "", tarih: "" });

  const [activeTargetPromptId, setActiveTargetPromptId] = useState<string | null>(null);
  const [targetInputVal, setTargetInputVal] = useState("");

  const handleJoinCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityCode.trim()) return;
    setMembershipStatus("pending");
    setJoinedCommunity("Kavram Kurs Merkezi");
  };

  const handleSaveExamTarget = (examId: string) => {
    const num = Number(targetInputVal);
    if (!isNaN(num) && num > 0) {
      updateTargetMutation.mutate({ id: examId, target_net: num });
    }
    setActiveTargetPromptId(null);
    setTargetInputVal("");
  };

  const tamam = gorevler.filter((g) => g.is_done).length;
  const yuzde = gorevler.length ? Math.round((tamam / gorevler.length) * 100) : 0;

  // Bugünün tarihi (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split("T")[0] ?? "";

  // Sınav günü veya sonrası kilitli sayılır
  const isPastOrToday = (eventDate: string) => eventDate <= todayStr;

  // Yaklaşan ve henüz kilitlenmemiş ilk deneme
  const upcomingExam = denemeler.find(
    (d) => d.status !== "tamamlandi" && !isPastOrToday(d.event_date)
  );
  const upcomingTarget = upcomingExam?.target_net;

  const isLGS = profile?.track === "LGS_KLASIK" || profile?.track === "LGS_MAARIF";

  // Kesin ve güvenli hedef metinleri oluşturma (undefined kalmasını tamamen engeller)
  const displayTargetSchool = useMemo(() => {
    if (isLGS) {
      return profile?.targetSchool || "Hedef Lise Belirleniyor...";
    }
    const school =
      profile?.targetUniversity ||
      profile?.university ||
      profile?.targetSchool ||
      hedef?.university ||
      "Boğaziçi Üniversitesi";

    const department =
      profile?.targetDepartment ||
      profile?.department ||
      hedef?.department ||
      "Yönetim Bilişim Sistemleri (YBS)";

    return `${school} — ${department}`;
  }, [profile, hedef, isLGS]);

  const displayTargetRank = useMemo(() => {
    const rawRank =
      profile?.targetRank ||
      profile?.targetRankOrScore ||
      profile?.targetRanking ||
      profile?.ranking ||
      profile?.rank ||
      (hedef?.target_rank ? `${hedef.target_rank}. sıra` : null) ||
      "709. sıra";

    // Eğer zaten "Hedef: " veya "İlk" içeriyorsa formatla
    if (String(rawRank).startsWith("Hedef:")) return rawRank;
    return `Hedef: ${rawRank}`;
  }, [profile, hedef]);

  return (
    <>
      {showOnboarding && (
        <OnboardingModal
          onComplete={(newProfile: StudentProfileData) => {
            setProfile(newProfile);
            setShowOnboarding(false);
          }}
        />
      )}

      <Screen
        title={`Merhaba ${hedef?.student_name ?? "Öğrenci"} 👋`}
        subtitle="Bugün de bir adım daha yaklaşıyoruz."
      >
        {/* Hedef + Geri Sayım */}
        <section className="relative rounded-3xl bg-primary p-5 text-primary-foreground shadow-[var(--shadow-soft)]">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 text-xs font-medium opacity-90">
              {isLGS ? (
                <BookOpen className="h-4 w-4 shrink-0" />
              ) : (
                <GraduationCap className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">
                {displayTargetSchool}
              </span>
            </div>

            <button
              onClick={() => setShowOnboarding(true)}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold text-primary-foreground hover:bg-white/20 active:scale-95 transition cursor-pointer"
              title="Hedef ve Kulvarı Değiştir"
            >
              <Edit2 className="h-3 w-3" />
              <span>Değiştir</span>
            </button>
          </div>

          <p className="mt-1 text-lg font-semibold">
            {displayTargetRank}
          </p>

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
          <p className="mt-3 text-[11px] opacity-75">
            {isLGS ? "LGS'ye kalan süre" : "YKS'ye kalan süre"}
          </p>
        </section>

        {/* Sınav Öncesi Hedef Net Bildirim Kartı */}
        {upcomingExam && (
          <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-sm transition">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Target className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {typeof upcomingTarget === "number" ? "Sınav Hedefin Belirlendi" : "Sınav Öncesi Hedefini Belirle"}
                  </span>
                  <p className="truncate text-xs font-semibold text-foreground">
                    {upcomingExam.name}
                  </p>
                </div>
              </div>

              {typeof upcomingTarget === "number" ? (
                <button
                  onClick={() => {
                    setActiveTargetPromptId(upcomingExam.id);
                    setTargetInputVal(String(upcomingTarget));
                  }}
                  className="group flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground active:scale-95"
                >
                  <span>🎯 {upcomingTarget} Net</span>
                  <Edit2 className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveTargetPromptId(upcomingExam.id);
                    setTargetInputVal("");
                  }}
                  className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
                >
                  Hedef Koy
                </button>
              )}
            </div>

            {activeTargetPromptId === upcomingExam.id && (
              <div className="mt-3 flex items-center gap-2 border-t border-primary/20 pt-2.5">
                <span className="text-[11px] font-medium text-foreground">Hedef Net:</span>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Örn: 70"
                  value={targetInputVal}
                  onChange={(e) => setTargetInputVal(e.target.value)}
                  className="w-20 rounded-lg border border-primary bg-background px-2 py-1 text-center text-xs font-bold outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveExamTarget(upcomingExam.id)}
                  className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => setActiveTargetPromptId(null)}
                  className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                >
                  Vazgeç
                </button>
              </div>
            )}
          </div>
        )}

        {/* Topluluk / Dershane Katılım Kartı */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          {membershipStatus === "idle" && (
            <form onSubmit={handleJoinCommunity} className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Dershane / Koç Topluluğuna Katıl
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Koçunun veya dershanenin verdiği 6 haneli kodu girerek deneme sonuçlarını otomatik alabilirsin.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="KOD (Örn: KVR-842)"
                  value={communityCode}
                  onChange={(e) => setCommunityCode(e.target.value.toUpperCase())}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-xs uppercase outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <input
                  type="text"
                  placeholder="Öğrenci / Okul No"
                  value={studentNo}
                  onChange={(e) => setStudentNo(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
              >
                Katılma İsteği Gönder
              </button>
            </form>
          )}

          {membershipStatus === "pending" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-foreground">{joinedCommunity}</span>
                  <span className="text-[10px] text-muted-foreground">Katılım isteği koç onayında bekliyor</span>
                </div>
              </div>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-600">
                Onay Bekliyor
              </span>
            </div>
          )}

          {membershipStatus === "approved" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-foreground">{joinedCommunity}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Bağlantı Aktif · No: {studentNo}</span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                Kayıtlı
              </span>
            </div>
          )}
        </div>

        {/* Streak & Yıldız */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-streak" />
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {hedef?.streak_days ?? "—"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Günlük seri</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-star" fill="currentColor" />
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {hedef ? hedef.stars.toLocaleString("tr-TR") : "—"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Yıldız</p>
          </div>
        </div>

        {/* Deneme Takvimi */}
        <SectionTitle
          right={
            <button
              onClick={() => setAcik((v) => !v)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Takvime Ekle
            </button>
          }
        >
          Deneme Takvimi
        </SectionTitle>

        {acik && (
          <form
            className="mb-3 space-y-2 rounded-2xl border border-border bg-card p-3"
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
                }
              );
            }}
          >
            <input
              value={form.ad}
              onChange={(e) => setForm({ ...form, ad: e.target.value })}
              placeholder="Deneme adı (örn. 345 TYT-5 veya LGS Denemesi)"
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
              className="w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {addEvent.isPending ? "Ekleniyor…" : "Takvime Planla"}
            </button>
          </form>
        )}

        {/* Deneme Kartları Listesi */}
        <ul className="space-y-2.5">
          {denemeler.map((d) => {
            const targetNet = d.target_net;
            const hasTarget = typeof targetNet === "number";
            const isCompleted = d.status === "tamamlandi";
            const isLocked = isCompleted || isPastOrToday(d.event_date);
            const achieved = d.achieved_net;
            const isTargetPassed =
              hasTarget &&
              typeof achieved === "number" &&
              achieved >= targetNet;

            return (
              <li
                key={d.id}
                className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition"
              >
                {isCompleted && hasTarget && (
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      isTargetPassed
                        ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                        : "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                    }`}
                  />
                )}

                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 pl-1">
                    <p className="truncate text-sm font-semibold text-foreground">{d.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {d.provider} · {trTarih(d.event_date)} · {d.type}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompleted && hasTarget && typeof targetNet === "number" ? (
                      <div
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          isTargetPassed
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isTargetPassed ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {achieved ?? "—"} / {targetNet} Net
                        </span>
                      </div>
                    ) : hasTarget && typeof targetNet === "number" ? (
                      isLocked ? (
                        <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                          <Lock className="h-3 w-3" />
                          Hedef: {targetNet} Net
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveTargetPromptId(d.id);
                            setTargetInputVal(String(targetNet));
                          }}
                          className="group flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
                        >
                          <span>🎯 Hedef: {targetNet} Net</span>
                          <Edit2 className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100" />
                        </button>
                      )
                    ) : isLocked ? (
                      <span className="rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground/70">
                        Hedef Belirlenmedi
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveTargetPromptId(d.id);
                          setTargetInputVal("");
                        }}
                        className="rounded-full border border-dashed border-primary/60 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground active:scale-95"
                      >
                        + Hedef Belirle
                      </button>
                    )}
                  </div>
                </div>

                {activeTargetPromptId === d.id && !isLocked && (
                  <div className="mt-3 flex items-center gap-2 border-t border-border/50 pt-2.5">
                    <span className="text-[11px] font-medium text-muted-foreground">Hedef Netin:</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Örn: 70"
                      value={targetInputVal}
                      onChange={(e) => setTargetInputVal(e.target.value)}
                      className="w-20 rounded-lg border border-primary bg-background px-2 py-1 text-center text-xs font-bold outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveExamTarget(d.id)}
                      className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => setActiveTargetPromptId(null)}
                      className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                    >
                      Vazgeç
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Günün Görevleri */}
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
                onClick={() => toggleTask.mutate({ id: g.id, is_done: !g.is_done })}
                className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left"
              >
                <span
                  className={
                    "grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition-colors " +
                    (g.is_done ? "border-primary bg-primary" : "border-border bg-background")
                  }
                >
                  {g.is_done ? <Check className="h-4 w-4 text-primary-foreground" /> : null}
                </span>
                <span className="min-w-0">
                  <span
                    className={
                      "block truncate text-sm font-medium " +
                      (g.is_done ? "text-muted-foreground line-through" : "text-foreground")
                    }
                  >
                    {g.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{g.detail}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Screen>
    </>
  );
}