const eventService = require('../services/eventService');

const eventController = {
  async getEvents(req, res, next) {
    try {
      const result = await eventService.getEvents(req.query, req.user.userId);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getEventById(req, res, next) {
    try {
      const data = await eventService.getEventById(req.params.id, req.user.userId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async createEvent(req, res, next) {
    try {
      const data = await eventService.createEvent(req.body, req.user.userId);
      res.status(201).json({ success: true, data, message: 'Event created successfully' });
    } catch (err) {
      next(err);
    }
  },

  async updateEvent(req, res, next) {
    try {
      const data = await eventService.updateEvent(req.params.id, req.body, req.user.userId);
      res.status(200).json({ success: true, data, message: 'Event updated successfully' });
    } catch (err) {
      next(err);
    }
  },

  async deleteEvent(req, res, next) {
    try {
      await eventService.deleteEvent(req.params.id, req.user.userId);
      res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = eventController;
