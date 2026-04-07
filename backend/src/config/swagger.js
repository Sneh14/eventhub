const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'EventHub API',
      version:     '1.0.0',
      description: 'REST API for the EventHub ticket booking platform.\n\n' +
                   'All event and booking operations are available here. ' +
                   'Booking creation is atomic — seats are decremented in the same database transaction.',
      contact: { name: 'EventHub Support' },
    },
    servers: [
      { url: 'https://api.eventhub.rahulshettyacademy.com/api', description: 'Production server' },
      { url: 'http://localhost:3001/api', description: 'Development server' },
    ],
    tags: [
      { name: 'Auth',     description: 'Authentication — register, login, and token validation' },
      { name: 'Events',   description: 'Event management — CRUD operations' },
      { name: 'Bookings', description: 'Ticket booking — create, view, and cancel bookings' },
      { name: 'Health',   description: 'API health check' },
    ],
  },
  // Scan routes AND app.js (health endpoint)
  apis: ['./src/routes/*.js', './app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
