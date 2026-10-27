import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../src/services/mongoClient';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { fullName, email, password, role, city, phone, shelterId, avatarUrl, bio } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const db = await getDb();
    const usersColl = db.collection('users');
    const existing = await usersColl.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const newUser = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      city: city?.trim() || 'Seattle, WA',
      phone: phone?.trim() || '(555) 000-0000',
      shelterId: role === 'shelter_staff' ? shelterId || 'shelter-green-paws' : undefined,
      avatarUrl: avatarUrl?.trim() || (role === 'shelter_staff'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
      bio: bio ?? '',
      createdAt: new Date().toISOString(),
    };
    await usersColl.insertOne(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
