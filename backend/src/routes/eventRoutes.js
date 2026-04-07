const express = require('express');
const router = express.Router();

const eventController    = require('../controllers/eventController');
const { validateCreateEvent } = require('../validators/eventValidator');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Tech Summit 2026"
 *         description:
 *           type: string
 *           example: "A premier technology conference bringing together industry leaders."
 *         category:
 *           type: string
 *           example: "Conference"
 *         venue:
 *           type: string
 *           example: "Bangalore International Centre"
 *         city:
 *           type: string
 *           example: "Bangalore"
 *         eventDate:
 *           type: string
 *           format: date-time
 *           example: "2026-06-15T09:00:00.000Z"
 *         price:
 *           type: number
 *           format: float
 *           example: 1500.00
 *         totalSeats:
 *           type: integer
 *           example: 500
 *         availableSeats:
 *           type: integer
 *           example: 342
 *         imageUrl:
 *           type: string
 *           nullable: true
 *           example: "https://example.com/images/tech-summit.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateEventInput:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - venue
 *         - city
 *         - eventDate
 *         - price
 *         - totalSeats
 *       properties:
 *         title:
 *           type: string
 *           example: "Tech Summit 2026"
 *         description:
 *           type: string
 *           example: "A premier technology conference."
 *         category:
 *           type: string
 *           example: "Conference"
 *         venue:
 *           type: string
 *           example: "Bangalore International Centre"
 *         city:
 *           type: string
 *           example: "Bangalore"
 *         eventDate:
 *           type: string
 *           format: date-time
 *           example: "2026-06-15T09:00:00.000Z"
 *         price:
 *           type: number
 *           example: 1500.00
 *         totalSeats:
 *           type: integer
 *           example: 500
 *         imageUrl:
 *           type: string
 *           example: "https://example.com/banner.jpg"
 *
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 48
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalPages:
 *           type: integer
 *           example: 5
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Resource not found"
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Validation failed"
 *         details:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 */

// ─── GET /api/events ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /events:
 *   get:
 *     summary: List all events
 *     description: Returns a paginated list of events. Supports filtering by category, city, and free-text search.
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Conference, Concert, Sports, Workshop, Festival]
 *         description: Filter events by category
 *         example: Conference
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter events by city
 *         example: Bangalore
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search events by title, description, or venue
 *         example: summit
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of events per page
 *     responses:
 *       200:
 *         description: Paginated list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', eventController.getEvents);

// ─── GET /api/events/:id ──────────────────────────────────────────────────────

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get a single event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the event
 *         example: 1
 *     responses:
 *       200:
 *         description: Event found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Event with id 99 not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', eventController.getEventById);

// ─── POST /api/events ─────────────────────────────────────────────────────────

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     description: Creates an event. `availableSeats` is automatically set equal to `totalSeats`.
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventInput'
 *           example:
 *             title: "Tech Summit 2026"
 *             description: "A premier technology conference."
 *             category: "Conference"
 *             venue: "Bangalore International Centre"
 *             city: "Bangalore"
 *             eventDate: "2026-06-15T09:00:00.000Z"
 *             price: 1500
 *             totalSeats: 500
 *             imageUrl: "https://example.com/banner.jpg"
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *                 message:
 *                   type: string
 *                   example: "Event created successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validateCreateEvent, eventController.createEvent);

// ─── PUT /api/events/:id ──────────────────────────────────────────────────────

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the event to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventInput'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *                 message:
 *                   type: string
 *                   example: "Event updated successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', validateCreateEvent, eventController.updateEvent);

// ─── DELETE /api/events/:id ───────────────────────────────────────────────────

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     description: Permanently deletes an event and all associated bookings (cascade).
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the event to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Event deleted successfully"
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
