const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');
const { validateCreateBooking } = require('../validators/bookingValidator');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         eventId:
 *           type: integer
 *           example: 3
 *         customerName:
 *           type: string
 *           example: "Priya Sharma"
 *         customerEmail:
 *           type: string
 *           example: "priya.sharma@email.com"
 *         customerPhone:
 *           type: string
 *           example: "+91-9876543210"
 *         quantity:
 *           type: integer
 *           example: 2
 *         totalPrice:
 *           type: number
 *           format: float
 *           example: 3000.00
 *         status:
 *           type: string
 *           enum: [confirmed, cancelled]
 *           example: "confirmed"
 *         bookingRef:
 *           type: string
 *           example: "EVT-A1B2C3"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         event:
 *           $ref: '#/components/schemas/Event'
 *
 *     CreateBookingInput:
 *       type: object
 *       required:
 *         - eventId
 *         - customerName
 *         - customerEmail
 *         - customerPhone
 *         - quantity
 *       properties:
 *         eventId:
 *           type: integer
 *           example: 1
 *         customerName:
 *           type: string
 *           minLength: 2
 *           example: "Priya Sharma"
 *         customerEmail:
 *           type: string
 *           format: email
 *           example: "priya.sharma@email.com"
 *         customerPhone:
 *           type: string
 *           minLength: 10
 *           example: "+91-9876543210"
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           example: 2
 */

// ─── GET /api/bookings ────────────────────────────────────────────────────────

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: List all bookings
 *     description: Returns a paginated list of all bookings, each including full event details.
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: integer
 *         description: Filter bookings by event ID
 *         example: 1
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [confirmed, cancelled]
 *         description: Filter by booking status
 *         example: confirmed
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
 *         description: Number of bookings per page
 *     responses:
 *       200:
 *         description: Paginated list of bookings
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
 *                     $ref: '#/components/schemas/Booking'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', bookingController.getBookings);

// ─── GET /api/bookings/ref/:ref  (must be before /:id) ───────────────────────

/**
 * @swagger
 * /bookings/ref/{ref}:
 *   get:
 *     summary: Look up a booking by reference code
 *     description: Retrieves a booking using the unique booking reference (e.g. EVT-A1B2C3).
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: ref
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking reference code
 *         example: EVT-A1B2C3
 *     responses:
 *       200:
 *         description: Booking found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Booking with reference \"EVT-XYZ123\" not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/ref/:ref', bookingController.getBookingByRef);

// ─── GET /api/bookings/:id ────────────────────────────────────────────────────

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a single booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric booking ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Booking found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
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
router.get('/:id', bookingController.getBookingById);

// ─── POST /api/bookings ───────────────────────────────────────────────────────

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a booking (buy tickets)
 *     description: |
 *       Books tickets for an event. The service will:
 *       1. Verify the event exists
 *       2. Check sufficient seats are available
 *       3. Calculate the total price
 *       4. Generate a unique booking reference (EVT-XXXXXX)
 *       5. Atomically create the booking and decrement available seats
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingInput'
 *           example:
 *             eventId: 1
 *             customerName: "Priya Sharma"
 *             customerEmail: "priya.sharma@email.com"
 *             customerPhone: "+91-9876543210"
 *             quantity: 2
 *     responses:
 *       201:
 *         description: Booking confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *                 message:
 *                   type: string
 *                   example: "Booking confirmed!"
 *       400:
 *         description: Validation error or insufficient seats
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   error: "Validation failed"
 *                   details: [{ field: "quantity", message: "Quantity must be an integer between 1 and 10" }]
 *               noSeats:
 *                 summary: Insufficient seats
 *                 value:
 *                   success: false
 *                   error: "Only 1 seat(s) available, but 3 requested"
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
router.post('/', validateCreateBooking, bookingController.createBooking);

// ─── DELETE /api/bookings (clear all for current user) ───────────────────────
router.delete('/', bookingController.clearAllBookings);

// ─── DELETE /api/bookings/:id ─────────────────────────────────────────────────

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Cancel a booking
 *     description: |
 *       Cancels (permanently deletes) a booking and atomically restores the
 *       released seats back to the event's `availableSeats` count.
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the booking to cancel
 *         example: 1
 *     responses:
 *       200:
 *         description: Booking cancelled and seats restored
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
 *                   example: "Booking cancelled"
 *       404:
 *         description: Booking not found
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
router.delete('/:id', bookingController.cancelBooking);

module.exports = router;
