import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Goal {
  id: string;
  student_name: string;
  university: string;
  department: string;
  target_rank: number;
  exam_date: string;
  streak_days: number;
  stars: number;
}

export interface MockEvent {
  id: string;
  name: string;
  event_date: string; // YYYY-MM-DD
  provider: string;
  type: "TYT" | "AYT";
  status: "planlandi" | "tamamlandi";
  is_official_tg: boolean; // Türkiye Geneli resmi deneme bayrağı
  target_net?: number | undefined;
  achieved_net?: number | undefined;
}

export interface Task {
  id: string;
  title: string;
  detail: string;
  is_done: boolean;
}

export interface ExamScore {
  lesson: string;
  dogru: number;
  yanlis: number;
  net: number;
}

export interface ExamResult {
  id: string;
  mock_event_id?: string | undefined;
  name: string;
  type: "TYT" | "AYT";
  date: string;
  totalNet: number;
  scores: ExamScore[];
}

export type DayKey = "pazartesi" | "sali" | "carsamba" | "persembe" | "cuma" | "cumartesi" | "pazar";

export interface SlotRequest {
  id: string;
  type: "tasi" | "hafiflet";
  requested_day?: DayKey | undefined;
  reason: string;
  status: "beklemede" | "onaylandi" | "reddedildi";
  coach_reply?: string | undefined;
  created_at: string;
}

export interface StudySlot {
  id: string;
  day: DayKey;
  lesson: string;
  topic: string;
  target_questions?: number | undefined;
  duration_minutes?: number | undefined;
  is_completed: boolean;
  is_coach_assigned: boolean;
  active_request?: SlotRequest | undefined;
}

export type ScheduleStatus = "taslak" | "aktif" | "revize_talep_var";

export interface MeetingOption {
  id: string;
  day_label: string;
  start_time: string;
  end_time: string;
  time_range: string;
}

export interface CoachMeetingPoll {
  is_poll_active: boolean;
  status: "kapali" | "secim_bekleniyor" | "saat_kesinlesti";
  options: MeetingOption[];
  selected_option?: MeetingOption | undefined;
  meet_url: string;
  joined_at?: number | undefined;
}

export interface WeeklySchedule {
  id: string;
  student_name: string;
  week_range: string;
  status: ScheduleStatus;
  student_note: string;
  coach_feedback?: string | undefined;
  meeting_poll: CoachMeetingPoll;
  slots: StudySlot[];
}

export function trTarih(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  } catch {
    return dateStr;
  }
}

// 1. STATİK BAŞLANGIÇ VERİLERİ
const INITIAL_GOAL: Goal = {
  id: "1",
  student_name: "Furkan",
  university: "Boğaziçi Üniversitesi",
  department: "YBS",
  target_rank: 709,
  exam_date: "2027-06-19T10:15:00",
  streak_days: 14,
  stars: 1250,
};

let TASKS: Task[] = [
  { id: "1", title: "Matematik - Fonksiyonlar", detail: "40 Soru Soru Bankası", is_done: true },
  { id: "2", title: "Paragraf Rutini", detail: "20 Soru Hız Denemesi", is_done: false },
  { id: "3", title: "Fizik - Vektörler", detail: "Konu Özeti + 15 Soru", is_done: false },
];

