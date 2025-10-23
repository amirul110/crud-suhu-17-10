import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'rahasia_super_aman';

// Buat token
export function signToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
}

// Verifikasi token
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
}
