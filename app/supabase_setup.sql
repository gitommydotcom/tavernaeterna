-- ============================================================
-- LA TAVERNA — Setup Supabase
-- Esegui questo script nell'SQL Editor di Supabase
-- ============================================================

-- 1. Profili utente
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  role TEXT DEFAULT 'player' CHECK (role IN ('dm', 'player')),
  character_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crea profilo automaticamente alla registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (new.id, new.email, 'player')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Personaggi (JSONB per flessibilità)
CREATE TABLE IF NOT EXISTS public.characters (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sessioni di combattimento
CREATE TABLE IF NOT EXISTS public.combat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active BOOLEAN DEFAULT TRUE,
  round INTEGER DEFAULT 1,
  current_turn INTEGER DEFAULT 0,
  participants JSONB DEFAULT '[]',
  log JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Mappe
CREATE TABLE IF NOT EXISTS public.maps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Nuova Mappa',
  image_url TEXT,
  grid_enabled BOOLEAN DEFAULT FALSE,
  grid_size INTEGER DEFAULT 50,
  tokens JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Diario avventura
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Nuova Nota',
  content TEXT DEFAULT '',
  type TEXT DEFAULT 'nota' CHECK (type IN ('sessione', 'png', 'luogo', 'bottino', 'nota')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS Policies (tutti gli autenticati possono leggere/scrivere)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_all" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "profiles_all" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Characters, combat, maps, diary — aperti a tutti gli autenticati
DROP POLICY IF EXISTS "characters_all" ON public.characters;
CREATE POLICY "characters_all" ON public.characters FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "combat_all" ON public.combat_sessions;
CREATE POLICY "combat_all" ON public.combat_sessions FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "maps_all" ON public.maps;
CREATE POLICY "maps_all" ON public.maps FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "diary_all" ON public.diary_entries;
CREATE POLICY "diary_all" ON public.diary_entries FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Storage buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('maps', 'maps', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "maps_public_read" ON storage.objects;
DROP POLICY IF EXISTS "maps_auth_write" ON storage.objects;
CREATE POLICY "maps_public_read" ON storage.objects FOR SELECT USING (bucket_id IN ('maps', 'avatars'));
CREATE POLICY "maps_auth_write" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('maps', 'avatars') AND auth.role() = 'authenticated'
);
CREATE POLICY "maps_auth_delete" ON storage.objects FOR DELETE USING (
  bucket_id IN ('maps', 'avatars') AND auth.role() = 'authenticated'
);

-- ============================================================
-- Abilita Realtime su queste tabelle
-- (da fare anche in Supabase Dashboard → Database → Replication)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.combat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diary_entries;

-- ============================================================
-- Personaggi iniziali — già precaricati dall'app
-- (la seed viene fatta dal frontend al primo accesso DM)
-- ============================================================

-- ============================================================
-- Per impostare il DM: dopo che l'utente DM si è registrato,
-- esegui questa query con la sua email:
-- UPDATE public.profiles SET role = 'dm'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'TUA_EMAIL_DM@esempio.com');
-- ============================================================
