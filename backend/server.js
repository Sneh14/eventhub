const app    = require('./app');
const prisma = require('./src/config/database');
const { PORT } = require('./src/config/env');

async function bootstrap() {
  try {
    // Verify DB connection before accepting traffic
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`\n🚀 EventHub API running at  http://localhost:${PORT}`);
      console.log(`📚 Swagger UI available at  http://localhost:${PORT}/api/docs`);
      console.log(`❤️  Health check at         http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);

async function shutdown() {
  console.log('\n⏳ Shutting down gracefully…');
  await prisma.$disconnect();
  process.exit(0);
}

bootstrap();
