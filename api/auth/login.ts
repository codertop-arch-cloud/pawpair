import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../src/services/mongoClient';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  try {
    const db = await getDb();
    const usersColl = db.collection('users');
    const user = await usersColl.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // In production compare hashed passwords
    if (password && user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
