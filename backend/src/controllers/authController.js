const authService = require('../services/authService');

const authController = {
  async register(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.register(email, password);
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res) {
    res.status(200).json({ success: true, user: req.user });
  },
};

module.exports = authController;
