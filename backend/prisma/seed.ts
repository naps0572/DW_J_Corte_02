import { PrismaClient, Role, TicketPriority, TicketStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('123456', 10);

  const hardware = await prisma.category.upsert({
    where: { name: 'Hardware' },
    update: {},
    create: { name: 'Hardware' }
  });

  const software = await prisma.category.upsert({
    where: { name: 'Software' },
    update: {},
    create: { name: 'Software' }
  });

  const network = await prisma.category.upsert({
    where: { name: 'Red' },
    update: {},
    create: { name: 'Red' }
  });

  const technician = await prisma.user.upsert({
    where: { email: 'tech@demo.com' },
    update: {},
    create: {
      name: 'Técnico Demo',
      email: 'tech@demo.com',
      password,
      role: Role.TECHNICIAN
    }
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@demo.com' },
    update: {},
    create: {
      name: 'Usuario Demo',
      email: 'user@demo.com',
      password,
      role: Role.USER
    }
  });

  await prisma.ticket.create({
    data: {
      title: 'Equipo con lentitud',
      description: 'El equipo presenta lentitud al abrir aplicaciones.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      creatorId: user.id,
      technicianId: technician.id,
      categoryId: hardware.id,
      comments: {
        create: [
          {
            message: 'Se valida el caso y se agenda revisión.',
            userId: technician.id
          }
        ]
      }
    }
  });

  await prisma.ticket.create({
    data: {
      title: 'Acceso a sistema',
      description: 'No puedo ingresar a la plataforma interna.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      creatorId: user.id,
      technicianId: technician.id,
      categoryId: software.id
    }
  });

  console.log('Seed ejecutado correctamente');
  console.log({ categories: [hardware, software, network], technician, user });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
