const prisma = require('../config/database');

const eventRepository = {
  /**
   * Fetch paginated events with optional filters.
   * Returns static events + user's own dynamic events.
   */
  async findAll({ category, city, search, page = 1, limit = 10 } = {}, userId) {
    const skip = (Number(page) - 1) * Number(limit);

    // Base ownership filter: static events OR user's own events
    const ownershipClause = [{ isStatic: true }, { userId }];

    const where = { OR: ownershipClause };

    if (category) where.category = category;
    if (city)     where.city = city;
    if (search) {
      // Combine ownership with search using AND
      where.AND = [
        { OR: ownershipClause },
        {
          OR: [
            { title:       { contains: search } },
            { description: { contains: search } },
            { venue:       { contains: search } },
          ],
        },
      ];
      delete where.OR;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [{ isStatic: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total };
  },

  async findById(id, userId) {
    return prisma.event.findFirst({
      where: {
        id: Number(id),
        OR: [{ isStatic: true }, { userId }],
      },
    });
  },

  async create(data) {
    return prisma.event.create({ data });
  },

  async update(id, data) {
    return prisma.event.update({ where: { id: Number(id) }, data });
  },

  async delete(id) {
    return prisma.event.delete({ where: { id: Number(id) } });
  },

  /** Atomic decrement — availableSeats -= quantity */
  async decrementSeats(id, quantity) {
    return prisma.event.update({
      where: { id: Number(id) },
      data:  { availableSeats: { decrement: Number(quantity) } },
    });
  },

  /** Atomic increment — availableSeats += quantity */
  async incrementSeats(id, quantity) {
    return prisma.event.update({
      where: { id: Number(id) },
      data:  { availableSeats: { increment: Number(quantity) } },
    });
  },

  /** Count dynamic events owned by this user */
  async countUserDynamic(userId) {
    return prisma.event.count({ where: { userId, isStatic: false } });
  },

  /** Find the oldest dynamic event owned by this user */
  async findOldestUserDynamic(userId) {
    return prisma.event.findFirst({
      where:   { userId, isStatic: false },
      orderBy: { createdAt: 'asc' },
    });
  },
};

module.exports = eventRepository;