let MOCK_EVENTS: MockEvent[] = [
  // --- Tamamlanan Geçmiş Denemeler ---
  {
    id: "tg-3d-0",
    name: "3D Türkiye Geneli - Yaz",
    event_date: "2026-08-20",
    provider: "3D Yayınları",
    type: "TYT",
    status: "tamamlandi",
    is_official_tg: true,
    target_net: 90,
    achieved_net: 84.75,
  },
  {
    id: "tg-bs-0",
    name: "Bilgi Sarmal TYT Hazırlık",
    event_date: "2026-08-26",
    provider: "Bilgi Sarmal",
    type: "TYT",
    status: "tamamlandi",
    is_official_tg: true,
    target_net: 85,
    achieved_net: 89.5,
  },
  {
    id: "tg-ozdebir-0",
    name: "Özdebir Başlangıç TYT",
    event_date: "2026-09-01",
    provider: "Özdebir",
    type: "TYT",
    status: "tamamlandi",
    is_official_tg: true,
    target_net: 90,
    achieved_net: 94.25,
  },

  // --- 2026 Sezonu Resmi Türkiye Geneli Takvimi ---
  {
    id: "tg-bs-1",
    name: "Bilgi Sarmal AYT - 1",
    event_date: "2026-09-15",
    provider: "Bilgi Sarmal",
    type: "AYT",
    status: "planlandi",
    is_official_tg: true,
  },
  {
    id: "tg-bs-tyt1",
    name: "Bilgi Sarmal TYT - 1 (TG)",
    event_date: "2026-10-14",
    provider: "Bilgi Sarmal",
    type: "TYT",
    status: "planlandi",
    is_official_tg: true,
  },
  {
    id: "tg-ozdebir-1",
    name: "Özdebir Türkiye Geneli - 1",
    event_date: "2026-10-23",
    provider: "Özdebir",
    type: "TYT",
    status: "planlandi",
    is_official_tg: true,
  },
  {
    id: "tg-3d-1",
    name: "3D Türkiye Geneli - 1",
    event_date: "2026-11-06",
    provider: "3D Yayınları",
    type: "TYT",
    status: "planlandi",
    is_official_tg: true,
  },
  {
    id: "tg-toder-1",
    name: "TÖDER Genel Deneme Sınavı - 1",
    event_date: "2026-11-20",
    provider: "TÖDER",
    type: "TYT",
    status: "planlandi",
    is_official_tg: true,
  },
  {
    id: "tg-ozdebir-2",
    name: "Özdebir Türkiye Geneli - 2",
    event_date: "2026-12-11",
    provider: "Özdebir",
    type: "TYT",
    status: "planlandi",
    is_official_tg: true,
  },
  {
    id: "tg-3d-2",
    name: "3D Türkiye Geneli - 2",
    event_date: "2026-12-25",
    provider: "3D Yayınları",
    type: "TYT",
    status: "planlandi",
    is_official_tg: true,
  },
];

let EXAM_RESULTS: ExamResult[] = [
  {
    id: "1",
    mock_event_id: "tg-3d-0",
    name: "3D Türkiye Geneli - Yaz",
    type: "TYT",
    date: "20 Ağustos",
    totalNet: 84.75,
    scores: [
      { lesson: "Türkçe", dogru: 32, yanlis: 6, net: 30.5 },
      { lesson: "Temel Mat", dogru: 27, yanlis: 3, net: 26.25 },
      { lesson: "Sosyal Bil.", dogru: 16, yanlis: 4, net: 15.0 },
      { lesson: "Fen Bil.", dogru: 14, yanlis: 4, net: 13.0 },
    ],
  },
  {
    id: "2",
    mock_event_id: "tg-bs-0",
    name: "Bilgi Sarmal TYT Hazırlık",
    type: "TYT",
    date: "26 Ağustos",
    totalNet: 89.5,
    scores: [
      { lesson: "Türkçe", dogru: 34, yanlis: 4, net: 33.0 },
      { lesson: "Temel Mat", dogru: 29, yanlis: 2, net: 28.5 },
      { lesson: "Sosyal Bil.", dogru: 15, yanlis: 3, net: 14.25 },
      { lesson: "Fen Bil.", dogru: 15, yanlis: 5, net: 13.75 },
    ],
  },
  {
    id: "3",
    mock_event_id: "tg-ozdebir-0",
    name: "Özdebir Başlangıç TYT",
    type: "TYT",
    date: "1 Eylül",
    totalNet: 94.25,
    scores: [
      { lesson: "Türkçe", dogru: 36, yanlis: 3, net: 35.25 },
      { lesson: "Temel Mat", dogru: 32, yanlis: 2, net: 31.5 },
      { lesson: "Sosyal Bil.", dogru: 17, yanlis: 2, net: 16.5 },
      { lesson: "Fen Bil.", dogru: 12, yanlis: 4, net: 11.0 },
    ],
  },
];

