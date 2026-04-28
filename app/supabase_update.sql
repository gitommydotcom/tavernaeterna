-- ============================================================
-- LA TAVERNA — Aggiornamento v2
-- Esegui questo script nell'SQL Editor di Supabase
-- ============================================================

-- Tabella impostazioni campagna (per la Home)
CREATE TABLE IF NOT EXISTS public.campaign (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT DEFAULT 'La Taverna',
  tagline TEXT DEFAULT 'L''avventura ha inizio...',
  hero_image_url TEXT,
  story_narrative TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.campaign ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campaign_all" ON public.campaign;
CREATE POLICY "campaign_all" ON public.campaign FOR ALL USING (auth.role() = 'authenticated');

ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign;

-- Inserisci riga di default
INSERT INTO public.campaign (name, tagline)
VALUES ('La Taverna', 'L''avventura ha inizio...')
ON CONFLICT DO NOTHING;
