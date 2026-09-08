import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Screen, SectionTitle } from "@/components/BottomNav";
import { BookOpen, Check, Layers } from "lucide-react";

export const Route = createFileRoute("/konular")({
  head: () => ({
    meta: [
      { title: "Konu Takibi — Sınav Koçluğu" },
      { name: "description", content: "TYT ve AYT ders konu listesi ve tamamlama durumu." },
    ],
  }),
  component: KonularPage,
});

interface TopicItem {
  id: string;
  name: string;
  isCompleted: boolean;
}

interface LessonGroup {
  lesson: string;
  type: "TYT" | "AYT";
  topics: TopicItem[];
}

const INITIAL_LESSONS: LessonGroup[] = [
  {
    lesson: "Matematik",
    type: "TYT",
    topics: [
      { id: "m1", name: "Temel Kavramlar & Sayı Basamakları", isCompleted: true },
      { id: "m2", name: "Bölme & Bölünebilme", isCompleted: true },
      { id: "m3", name: "Rasyonel Sayılar & Basit Eşitsizlik", isCompleted: true },
      { id: "m4", name: "Mutlak Değer & Üslü/Köklü Sayılar", isCompleted: true },
      { id: "m5", name: "Çarpanlara Ayırma & Oran-Orantı", isCompleted: false },
      { id: "m6", name: "Problemler (Sayı, Kesir, Yaş, Hız)", isCompleted: false },
      { id: "m7", name: "Kümeler & Mantık", isCompleted: false },
      { id: "m8", name: "Fonksiyonlar", isCompleted: true },
    ],
  },
  {
    lesson: "Fizik",
    type: "TYT",
    topics: [
      { id: "f1", name: "Fizik Bilimine Giriş", isCompleted: true },
      { id: "f2", name: "Madde ve Özellikleri", isCompleted: true },
      { id: "f3", name: "Kuvvet ve Hareket", isCompleted: false },
      { id: "f4", name: "İş, Güç ve Enerji", isCompleted: false },
      { id: "f5", name: "Isı ve Sıcaklık", isCompleted: false },
      { id: "f6", name: "Elektrostatik & Elektrik Akımı", isCompleted: false },
      { id: "f7", name: "Optik & Dalgalar", isCompleted: false },
    ],
  },
  {
    lesson: "Matematik",
    type: "AYT",
    topics: [
      { id: "am1", name: "Polinomlar & 2. Dereceden Denklemler", isCompleted: true },
      { id: "am2", name: "Parabol & Eşitsizlikler", isCompleted: true },
      { id: "am3", name: "Trigonometri", isCompleted: false },
      { id: "am4", name: "Logaritma & Diziler", isCompleted: true },
      { id: "am5", name: "Limit ve Süreklilik", isCompleted: false },
      { id: "am6", name: "Türev ve Uygulamaları", isCompleted: false },
      { id: "am7", name: "İntegral ve Alan Hesabı", isCompleted: false },
    ],
  },
  {
    lesson: "Edebiyat",
    type: "AYT",
    topics: [
      { id: "ed1", name: "Şiir Bilgisi & Nazım Şekilleri", isCompleted: true },
      { id: "ed2", name: "İslamiyet Öncesi & Geçiş Dönemi", isCompleted: true },
      { id: "ed3", name: "Divan Edebiyatı", isCompleted: false },
      { id: "ed4", name: "Halk Edebiyatı", isCompleted: false },
      { id: "ed5", name: "Tanzimat & Servet-i Fünun", isCompleted: false },
      { id: "ed6", name: "Cumhuriyet Dönemi Türk Edebiyatı", isCompleted: false },
    ],
  },
];

export function KonularPage() {
  const [selectedType, setSelectedType] = useState<"TYT" | "AYT">("TYT");
  const [lessons, setLessons] = useState<LessonGroup[]>(INITIAL_LESSONS);

  const filteredLessons = lessons.filter((l) => l.type === selectedType);

  const toggleTopic = (lessonName: string, topicId: string) => {
    setLessons((prev) =>
      prev.map((group) => {
        if (group.lesson === lessonName && group.type === selectedType) {
          return {
            ...group,
            topics: group.topics.map((t) =>
              t.id === topicId ? { ...t, isCompleted: !t.isCompleted } : t
            ),
          };
        }
        return group;
      })
    );
  };

  return (
    <Screen
      title="Konu Takibi"
      subtitle="Kazanım ve konu tamamlama listesi"
    >
      <div className="space-y-4 pb-20">
        {/* TYT / AYT Geçiş Butonları */}
        <div className="flex rounded-xl bg-muted p-1">
          <button
            onClick={() => setSelectedType("TYT")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              selectedType === "TYT"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            TYT Konuları
          </button>
          <button
            onClick={() => setSelectedType("AYT")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              selectedType === "AYT"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            AYT Konuları
          </button>
        </div>

        {/* Dersler ve Konu Listeleri */}
        <div className="space-y-4">
          {filteredLessons.map((group) => {
            const completedCount = group.topics.filter((t) => t.isCompleted).length;
            const progressPct = group.topics.length
              ? Math.round((completedCount / group.topics.length) * 100)
              : 0;

            return (
              <div key={group.lesson} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">{group.lesson}</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    %{progressPct} ({completedCount}/{group.topics.length})
                  </span>
                </div>

                {/* İlerleme Çubuğu */}
                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Konu Kutuları */}
                <div className="space-y-1.5">
                  {group.topics.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => toggleTopic(group.lesson, t.id)}
                      className="flex w-full items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-left text-xs transition hover:bg-muted/70 active:scale-[0.99]"
                    >
                      <span
                        className={`truncate font-medium ${
                          t.isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {t.name}
                      </span>
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${
                          t.isCompleted
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background"
                        }`}
                      >
                        {t.isCompleted && <Check className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}