import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const { data, error } = await supabase
    .from('players')
    .insert([{ name }]);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true, data });
}
