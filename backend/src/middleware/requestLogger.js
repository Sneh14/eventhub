/**
 * Logs method, URL, status code, and response time for every request.
 * Attaches the listener on `res.finish` so the status code is final.
 */
const requestLogger = (req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    const status   = res.statusCode;
    const color    = status >= 500 ? '\x1b[31m'  // red
                   : status >= 400 ? '\x1b[33m'  // yellow
                   : status >= 300 ? '\x1b[36m'  // cyan
                   :                 '\x1b[32m'; // green
    const reset = '\x1b[0m';

    console.log(
      `${color}[${new Date().toISOString()}] ${req.method.padEnd(6)} ${req.originalUrl} → ${status} (${duration}ms)${reset}`,
    );
  });

  next();
};

module.exports = requestLogger;
