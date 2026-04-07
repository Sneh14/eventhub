class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class InsufficientSeatsError extends Error {
  constructor(message = 'Not enough seats available') {
    super(message);
    this.name = 'InsufficientSeatsError';
    this.statusCode = 400;
  }
}

class ValidationError extends Error {
  constructor(message = 'Validation failed', errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.errors = errors;
  }
}

class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

module.exports = { NotFoundError, InsufficientSeatsError, ValidationError, ForbiddenError };
