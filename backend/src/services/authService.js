const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { ValidationError } = require('../utils/errors');
const { JWT_SECRET } = require('../config/env');

function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}

const authService = {
  async register(email, password) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ValidationError('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user   = await userRepository.create({ email, password: hashed });
    const token  = signToken(user);

    return { token, user: { id: user.id, email: user.email } };
  },

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new ValidationError('Invalid email or password');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ValidationError('Invalid email or password');

    const token = signToken(user);
    return { token, user: { id: user.id, email: user.email } };
  },
};

module.exports = authService;
