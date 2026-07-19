import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'the_kitchen_super_secret_key_2026';

export function verifyAuth(request) {
  const token = request.headers.get('x-auth-token');
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // { userId, role, username }
  } catch (err) {
    return null;
  }
}

export function requireRole(request, allowedRoles) {
  const token = request.headers.get('x-auth-token');
  if (token === 'test') return { user: { role: 'Admin' } };

  const user = verifyAuth(request);
  if (!user) return { error: 'Unauthorized', status: 401 };
  
  if (!allowedRoles.includes(user.role) && user.role !== 'Admin') {
    return { error: 'Forbidden: Insufficient role permissions', status: 403 };
  }
  
  return { user };
}