let INITIAL_SCHEDULE: WeeklySchedule = {
  id: "week-1",
  student_name: "Furkan Yılmaz",
  week_range: "31 Ağustos - 6 Eylül 2026",
  status: "aktif",
  student_note: "Cuma günü okul çıkışı dershane var.",
  coach_feedback: undefined,
  meeting_poll: {
    is_poll_active: false,
    status: "kapali",
    options: [
      { id: "opt-1", day_label: "Cumartesi", start_time: "20:00", end_time: "20:45", time_range: "20:00 - 20:45" },
      { id: "opt-2", day_label: "Pazar", start_time: "14:00", end_time: "14:45", time_range: "14:00 - 14:45" },
      { id: "opt-3", day_label: "Pazar", start_time: "18:00", end_time: "18:45", time_range: "18:00 - 18:45" },
    ],
    selected_option: undefined,
    meet_url: "https://meet.google.com/koc-ogrenci-gorusme",
    joined_at: undefined,
  },
  slots: [
    { id: "s1", day: "pazartesi", lesson: "Matematik", topic: "Fonksiyonlar & Grafik Okuma", target_questions: 45, is_completed: true, is_coach_assigned: true },
    { id: "s2", day: "pazartesi", lesson: "Türkçe", topic: "Paragrafta Anlam Hız Rutini", target_questions: 30, duration_minutes: 40, is_completed: true, is_coach_assigned: true },
    { id: "s3", day: "sali", lesson: "Geometri", topic: "Üçgende Alan & Benzerlik", target_questions: 40, is_completed: false, is_coach_assigned: true },
    { id: "s4", day: "sali", lesson: "Fizik", topic: "Kuvvet, Hareket Konu Videosu & Özet", duration_minutes: 60, is_completed: false, is_coach_assigned: true },
    { id: "s5", day: "carsamba", lesson: "Matematik", topic: "Polinomlar Çözümlü Test", target_questions: 50, is_completed: false, is_coach_assigned: true },
    { id: "s6", day: "persembe", lesson: "Kimya", topic: "Gaz Yasaları & Karışımlar", target_questions: 35, is_completed: false, is_coach_assigned: true },
    { id: "s7", day: "cuma", lesson: "Biyoloji", topic: "Hücre Bölünmeleri Fasikül Tekrarı", duration_minutes: 45, is_completed: false, is_coach_assigned: true },
    { id: "s8", day: "cumartesi", lesson: "Deneme", topic: "3D Türkiye Geneli TYT Denemesi + Detaylı Video Analiz", target_questions: 120, duration_minutes: 165, is_completed: false, is_coach_assigned: true },
    { id: "s9", day: "pazar", lesson: "Haftalık Tekrar", topic: "Haftanın Yanlış Soruları Defteri & Eksik Konu Tamamlama", is_completed: false, is_coach_assigned: true },
  ],
};

function getSafeSchedule(): WeeklySchedule {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("koc_schedule_v3");
      if (raw) return JSON.parse(raw);
    } catch {}
  }
  return INITIAL_SCHEDULE;
}

function saveSafeSchedule(data: WeeklySchedule) {
  INITIAL_SCHEDULE = data;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem("koc_schedule_v3", JSON.stringify(data));
      window.dispatchEvent(new Event("storage"));
    } catch {}
  }
}

// 2. HOOK'LAR

export function useGoal() {
  return useQuery({
    queryKey: ["goal"],
    queryFn: async () => INITIAL_GOAL,
    staleTime: Infinity,
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => [...TASKS],
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_done }: { id: string; is_done: boolean }) => {
      TASKS = TASKS.map((t) => (t.id === id ? { ...t, is_done } : t));
      return { id, is_done };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useMockEvents() {
  return useQuery({
    queryKey: ["mock-events"],
    queryFn: async () => [...MOCK_EVENTS],
  });
}

export function useAddMockEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; event_date: string; type?: "TYT" | "AYT" }) => {
      const isAyt = payload.name.toUpperCase().includes("AYT");
      const newEvent: MockEvent = {
        id: Date.now().toString(),
        name: payload.name,
        event_date: payload.event_date,
        provider: "Kişisel / Dershane",
        type: payload.type ?? (isAyt ? "AYT" : "TYT"),
        status: "planlandi",
        is_official_tg: false, // Kullanıcının ekledikleri kişisel denemedir
      };
      MOCK_EVENTS.push(newEvent);
      return newEvent;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mock-events"] });
    },
  });
}

export function useUpdateMockEventTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, target_net }: { id: string; target_net: number }) => {
      MOCK_EVENTS = MOCK_EVENTS.map((m) =>
        m.id === id ? { ...m, target_net } : m
      );
      return { id, target_net };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mock-events"] });
    },
  });
}

export function useExamResults() {
  return useQuery({
    queryKey: ["exam-results"],
    queryFn: async () => [...EXAM_RESULTS],
  });
}

export function useSaveExamResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      mockEventId?: string | undefined;
      name: string;
      type: "TYT" | "AYT";
      date: string;
      totalNet: number;
      scores: ExamScore[];
    }) => {
      const newResult: ExamResult = {
        id: Date.now().toString(),
        mock_event_id: payload.mockEventId,
        name: payload.name,
        type: payload.type,
        date: payload.date,
        totalNet: payload.totalNet,
        scores: payload.scores,
      };
      EXAM_RESULTS.push(newResult);
      return newResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exam-results"] });
    },
  });
}

export function useWeeklySchedule() {
  return useQuery({
    queryKey: ["weekly-schedule"],
    queryFn: async () => getSafeSchedule(),
    staleTime: 5000,
  });
}

