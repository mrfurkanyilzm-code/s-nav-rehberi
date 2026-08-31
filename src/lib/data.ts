import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useGoal() {
  return useQuery({
    queryKey: ["student_goals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_goals")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMockEvents() {
  return useQuery({
    queryKey: ["mock_calendar_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mock_calendar_events")
        .select("*")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddMockEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; event_date: string }) => {
      const { error } = await supabase.from("mock_calendar_events").insert({
        name: input.name,
        provider: "Manuel",
        event_date: input.event_date,
        status: "planlandi",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mock_calendar_events"] }),
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; is_done: boolean }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ is_done: input.is_done })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useTopics() {
  return useQuery({
    queryKey: ["curriculum_topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curriculum_topics")
        .select("*")
        .order("subject", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useWeeklyPlan(weekStart: string) {
  return useQuery({
    queryKey: ["weekly_plan_items", weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_plan_items")
        .select("*")
        .eq("week_start", weekStart)
        .order("day_index", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdatePlanItem(weekStart: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; is_done?: boolean; day_index?: number }) => {
      const { id, ...patch } = input;
      const { error } = await supabase.from("weekly_plan_items").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weekly_plan_items", weekStart] }),
  });
}

export function useSendCoachRequest() {
  return useMutation({
    mutationFn: async (input: { week_start: string; kind: string; message: string }) => {
      const { error } = await supabase.from("coach_requests").insert(input);
      if (error) throw error;
    },
  });
}

export function trTarih(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    weekday: "short",
  });
}

