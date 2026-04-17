import { Role, TicketPriority, TicketStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../config/prisma';

const createTicketSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  priority: z.nativeEnum(TicketPriority),
  categoryId: z.number().int().positive()
});

const updateTicketSchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  technicianId: z.number().int().positive().nullable().optional(),
  categoryId: z.number().int().positive().optional()
});

const addCommentSchema = z.object({
  message: z.string().min(2)
});

export async function getTickets(userId: number, role: Role) {
  return prisma.ticket.findMany({
    where: role === Role.TECHNICIAN ? {} : { creatorId: userId },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      technician: { select: { id: true, name: true, email: true } },
      category: true,
      comments: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getTicketById(ticketId: number, userId: number, role: Role) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      technician: { select: { id: true, name: true, email: true } },
      category: true,
      comments: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!ticket) {
    throw new Error('Ticket no encontrado');
  }

  if (role !== Role.TECHNICIAN && ticket.creatorId !== userId) {
    throw new Error('No tienes permisos para ver este ticket');
  }

  return ticket;
}

export async function createTicket(input: unknown, creatorId: number) {
  const data = createTicketSchema.parse(input);

  return prisma.ticket.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      categoryId: data.categoryId,
      creatorId
    },
    include: {
      category: true,
      creator: { select: { id: true, name: true, email: true } }
    }
  });
}

export async function updateTicket(ticketId: number, input: unknown, role: Role) {
  if (role !== Role.TECHNICIAN) {
    throw new Error('Solo el técnico puede actualizar tickets');
  }

  const data = updateTicketSchema.parse(input);

  return prisma.ticket.update({
    where: { id: ticketId },
    data,
    include: {
      category: true,
      creator: { select: { id: true, name: true, email: true } },
      technician: { select: { id: true, name: true, email: true } }
    }
  });
}

export async function addComment(ticketId: number, input: unknown, userId: number, role: Role) {
  const data = addCommentSchema.parse(input);

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    throw new Error('Ticket no encontrado');
  }

  if (role !== Role.TECHNICIAN && ticket.creatorId !== userId) {
    throw new Error('No tienes permisos para comentar este ticket');
  }

  return prisma.comment.create({
    data: {
      message: data.message,
      ticketId,
      userId
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } }
    }
  });
}
