import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  // Clear any session cookie if you use one
  res.setHeader('Set-Cookie', 'session=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict');
  return res.status(200).json({ message: 'Logged out' });
}
