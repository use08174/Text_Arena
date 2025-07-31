// api/getBattle.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('battles')
      .select('player_id, user_hp, created_at, player:players(name), user_cards')
      .order('user_hp', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (e) {
    console.error('Unhandled exception in getBattle:', e);
    return res.status(500).json({ error: e.message });
  }
}
