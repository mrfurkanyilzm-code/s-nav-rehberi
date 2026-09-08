ALTER TABLE public.student_goals
  ADD COLUMN IF NOT EXISTS exam_field text NOT NULL DEFAULT 'EA';

UPDATE public.student_goals
SET exam_field = 'EA'
WHERE exam_field IS NULL OR exam_field = '';

ALTER TABLE public.student_topic_mastery
  DROP CONSTRAINT IF EXISTS student_topic_mastery_status_check;

UPDATE public.student_topic_mastery
SET status = CASE status
  WHEN 'COMPLETED' THEN 'MASTERED'
  WHEN 'NEEDS_REVIEW' THEN 'PRACTICE_NEEDED'
  WHEN 'NOT_UNDERSTOOD' THEN 'CONCEPT_REQUIRED'
  ELSE status
END;

ALTER TABLE public.student_topic_mastery
  ADD CONSTRAINT student_topic_mastery_status_check
  CHECK (status IN ('MASTERED', 'PRACTICE_NEEDED', 'CONCEPT_REQUIRED'));
