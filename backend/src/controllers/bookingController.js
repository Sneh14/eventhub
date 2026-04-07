const bookingService = require('../services/bookingService');

const bookingController = {
  async getBookings(req, res, next) {
    try {
      const result = await bookingService.getBookings(req.query, req.user.userId);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getBookingById(req, res, next) {
    try {
      const data = await bookingService.getBookingById(req.params.id, req.user.userId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getBookingByRef(req, res, next) {
    try {
      const data = await bookingService.getBookingByRef(req.params.ref, req.user.userId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async createBooking(req, res, next) {
    try {
      const data = await bookingService.createBooking(req.body, req.user.userId);
      res.status(201).json({ success: true, data, message: 'Booking confirmed!' });
    } catch (err) {
      next(err);
    }
  },

  async clearAllBookings(req, res, next) {
    try {
      const result = await bookingService.clearAllBookings(req.user.userId);
      res.status(200).json({ success: true, message: `${result.deleted} booking(s) cleared` });
    } catch (err) {
      next(err);
    }
  },

  async cancelBooking(req, res, next) {
    try {
      await bookingService.cancelBooking(req.params.id, req.user.userId);
      res.status(200).json({ success: true, message: 'Booking cancelled' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = bookingController;
