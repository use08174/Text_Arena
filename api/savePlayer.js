import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log("savePlayer.js invoked"); // 함수 실행 로그

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { name } = req.body;
  console.log("Received name:", name);

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const { data, error } = await supabase
    .from('players')
    .insert([{ name }])
    .select('id');

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: error.message });
  }

  console.log("Insert success:", data);

  return res.status(200).json({ success: true, data });
}
