const { NotFoundError, InsufficientSeatsError, ValidationError, ForbiddenError } = require('../utils/errors');

/**
 * Global Express error-handling middleware.
 * Must have 4 parameters so Express recognises it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log every error with a consistent prefix
  console.error(`[ERROR] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  console.error(`  ${err.name || 'Error'}: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);

  // ── Domain errors ────────────────────────────────────────────────────────────
  if (err instanceof ForbiddenError) {
    return res.status(403).json({ success: false, error: err.message });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ success: false, error: err.message });
  }

  if (err instanceof InsufficientSeatsError) {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error:   err.message,
      details: err.errors,
    });
  }

  // ── Prisma known errors ──────────────────────────────────────────────────────
  if (err.code === 'P2002') {
    // Unique constraint violation
    return res.status(409).json({
      success: false,
      error: 'A record with this value already exists',
    });
  }

  if (err.code === 'P2025') {
    // Record not found (e.g. delete/update on non-existent row)
    return res.status(404).json({
      success: false,
      error: 'Record not found',
    });
  }

  if (err.code === 'P2003') {
    // Foreign key constraint failure
    return res.status(400).json({
      success: false,
      error: 'Related record does not exist',
    });
  }

  // ── Fallback 500 ─────────────────────────────────────────────────────────────
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
};

module.exports = errorHandler;
