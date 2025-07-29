// api/getBattle.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY   // 클라이언트용 anon key
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' });
  }
  try {
    const { data, error } = await supabase
      .from('battles')
      .select('user_cards, user_hp, created_at')
      .order('user_hp', { ascending: false })
      .limit(100);
    if (error) throw error;
    return res.status(200).json(data);
  } catch (e) {
    console.error('getBattles error:', e);
    return res.status(500).json({ error: e.message });
  }
}