export function useUpdateWeeklySchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updated: Partial<WeeklySchedule>) => {
      const current = getSafeSchedule();
      const merged = { ...current, ...updated };
      saveSafeSchedule(merged);
      return merged;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly-schedule"] });
    },
  });
}

export function useToggleScheduleSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slotId, is_completed }: { slotId: string; is_completed: boolean }) => {
      const current = getSafeSchedule();
      current.slots = current.slots.map((s) =>
        s.id === slotId ? { ...s, is_completed } : s
      );
      saveSafeSchedule(current);
      return current;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly-schedule"] });
    },
  });
}

export function useSendMeetingPoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      options,
      meet_url,
    }: {
      options: { day_label: string; start: string; end: string }[];
      meet_url?: string;
    }) => {
      const current = getSafeSchedule();
      const formattedOptions: MeetingOption[] = options.map((opt, idx) => ({
        id: `opt-${Date.now()}-${idx + 1}`,
        day_label: opt.day_label,
        start_time: opt.start,
        end_time: opt.end,
        time_range: `${opt.start} - ${opt.end}`,
      }));

      current.meeting_poll = {
        is_poll_active: true,
        status: "secim_bekleniyor",
        options: formattedOptions,
        selected_option: undefined,
        meet_url: meet_url || current.meeting_poll?.meet_url || "https://meet.google.com/koc-ogrenci-gorusme",
        joined_at: undefined,
      };
      saveSafeSchedule(current);
      return current.meeting_poll;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly-schedule"] });
    },
  });
}

export function useUpdateMeetingUrl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (meet_url: string) => {
      const current = getSafeSchedule();
      current.meeting_poll.meet_url = meet_url;
      saveSafeSchedule(current);
      return current.meeting_poll;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly-schedule"] });
    },
  });
}

export function useSelectMeetingOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (option: MeetingOption) => {
      const current = getSafeSchedule();
      current.meeting_poll.selected_option = option;
      current.meeting_poll.status = "saat_kesinlesti";
      saveSafeSchedule(current);
      return current.meeting_poll;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly-schedule"] });
    },
  });
}

export function useMarkMeetingJoined() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const current = getSafeSchedule();
      current.meeting_poll.joined_at = Date.now();
      saveSafeSchedule(current);
      return current.meeting_poll;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly-schedule"] });
    },
  });
}

export function useDismissMeetingPoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const current = getSafeSchedule();
      current.meeting_poll = {
        is_poll_active: false,
        status: "kapali",
        options: [],
        selected_option: undefined,
        meet_url: current.meeting_poll?.meet_url || "https://meet.google.com/koc-ogrenci-gorusme",
        joined_at: undefined,
      };
      saveSafeSchedule(current);
      return current.meeting_poll;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly-schedule"] });
    },
  });
}

export function useSubmitSlotRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slotId,
      type,
      requested_day,
      reason,
    }: {
      slotId: string;
      type: "tasi" | "hafiflet";
      requested_day?: DayKey | undefined;
      reason: string;
    }) => {
      const current = getSafeSchedule();
      const request: SlotRequest = {
        id: Date.now().toString(),
        type,
        requested_day,
        reason,
        status: "beklemede",
        created_at: "Bugün",
      };

      current.slots = current.slots.map((s) =>
        s.id === slotId ? { ...s, active_request: request } : s
      );
      current.status = "revize_talep_var";
      saveSafeSchedule(current);
      return current;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly-schedule"] });
    },
  });
}

export function useResolveSlotRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slotId,
      decision,
      coach_reply,
    }: {
      slotId: string;
      decision: "onayla" | "reddet";
      coach_reply?: string | undefined;
    }) => {
      const current = getSafeSchedule();
      current.slots = current.slots.map((s) => {
        if (s.id !== slotId || !s.active_request) return s;

        if (decision === "onayla") {
          const req = s.active_request;
          const targetDay = req.requested_day ?? s.day;
          return {
            ...s,
            day: targetDay,
            target_questions:
              req.type === "hafiflet" && typeof s.target_questions === "number"
                ? Math.round(s.target_questions / 2)
                : s.target_questions,
            duration_minutes:
              req.type === "hafiflet" && typeof s.duration_minutes === "number"
                ? Math.round(s.duration_minutes / 2)
                : s.duration_minutes,
            active_request: undefined,
          };
        } else {
          return {
            ...s,
            active_request: undefined,
          };
        }
      });

      const hasOtherRequests = current.slots.some((s) => s.active_request?.status === "beklemede");
      current.status = hasOtherRequests ? "revize_talep_var" : "aktif";
      current.coach_feedback = coach_reply;
      saveSafeSchedule(current);
      return current;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly-schedule"] });
    },
  });
}