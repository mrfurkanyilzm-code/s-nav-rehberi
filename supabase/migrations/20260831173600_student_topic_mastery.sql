CREATE TABLE public.student_topic_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id text NOT NULL UNIQUE,
  exam_track text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL CHECK (status IN ('COMPLETED', 'NEEDS_REVIEW', 'NOT_UNDERSTOOD')),
  review_after_days integer NOT NULL DEFAULT 5,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_topic_mastery TO anon, authenticated;
GRANT ALL ON public.student_topic_mastery TO service_role;

ALTER TABLE public.student_topic_mastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access" ON public.student_topic_mastery FOR ALL USING (true) WITH CHECK (true);
