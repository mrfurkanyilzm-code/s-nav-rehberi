
CREATE TABLE public.weekly_plan_items (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  day_index int not null check (day_index between 0 and 6),
  subject text not null,
  topic text not null,
  book text,
  question_count int not null default 0,
  is_done boolean not null default false,
  video_url text,
  pdf_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_plan_items TO anon, authenticated;
GRANT ALL ON public.weekly_plan_items TO service_role;
ALTER TABLE public.weekly_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access" ON public.weekly_plan_items FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.coach_requests (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  kind text not null default 'talep',
  message text not null,
  status text not null default 'beklemede',
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_requests TO anon, authenticated;
GRANT ALL ON public.coach_requests TO service_role;
ALTER TABLE public.coach_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access" ON public.coach_requests FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.weekly_plan_items (week_start, day_index, subject, topic, book, question_count, video_url, pdf_url, sort_order) VALUES
('2026-08-31',0,'TYT Matematik','Fonksiyonlar','3D Soru Bankası',40,'https://www.youtube.com/watch?v=BQ4yd2W50No','https://example.com/fonksiyonlar.pdf',0),
('2026-08-31',0,'TYT Türkçe','Paragrafta Anlam','345 Soru Bankası',30,'https://www.youtube.com/watch?v=BQ4yd2W50No',null,1),
('2026-09-01',1,'AYT Matematik','Türev','Özdebir Soru Bankası',35,'https://www.youtube.com/watch?v=BQ4yd2W50No','https://example.com/turev.pdf',0),
('2026-09-01',1,'TYT Tarih','İnkılap Tarihi','Bilgi Sarmal',25,null,null,1),
('2026-09-02',2,'TYT Matematik','Problemler','3D Soru Bankası',40,'https://www.youtube.com/watch?v=BQ4yd2W50No',null,0),
('2026-09-02',2,'TYT Coğrafya','İklim Bilgisi','345 Soru Bankası',20,null,'https://example.com/iklim.pdf',1),
('2026-09-03',3,'AYT Fizik','Vektörler','Palme Soru Bankası',25,'https://www.youtube.com/watch?v=BQ4yd2W50No',null,0),
('2026-09-04',4,'TYT Genel Tekrar','Yanlış Defteri','Kendi Defterin',0,null,null,0),
('2026-09-05',5,'Deneme','3D TYT-11 Türkiye Geneli','3D Yayınları',120,null,null,0),
('2026-09-06',6,'Deneme Analizi','TYT-11 Analiz','Analiz Formu',0,null,'https://example.com/analiz.pdf',0);

INSERT INTO public.mock_calendar_events (name, provider, event_date, status) VALUES
('345 TYT-6 Türkiye Geneli','345 Yayınları','2026-09-12','planlandi'),
('Özdebir AYT-3 Türkiye Geneli','Özdebir','2026-09-19','planlandi'),
('3D TYT-12 Türkiye Geneli','3D Yayınları','2026-09-26','planlandi');
