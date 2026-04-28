import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gaopiziqkushqltudhqb.supabase.co'
const SUPABASE_KEY = 'sb_publishable_qns0UB2UJxGa4PB782GRDw_Vg-qdd2O'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  realtime: { params: { eventsPerSecond: 10 } },
})
