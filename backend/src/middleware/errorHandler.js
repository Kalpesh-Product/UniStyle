/** Centralized error handler. Put this last in the middleware chain. */
export function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }

  if (err.code === 'P2002') {
    // Prisma unique constraint violation
    return res.status(409).json({ error: 'A record with that value already exists' });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}
