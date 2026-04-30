-- ============================================================
-- LA TAVERNA — Aggiornamento v3
-- Diario: ordine manuale, data retroattiva, immagini allegate
-- ============================================================

ALTER TABLE public.diary_entries
  ADD COLUMN IF NOT EXISTS event_date DATE,
  ADD COLUMN IF NOT EXISTS sort_order DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Inizializza event_date e sort_order per le righe esistenti
UPDATE public.diary_entries
SET event_date = COALESCE(event_date, created_at::date)
WHERE event_date IS NULL;

UPDATE public.diary_entries d
SET sort_order = sub.idx
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS idx
  FROM public.diary_entries
  WHERE sort_order = 0
) sub
WHERE d.id = sub.id AND d.sort_order = 0;
