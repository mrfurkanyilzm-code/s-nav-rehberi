CREATE TABLE public.student_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  university text NOT NULL,
  department text NOT NULL,
  target_rank integer NOT NULL,
  exam_date timestamptz NOT NULL,
  streak_days integer NOT NULL DEFAULT 0,
  stars integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mock_calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL DEFAULT 'Türkiye Geneli',
  event_date date NOT NULL,
  status text NOT NULL DEFAULT 'planlandi',
  net numeric,
  rank integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  detail text,
  is_done boolean NOT NULL DEFAULT false,
  task_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.curriculum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  topic text NOT NULL,
  mastery integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  wrong_count integer NOT NULL DEFAULT 0,
  blank_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_goals TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mock_calendar_events TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.curriculum_topics TO anon, authenticated;
GRANT ALL ON public.student_goals TO service_role;
GRANT ALL ON public.mock_calendar_events TO service_role;
GRANT ALL ON public.tasks TO service_role;
GRANT ALL ON public.curriculum_topics TO service_role;

ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public access" ON public.student_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public access" ON public.mock_calendar_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public access" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public access" ON public.curriculum_topics FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.student_goals (student_name, university, department, target_rank, exam_date, streak_days, stars)
VALUES ('Furkan', 'Boğaziçi Üniversitesi', 'YBS', 709, '2027-06-19T10:15:00+03:00', 37, 1240);

INSERT INTO public.mock_calendar_events (name, provider, event_date, status, net, rank) VALUES
  ('3D TYT-11', 'Türkiye Geneli', '2026-09-05', 'planlandi', NULL, NULL),
  ('345 AYT-4', 'Türkiye Geneli', '2026-09-12', 'planlandi', NULL, NULL),
  ('Bilfen TYT-3', 'Türkiye Geneli', '2026-09-19', 'planlandi', NULL, NULL),
  ('3D AYT-9', 'Türkiye Geneli', '2026-08-29', 'tamamlandi', 62.5, 1420),
  ('345 TYT-3', 'Türkiye Geneli', '2026-08-22', 'tamamlandi', 88.25, 980),
  ('Bilfen AYT-2', 'Türkiye Geneli', '2026-08-15', 'tamamlandi', 58, 1810),
  ('3D TYT-10', 'Türkiye Geneli', '2026-08-08', 'tamamlandi', 84.75, 1130);

INSERT INTO public.tasks (title, detail, is_done, task_date) VALUES
  ('Matematik — Problemler', '40 soru', true, current_date),
  ('Türkçe — Paragraf', '30 soru', true, current_date),
  ('Tarih — İnkılap konu tekrarı', '1 konu + 20 soru', false, current_date),
  ('Coğrafya — Nüfus', '25 soru', false, current_date),
  ('Deneme analizi (3D AYT-9)', 'Yanlış defteri', false, current_date);

INSERT INTO public.curriculum_topics (subject, topic, mastery, correct_count, wrong_count, blank_count) VALUES
  ('Matematik', 'Problemler', 82, 32, 6, 2),
  ('Matematik', 'Fonksiyonlar', 64, 21, 9, 3),
  ('Matematik', 'Türev', 41, 12, 14, 4),
  ('Türkçe', 'Paragraf', 91, 34, 4, 2),
  ('Türkçe', 'Dil Bilgisi', 73, 22, 6, 2),
  ('Türkçe', 'Sözcükte Anlam', 86, 26, 3, 1),
  ('Sosyal', 'İnkılap Tarihi', 38, 8, 3, 1),
  ('Sosyal', 'Nüfus ve Yerleşme', 57, 9, 2, 1),
  ('Sosyal', 'Felsefe', 69, 11, 3, 1);