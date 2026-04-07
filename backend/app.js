const express    = require('express');
const cors       = require('cors');
const swaggerUi  = require('swagger-ui-express');
require('dotenv').config();

const { CORS_ORIGIN }  = require('./src/config/env');
const swaggerSpec      = require('./src/config/swagger');
const requestLogger    = require('./src/middleware/requestLogger');
const errorHandler     = require('./src/middleware/errorHandler');
const eventRoutes      = require('./src/routes/eventRoutes');
const bookingRoutes    = require('./src/routes/bookingRoutes');
const authRoutes       = require('./src/routes/authRoutes');

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ─── Swagger UI ───────────────────────────────────────────────────────────────
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'EventHub API Docs',
    swaggerOptions: { persistAuthorization: true },
  }),
);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/events',   eventRoutes);
app.use('/api/bookings', bookingRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /health:
 *   get:
 *     summary: API health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 dbStatus:
 *                   type: string
 *                   example: connected
 */
app.get('/api/health', async (req, res) => {
  const prisma = require('./src/config/database');
  let dbStatus = 'connected';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'disconnected';
  }
  res.status(200).json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    dbStatus,
  });
});

// ─── Public config (feature flags) ───────────────────────────────────────────
/**
 * @swagger
 * /config:
 *   get:
 *     summary: Get public feature flags
 *     tags: [Config]
 *     responses:
 *       200:
 *         description: Feature flag values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 showExploreLinks:
 *                   type: boolean
 *                   example: false
 */
app.get('/api/config', (req, res) => {
  res.json({
    showExploreLinks: process.env.SHOW_EXPLORE_LINKS === 'true',
  });
});

// ─── 404 for unmatched routes ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found` });
});

// ─── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;
