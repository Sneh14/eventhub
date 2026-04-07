const prisma = require('../config/database');

const bookingRepository = {
  /**
   * Fetch paginated bookings for the authenticated user.
   */
  async findAll({ eventId, status, page = 1, limit = 10 } = {}, userId) {
    const skip = (Number(page) - 1) * Number(limit);
    const where = { userId };

    if (eventId) where.eventId = Number(eventId);
    if (status)  where.status  = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { event: true },
      }),
      prisma.booking.count({ where }),
    ]);

    return { bookings, total };
  },

  async findById(id, userId) {
    return prisma.booking.findFirst({
      where:   { id: Number(id), userId },
      include: { event: true },
    });
  },

  async findByIdOnly(id) {
    return prisma.booking.findUnique({
      where:   { id: Number(id) },
      include: { event: true },
    });
  },

  async findByRef(bookingRef) {
    return prisma.booking.findUnique({
      where:   { bookingRef },
      include: { event: true },
    });
  },

  async create(data) {
    return prisma.booking.create({
      data,
      include: { event: true },
    });
  },

  async delete(id) {
    return prisma.booking.delete({ where: { id: Number(id) } });
  },

  async deleteAllForUser(userId) {
    return prisma.booking.deleteMany({ where: { userId } });
  },

  /** Count all bookings for a user */
  async countUserBookings(userId) {
    return prisma.booking.count({ where: { userId } });
  },

  /** Find the oldest booking for a user */
  async findOldestUserBooking(userId) {
    return prisma.booking.findFirst({
      where:   { userId },
      orderBy: { createdAt: 'asc' },
      include: { event: true },
    });
  },

  /** Find the oldest booking for a user, excluding a specific event */
  async findOldestUserBookingExcludingEvent(userId, eventId) {
    return prisma.booking.findFirst({
      where:   { userId, eventId: { not: Number(eventId) } },
      orderBy: { createdAt: 'asc' },
      include: { event: true },
    });
  },

  /**
   * Returns a map of eventId → total booked quantity for a user.
   * Only covers the provided eventIds.
   */
  async getBookedQuantitiesForEvents(userId, eventIds) {
    if (!eventIds.length) return {};
    const rows = await prisma.booking.groupBy({
      by:    ['eventId'],
      where: { userId, eventId: { in: eventIds } },
      _sum:  { quantity: true },
    });
    return Object.fromEntries(rows.map((r) => [r.eventId, r._sum.quantity || 0]));
  },
};

module.exports = bookingRepository;
