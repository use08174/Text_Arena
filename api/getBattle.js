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
    // player_id 로 players 테이블을 조인해서 name 필드를 가져옵니다.
    const { data, error } = await supabase
      .from('battles')
      .select(`
        player_id,
        user_hp,
        created_at,
        player:players (   /* alias = player */
          name             /* players.name 만 가져옴 */
        )
      `)
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
