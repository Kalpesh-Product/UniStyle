import jwt from 'jsonwebtoken';

/**
 * Verifies the Bearer JWT on the Authorization header.
 * Attaches { id, email } to req.user on success.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Like requireAuth, but does not fail if no token is present.
 * Useful for routes that behave differently for logged-in vs guest users.
 */
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: payload.sub, email: payload.email };
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}
