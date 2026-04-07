const eventRepository   = require('../repositories/eventRepository');
const bookingRepository = require('../repositories/bookingRepository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

/** Replace availableSeats with per-user computed value for ALL events */
async function withPersonalSeats(events, userId) {
  if (!events.length) return events;

  const booked = await bookingRepository.getBookedQuantitiesForEvents(
    userId,
    events.map((e) => e.id),
  );

  return events.map((e) => {
    const userBooked = booked[e.id] || 0;
    return { ...e, availableSeats: Math.max(0, e.availableSeats - userBooked) };
  });
}

const MAX_USER_DYNAMIC_EVENTS = 6;

const eventService = {
  async getEvents(filters, userId) {
    const page  = Number(filters.page)  || 1;
    const limit = Number(filters.limit) || 10;

    const { events, total } = await eventRepository.findAll({ ...filters, page, limit }, userId);
    const data = await withPersonalSeats(events, userId);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getEventById(id, userId) {
    const event = await eventRepository.findById(id, userId);
    if (!event) throw new NotFoundError(`Event with id ${id} not found`);
    const [adjusted] = await withPersonalSeats([event], userId);
    return adjusted;
  },

  async createEvent(data, userId) {
    // FIFO: prune oldest dynamic event if at limit
    const count = await eventRepository.countUserDynamic(userId);
    if (count >= MAX_USER_DYNAMIC_EVENTS) {
      const oldest = await eventRepository.findOldestUserDynamic(userId);
      if (oldest) await eventRepository.delete(oldest.id);
    }

    const payload = {
      title:          data.title,
      description:    data.description || '',
      category:       data.category,
      venue:          data.venue,
      city:           data.city,
      eventDate:      new Date(data.eventDate),
      price:          parseFloat(data.price),
      totalSeats:     parseInt(data.totalSeats, 10),
      availableSeats: parseInt(data.totalSeats, 10),
      imageUrl:       data.imageUrl || null,
      userId,
      isStatic:       false,
    };
    return eventRepository.create(payload);
  },

  async updateEvent(id, data, userId) {
    const event = await eventRepository.findById(id, userId);
    if (!event) throw new NotFoundError(`Event with id ${id} not found`);
    if (event.isStatic) throw new ForbiddenError('Cannot modify a static event');
    if (event.userId !== userId) throw new ForbiddenError('You do not own this event');

    const payload = {};
    if (data.title       !== undefined) payload.title       = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.category    !== undefined) payload.category    = data.category;
    if (data.venue       !== undefined) payload.venue       = data.venue;
    if (data.city        !== undefined) payload.city        = data.city;
    if (data.eventDate   !== undefined) payload.eventDate   = new Date(data.eventDate);
    if (data.price       !== undefined) payload.price       = parseFloat(data.price);
    if (data.totalSeats  !== undefined) payload.totalSeats  = parseInt(data.totalSeats, 10);
    if (data.imageUrl    !== undefined) payload.imageUrl    = data.imageUrl;

    return eventRepository.update(id, payload);
  },

  async deleteEvent(id, userId) {
    const event = await eventRepository.findById(id, userId);
    if (!event) throw new NotFoundError(`Event with id ${id} not found`);
    if (event.isStatic) throw new ForbiddenError('Cannot delete a static event');
    if (event.userId !== userId) throw new ForbiddenError('You do not own this event');

    return eventRepository.delete(id);
  },
};

module.exports = eventService;
