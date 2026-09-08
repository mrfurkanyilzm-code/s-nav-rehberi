export type ExamTrack = "TYT" | "AYT";
export type ExamField = "EA" | "SAY" | "SOZ" | "DIL";

export type CurriculumTopic = {
  id: string;
  examTrack: ExamTrack;
  subject: string;
  topic: string;
};

export const TYT_SUBJECTS = [
  "Matematik",
  "Geometri",
  "Türkçe",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Tarih",
  "Coğrafya",
  "Felsefe",
  "Din",
] as const;

export const AYT_SUBJECTS_BY_FIELD: Record<ExamField, readonly string[]> = {
  EA: ["Matematik", "Geometri", "Edebiyat", "Tarih-1", "Coğrafya-1"],
  SAY: ["Matematik", "Geometri", "Fizik", "Kimya", "Biyoloji"],
  SOZ: ["Edebiyat", "Tarih-1", "Coğrafya-1", "Tarih-2", "Coğrafya-2", "Felsefe Grubu", "Din"],
  DIL: ["Kelime", "Dil Bilgisi", "Çeviri", "Paragraf", "Cloze Test", "Diyalog"],
};

export const EXAM_FIELDS = ["EA", "SAY", "SOZ", "DIL"] as const;

export const EXAM_FIELD_LABEL: Record<ExamField, string> = {
  EA: "EA",
  SAY: "SAY",
  SOZ: "SÖZ",
  DIL: "DİL",
};

const TR_FOLD: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

function slugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[çğıöşüâîû]/g, (ch) => TR_FOLD[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function topicId(examTrack: ExamTrack, subject: string, topic: string) {
  return `${slugPart(examTrack)}-${slugPart(subject)}-${slugPart(topic)}`;
}

function expand(
  examTrack: ExamTrack,
  subjects: Record<string, readonly string[]>,
): CurriculumTopic[] {
  return Object.entries(subjects).flatMap(([subject, topics]) =>
    topics.map((topic) => ({
      id: topicId(examTrack, subject, topic),
      examTrack,
      subject,
      topic,
    })),
  );
}

const TYT_TOPICS: Record<string, readonly string[]> = {
  Matematik: [
    "Temel Kavramlar",
    "Sayı Basamakları",
    "Bölme ve Bölünebilme",
    "EBOB-EKOK",
    "Rasyonel Sayılar",
    "Basit Eşitsizlikler",
    "Mutlak Değer",
    "Üslü Sayılar",
    "Köklü Sayılar",
    "Çarpanlara Ayırma",
    "Oran-Orantı",
    "Problemler",
    "Kümeler",
    "Mantık",
    "Fonksiyonlar",
    "Polinomlar",
    "İkinci Dereceden Denklemler",
    "Permütasyon-Kombinasyon",
    "Olasılık",
    "İstatistik",
  ],
  Geometri: [
    "Doğruda Açılar",
    "Üçgenler",
    "Üçgende Açı ve Kenar",
    "Üçgende Benzerlik",
    "Dik Üçgen",
    "Açıortay ve Kenarortay",
    "Çokgenler",
    "Dörtgenler",
    "Çember ve Daire",
    "Analitik Geometri",
    "Katı Cisimler",
  ],
  Türkçe: [
    "Sözcükte Anlam",
    "Cümlede Anlam",
    "Paragrafta Anlam",
    "Anlatım Biçimleri",
    "Paragraf Yapısı",
    "Ses Bilgisi",
    "Yazım Kuralları",
    "Noktalama",
    "Sözcük Türleri",
    "Cümlenin Ögeleri",
    "Fiilde Çatı",
    "Anlatım Bozuklukları",
  ],
  Fizik: [
    "Fizik Bilimine Giriş",
    "Madde ve Özellikleri",
    "Hareket ve Kuvvet",
    "Enerji",
    "Isı ve Sıcaklık",
    "Elektrostatik",
    "Elektrik ve Manyetizma",
    "Dalgalar",
    "Optik",
  ],
  Kimya: [
    "Kimya Bilimi",
    "Atom ve Periyodik Sistem",
    "Kimyasal Türler Arası Etkileşimler",
    "Maddenin Halleri",
    "Doğa ve Kimya",
    "Asitler Bazlar ve Tuzlar",
    "Kimya Her Yerde",
  ],
  Biyoloji: [
    "Canlıların Ortak Özellikleri",
    "Hücre",
    "Canlıların Sınıflandırılması",
    "Hücre Bölünmeleri",
    "Kalıtım",
    "Ekosistem Ekolojisi",
    "Güncel Çevre Sorunları",
  ],
  Tarih: [
    "Tarih ve Zaman",
    "İnsanlığın İlk Dönemleri",
    "Ortaçağ’da Dünya",
    "İlk ve Orta Osmanlı",
    "Osmanlı Yenileşme Hareketleri",
    "XX. Yüzyılda Osmanlı",
    "Milli Mücadele",
    "Atatürkçülük ve İnkılap Tarihi",
  ],
  Coğrafya: [
    "Doğa ve İnsan",
    "Harita Bilgisi",
    "Dünya’nın Şekli ve Hareketleri",
    "İklim Bilgisi",
    "Yeryüzü Şekilleri",
    "Nüfus ve Yerleşme",
    "Ekonomik Faaliyetler",
    "Türkiye’nin Coğrafi Bölgeleri",
  ],
  Felsefe: [
    "Felsefeye Giriş",
    "Bilgi Felsefesi",
    "Varlık Felsefesi",
    "Ahlak Felsefesi",
    "Siyaset Felsefesi",
    "Din Felsefesi",
    "Sanat Felsefesi",
    "Bilim Felsefesi",
  ],
  Din: [
    "İnanç",
    "İbadet",
    "Hz. Muhammed",
    "Vahiy ve Akıl",
    "Ahlak ve Değerler",
    "Din, Kültür ve Laiklik",
  ],
};

const AYT_TOPICS: Record<string, readonly string[]> = {
  Matematik: [
    "Fonksiyonlar",
    "Polinomlar",
    "İkinci Dereceden Denklemler",
    "Karmaşık Sayılar",
    "Eşitsizlikler",
    "Trigonometri",
    "Logaritma",
    "Diziler",
    "Limit",
    "Türev",
    "İntegral",
    "Olasılık",
  ],
  Geometri: [
    "Üçgenler",
    "Çember",
    "Analitik Geometri",
    "Konikler",
    "Uzay Geometri",
    "Vektörler",
  ],
  Fizik: [
    "Vektörler",
    "Kuvvet ve Hareket",
    "Enerji ve Momentum",
    "Çembersel Hareket",
    "Basit Harmonik Hareket",
    "Dalgalar",
    "Optik",
    "Elektrik Alan",
    "Manyetizma",
    "Modern Fizik",
  ],
  Kimya: [
    "Kimya ve Enerji",
    "Tepkime Hızları",
    "Kimyasal Denge",
    "Çözeltiler",
    "Asit-Baz Dengesi",
    "Elektrokimya",
    "Organik Kimyaya Giriş",
    "Karbon Kimyası",
  ],
  Biyoloji: [
    "Sinir Sistemi",
    "Endokrin Sistem",
    "Dolaşım Sistemi",
    "Solunum Sistemi",
    "Sindirim Sistemi",
    "Üreme Sistemi",
    "Moleküler Biyoloji",
    "Bitki Biyolojisi",
    "Komünite ve Popülasyon",
  ],
  Edebiyat: [
    "Güzel Sanatlar ve Edebiyat",
    "Şiir Bilgisi",
    "Anlatım Türleri",
    "Divan Edebiyatı",
    "Halk Edebiyatı",
    "Tanzimat Edebiyatı",
    "Servet-i Fünun",
    "Milli Edebiyat",
    "Cumhuriyet Dönemi",
  ],
  "Tarih-1": [
    "Osmanlı Siyasi Tarihi",
    "Osmanlı Toplum Yapısı",
    "XIX. Yüzyıl Osmanlı",
    "I. Dünya Savaşı",
    "Kurtuluş Savaşı",
    "Atatürk İlkeleri",
  ],
  "Coğrafya-1": ["Yerleşme", "Ekonomik Coğrafya", "Türkiye Ekonomisi", "Türkiye’de Nüfus"],
  "Tarih-2": [
    "İlk Çağ Uygarlıkları",
    "Türk-İslam Tarihi",
    "XX. Yüzyılda Dünya",
    "Soğuk Savaş ve Küreselleşme",
  ],
  "Coğrafya-2": ["Bölgeler ve Ülkeler", "Küreselleşme", "Çevre ve Sürdürülebilirlik", "Jeopolitik"],
  "Felsefe Grubu": ["Mantık", "Psikoloji", "Sosyoloji", "Felsefe Tarihi"],
  Din: ["Kur’an ve Yorum", "İslam Düşüncesi", "Din ve Hayat", "Güncel Dini Meseleler"],
  Kelime: ["Eş Anlamlılar", "Zıt Anlamlılar", "Phrasal Verbs", "Idioms", "Kelime Testleri"],
  "Dil Bilgisi": ["Tenses", "Modals", "Conditionals", "Relative Clauses", "Gerunds and Infinitives", "Prepositions"],
  "Çeviri": ["İngilizce-Türkçe Çeviri", "Türkçe-İngilizce Çeviri", "Cümle Çevirisi"],
  Paragraf: ["Ana Fikir", "Çıkarım", "Paragraf Soruları", "Anlam Bütünlüğü"],
  "Cloze Test": ["Cloze Test", "Cümleyi Tamamlama", "Anlamca En Yakın Cümle"],
  Diyalog: ["Diyalog Tamamlama", "Duruma Uygun İfade", "Anlam Bütünlüğünü Bozan Cümle"],
};

export const CURRICULUM_TOPICS: CurriculumTopic[] = [
  ...expand("TYT", TYT_TOPICS),
  ...expand("AYT", AYT_TOPICS),
];

export function parseExamField(value?: string | null, department?: string | null): ExamField {
  const haystack = `${value ?? ""} ${department ?? ""}`.toUpperCase();
  if (/\bDİL\b|\bDIL\b|\bYDT\b|\bYABANCI\b/.test(haystack)) return "DIL";
  if (/\bSAYISAL\b|\bSAY\b/.test(haystack)) return "SAY";
  if (/\bSÖZEL\b|\bSOZEL\b|\bSÖZ\b|\bSOZ\b/.test(haystack)) return "SOZ";
  if (/\bEŞIT\b|\bESIT\b|\bEA\b/.test(haystack)) return "EA";
  return "EA";
}

export function subjectsForTrack(track: ExamTrack, field: ExamField) {
  return track === "TYT" ? TYT_SUBJECTS : AYT_SUBJECTS_BY_FIELD[field];
}

export function topicsFor(track: ExamTrack, subject: string | "Tümü", field: ExamField) {
  const allowed = new Set(subjectsForTrack(track, field));
  return CURRICULUM_TOPICS.filter(
    (t) =>
      t.examTrack === track &&
      allowed.has(t.subject) &&
      (subject === "Tümü" || t.subject === subject),
  );
}
