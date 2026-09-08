import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ExamTrack } from "@/lib/curriculum";

export type TopicStatus = "MASTERED" | "PRACTICE_NEEDED" | "CONCEPT_REQUIRED";

export type TopicMasteryRow = {
  topic_id: string;
  exam_track: string;
  subject: string;
  status: TopicStatus;
  review_after_days: number;
  updated_at: string;
};

const QUERY_KEY = ["student_topic_mastery"] as const;
const STORAGE_KEY = "student_topic_mastery";

const LEGACY_STATUS: Record<string, TopicStatus> = {
  COMPLETED: "MASTERED",
  NEEDS_REVIEW: "PRACTICE_NEEDED",
  NOT_UNDERSTOOD: "CONCEPT_REQUIRED",
};

let backend: "supabase" | "local" | null = null;

function isMissingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /student_topic_mastery|schema cache|does not exist/i.test(error.message ?? "")
  );
}

export function normalizeStatus(value: string | null | undefined): TopicStatus | null {
  if (!value) return null;
  if (value === "MASTERED" || value === "PRACTICE_NEEDED" || value === "CONCEPT_REQUIRED") {
    return value;
  }
  return LEGACY_STATUS[value] ?? null;
}

function readLocal(): TopicMasteryRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TopicMasteryRow[];
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((row) => {
      const status = normalizeStatus(row.status);
      return status ? [{ ...row, status }] : [];
    });
  } catch {
    return [];
  }
}

function writeLocal(rows: TopicMasteryRow[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function applyLocalChange(
  rows: TopicMasteryRow[],
  input: { topic_id: string; exam_track: ExamTrack; subject: string; status: TopicStatus | null },
): TopicMasteryRow[] {
  const without = rows.filter((r) => r.topic_id !== input.topic_id);
  if (!input.status) return without;
  return [
    ...without,
    {
      topic_id: input.topic_id,
      exam_track: input.exam_track,
      subject: input.subject,
      status: input.status,
      review_after_days: 0,
      updated_at: new Date().toISOString(),
    },
  ];
}

async function fetchMastery(): Promise<TopicMasteryRow[]> {
  if (backend === "local") return readLocal();

  const { data, error } = await supabase.from("student_topic_mastery").select("*");
  if (error) {
    if (isMissingTable(error)) {
      backend = "local";
      return readLocal();
    }
    throw error;
  }
  backend = "supabase";
  return (data ?? []).flatMap((row) => {
    const status = normalizeStatus(row.status);
    if (!status) return [];
    return [
      {
        topic_id: row.topic_id,
        exam_track: row.exam_track,
        subject: row.subject,
        status,
        review_after_days: row.review_after_days,
        updated_at: row.updated_at,
      },
    ];
  });
}

async function persistMastery(input: {
  topic_id: string;
  exam_track: ExamTrack;
  subject: string;
  status: TopicStatus | null;
}) {
  if (backend === "local") {
    writeLocal(applyLocalChange(readLocal(), input));
    return;
  }

  if (!input.status) {
    const { error } = await supabase.from("student_topic_mastery").delete().eq("topic_id", input.topic_id);
    if (error) {
      if (isMissingTable(error)) {
        backend = "local";
        writeLocal(applyLocalChange(readLocal(), input));
        return;
      }
      throw error;
    }
    return;
  }

  const payload = {
    topic_id: input.topic_id,
    exam_track: input.exam_track,
    subject: input.subject,
    status: input.status,
    review_after_days: 0,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("student_topic_mastery").upsert(payload, { onConflict: "topic_id" });
  if (error) {
    if (isMissingTable(error) || /check constraint|invalid input/i.test(error.message ?? "")) {
      backend = "local";
      writeLocal(applyLocalChange(readLocal(), input));
      return;
    }
    throw error;
  }
}

export function useTopicMastery() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchMastery,
  });
}

export function useSetTopicStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: persistMastery,
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData<TopicMasteryRow[]>(QUERY_KEY) ?? [];
      qc.setQueryData<TopicMasteryRow[]>(QUERY_KEY, applyLocalChange(previous, input));
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function masteryByTopicId(rows: TopicMasteryRow[]) {
  return new Map(rows.map((row) => [row.topic_id, row]));
}
