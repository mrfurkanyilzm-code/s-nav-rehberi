import { useState } from "react";
import { StudentProfileData } from "@/lib/onboardingStore";

interface OnboardingModalProps {
  onComplete: (data: StudentProfileData) => void;
}

const UNIVERSITIES = [
  "Boğaziçi Üniversitesi",
  "Orta Doğu Teknik Üniversitesi (ODTÜ)",
  "İstanbul Teknik Üniversitesi (İTÜ)",
  "Koç Üniversitesi",
  "Bilkent Üniversitesi",
  "Sabancı Üniversitesi",
  "Yıldız Teknik Üniversitesi (YTÜ)",
  "Hacettepe Üniversitesi",
  "Ankara Üniversitesi",
  "İstanbul Üniversitesi",
  "Gazi Üniversitesi",
  "Ege Üniversitesi",
  "Dokuz Eylül Üniversitesi",
  "Marmara Üniversitesi",
  "Gebze Teknik Üniversitesi",
  "Diğer",
] as const;

const DEPARTMENTS = [
  "Yönetim Bilişim Sistemleri (YBS)",
  "Bilgisayar Mühendisliği",
  "Yapay Zeka ve Veri Mühendisliği",
  "Tıp Fakültesi",
  "Hukuk Fakültesi",
  "Endüstri Mühendisliği",
  "Elektrik-Elektronik Mühendisliği",
  "İktisat / Ekonomi",
  "İşletme",
  "Diş Hekimliği",
  "Psikoloji",
  "Mimarlık",
  "Yazılım Mühendisliği",
  "Diğer",
] as const;

const TARGET_RANKS = [
  "İlk 100",
  "İlk 1.000",
  "İlk 5.000",
  "İlk 10.000",
  "İlk 20.000",
  "İlk 50.000",
  "İlk 100.000",
  "Özelleştir",
] as const;

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [, setStep] = useState<1 | 2>(2);
  const [field] = useState<"EA" | "SAY" | "SÖZ" | "DİL">("EA");

  // Seçim state'leri
  const [targetUniversity, setTargetUniversity] = useState<string>("Boğaziçi Üniversitesi");
  const [customUniversity, setCustomUniversity] = useState<string>("");

  const [targetDepartment, setTargetDepartment] = useState<string>("Yönetim Bilişim Sistemleri (YBS)");
  const [customDepartment, setCustomDepartment] = useState<string>("");

  const [targetRank, setTargetRank] = useState<string>("İlk 1.000");
  const [customRank, setCustomRank] = useState<string>("");

  const handleFinish = () => {
    const finalUniversity =
      targetUniversity === "Diğer"
        ? customUniversity.trim() || "Boğaziçi Üniversitesi"
        : targetUniversity;

    const finalDepartment =
      targetDepartment === "Diğer"
        ? customDepartment.trim() || "Yönetim Bilişim Sistemleri (YBS)"
        : targetDepartment;

    const finalRank =
      targetRank === "Özelleştir"
        ? customRank.trim() || "709. sıra"
        : targetRank;

    // Hem yeni hem eski olası anahtarları (alias) birlikte oluşturuyoruz
    const payload = {
      field,
      // Üniversite anahtarları
      targetUniversity: finalUniversity,
      university: finalUniversity,
      targetUni: finalUniversity,
      // Bölüm anahtarları
      targetDepartment: finalDepartment,
      department: finalDepartment,
      targetDept: finalDepartment,
      // Sıralama anahtarları
      targetRank: finalRank,
      ranking: finalRank,
      targetRanking: finalRank,
      rank: finalRank,
    };

    // localStorage'a kalıcı olarak yaz
    if (typeof window !== "undefined") {
      localStorage.setItem("student_profile_data", JSON.stringify(payload));
      localStorage.setItem("user_profile", JSON.stringify(payload));
    }

    onComplete(payload as unknown as StudentProfileData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8 space-y-6 text-foreground animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              ADIM 2 / 2
            </span>
            <h2 className="text-xl font-bold tracking-tight">Büyük Hedefini Belirle</h2>
          </div>
          <div className="flex gap-1.5">
            <div className="h-2 w-7 rounded-full bg-primary" />
            <div className="h-2 w-7 rounded-full bg-primary" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Koçluk panelini ve sayaçlarını motivasyon kaynağınla kişiselleştirelim:
        </p>

        <div className="space-y-4">
          {/* Üniversite Seçimi */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span>🏛️</span> Hedef Üniversite
            </label>
            <select
              value={targetUniversity}
              onChange={(e) => setTargetUniversity(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs font-medium outline-none transition focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              {UNIVERSITIES.map((uni) => (
                <option key={uni} value={uni}>
                  {uni}
                </option>
              ))}
            </select>
            {targetUniversity === "Diğer" && (
              <input
                type="text"
                required
                placeholder="Üniversite adını girin (Örn: Boğaziçi Üniversitesi)"
                value={customUniversity}
                onChange={(e) => setCustomUniversity(e.target.value)}
                className="w-full rounded-xl border border-primary/40 bg-background px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/40 animate-in fade-in duration-200"
              />
            )}
          </div>

          {/* Bölüm Seçimi */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span>🎓</span> Hedef Bölüm
            </label>
            <select
              value={targetDepartment}
              onChange={(e) => setTargetDepartment(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs font-medium outline-none transition focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {targetDepartment === "Diğer" && (
              <input
                type="text"
                required
                placeholder="Bölüm adını girin (Örn: Yönetim Bilişim Sistemleri (YBS))"
                value={customDepartment}
                onChange={(e) => setCustomDepartment(e.target.value)}
                className="w-full rounded-xl border border-primary/40 bg-background px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/40 animate-in fade-in duration-200"
              />
            )}
          </div>

          {/* Sıralama Seçimi */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span>🏆</span> Hedef Sıralama Aralığı
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TARGET_RANKS.map((rank) => {
                const isSelected = targetRank === rank;
                return (
                  <button
                    key={rank}
                    type="button"
                    onClick={() => setTargetRank(rank)}
                    className={`rounded-xl border py-2.5 px-1.5 text-center text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/30 scale-[1.02]"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {rank}
                  </button>
                );
              })}
            </div>
            {targetRank === "Özelleştir" && (
              <input
                type="text"
                required
                placeholder="Hedef sıralamanı yaz (Örn: 709. sıra veya İlk 300)"
                value={customRank}
                onChange={(e) => setCustomRank(e.target.value)}
                className="w-full rounded-xl border border-primary/40 bg-background px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/40 animate-in fade-in duration-200"
              />
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="rounded-xl border border-border px-5 py-3 text-xs font-semibold hover:bg-muted transition cursor-pointer"
          >
            Geri
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Koçluk Paneline Başla</span>
            <span>✓</span>
          </button>
        </div>
      </div>
    </div>
  );
}