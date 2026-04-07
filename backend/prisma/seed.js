const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const testUsers = [
  { email: 'rahulshetty1@gmail.com', password: 'Magiclife1!' },
  { email: 'rahulshetty1@yahoo.com', password: 'Magiclife1!' },
];

// 3 static (admin) events — always visible to all users, seats never decrement
const staticEvents = [
  {
    title:          'World Tech Summit',
    description:    'A premier technology conference bringing together 500+ industry leaders, startup founders, and engineers for two days of keynotes, workshops, and networking. Topics include AI/ML, cloud infrastructure, DevSecOps, and the future of the Indian tech ecosystem.',
    category:       'Conference',
    venue:          'Hyderabad, Hitech city',
    city:           'Hyderabad',
    eventDate:      new Date('2026-04-18T09:00:00.000Z'),
    price:          1500.00,
    totalSeats:     500,
    availableSeats: 500,
    imageUrl:       'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    isStatic:       true,
    userId:         null,
  },
  {
    title:          'Hollywood Monsoon Night — Los Angeles',
    description:    'An unforgettable evening of live music performed by A-list playback singers under the open Mumbai sky. Featuring chart-toppers from the last three decades with a stunning light show and pyrotechnics.',
    category:       'Concert',
    venue:          'Dome, NSCI SVP Stadium, Worli',
    city:           'Los Angeles',
    eventDate:      new Date('2026-07-11T19:00:00.000Z'),
    price:          2500.00,
    totalSeats:     3000,
    availableSeats: 3000,
    imageUrl:       'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    isStatic:       true,
    userId:         null,
  },
  {
    title:          'Dilli Diwali Mela',
    description:    'Celebrate the Festival of Lights at the grandest Diwali Mela in North India. Enjoy 200+ stalls of artisanal crafts, street food, folk performances, fireworks, and cultural showcases spanning three vibrant evenings.',
    category:       'Festival',
    venue:          'Pragati Maidan Exhibition Grounds',
    city:           'Delhi',
    eventDate:      new Date('2026-10-20T17:00:00.000Z'),
    price:          300.00,
    totalSeats:     10000,
    availableSeats: 10000,
    imageUrl:       'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800',
    isStatic:       true,
    userId:         null,
  },
];

async function main() {
  console.log('🌱 Starting database seed…');

  // Upsert test users (always sync password)
  for (const u of testUsers) {
    const hashed = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where:  { email: u.email },
      update: { password: hashed },
      create: { email: u.email, password: hashed },
    });
    console.log(`✅ Upserted user: ${u.email}`);
  }

  // Only clear non-static events and their bookings (preserve static events)
  const nonStaticEvents = await prisma.event.findMany({ where: { isStatic: false }, select: { id: true } });
  const nonStaticIds    = nonStaticEvents.map((e) => e.id);

  if (nonStaticIds.length > 0) {
    await prisma.booking.deleteMany({ where: { eventId: { in: nonStaticIds } } });
    await prisma.event.deleteMany({ where: { id: { in: nonStaticIds } } });
  }

  // Also clear bookings that reference no event (orphaned)
  console.log('🗑  Cleared non-static events and their bookings');

  // Upsert static events (idempotent — keyed on title)
  for (const ev of staticEvents) {
    const existing = await prisma.event.findFirst({ where: { title: ev.title, isStatic: true } });
    if (existing) {
      await prisma.event.update({
        where: { id: existing.id },
        data: {
          description:    ev.description,
          category:       ev.category,
          venue:          ev.venue,
          city:           ev.city,
          eventDate:      ev.eventDate,
          price:          ev.price,
          totalSeats:     ev.totalSeats,
          availableSeats: ev.availableSeats,
          imageUrl:       ev.imageUrl,
          isStatic:       true,
          userId:         null,
        },
      });
    } else {
      await prisma.event.create({ data: ev });
    }
  }
  console.log(`✅ Upserted ${staticEvents.length} static events`);

  // Verify
  const all = await prisma.event.findMany({ where: { isStatic: true }, orderBy: { category: 'asc' } });
  console.log('\nStatic events:');
  all.forEach((e) => {
    console.log(`  [${e.category.padEnd(11)}] ${e.title} — ${e.city} (₹${e.price})`);
  });
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
