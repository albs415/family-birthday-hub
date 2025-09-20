import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('birthdays')
      .select('*')
      .order('dob', { ascending: true });
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
  } else if (req.method === 'POST') {
    const { name, dob } = req.body;
    if (!name || !dob) {
      return res.status(400).json({ error: 'Missing name or dob' });
    }
    const { data, error } = await supabase
      .from('birthdays')
      .insert([{ name, dob }])
      .select();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data[0]);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
