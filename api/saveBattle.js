// api/saveBattle.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  // body에서 playerId도 함께 받아옵니다.
  const { playerId, userCards, aiCards, judgePrompt, userHP, aiHP } = req.body;
  if (
    !playerId ||
    !Array.isArray(userCards) ||
    !Array.isArray(aiCards) ||
    judgePrompt == null ||
    userHP == null ||
    aiHP == null
  ) {
    return res.status(400).json({ error: 'Missing or invalid required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('battles')
      .insert([{
        player_id:    playerId,
        user_cards:   userCards,
        ai_cards:     aiCards,
        judge_prompt: judgePrompt,
        user_hp:      userHP,
        ai_hp:        aiHP
      }])
      .select('id, created_at');

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (e) {
    console.error('Unhandled error in saveBattle:', e);
    return res.status(500).json({ error: e.message });
  }
}
