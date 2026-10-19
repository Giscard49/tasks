import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import {
  TASK_INCLUDE,
  handleApiError,
  parsePriority,
  serializeTask,
  toDbPriority,
  validateTitle,
} from '@/lib/api';

/** GET /api/tasks — tasks owned by the user plus tasks shared with them. */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ ownerId: user.id }, { sharedWith: { some: { userId: user.id } } }],
      },
      include: TASK_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tasks.map(serializeTask));
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/tasks — create a task owned by the current user. */
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const title = validateTitle(body.title);
    const priority = body.priority === undefined ? 'medium' : parsePriority(body.priority);

    const dueDate = body.dueDate ? new Date(String(body.dueDate)) : null;
    if (dueDate && Number.isNaN(dueDate.getTime())) {
      return NextResponse.json({ message: 'dueDate must be a valid date' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        priority: toDbPriority(priority),
        completed: Boolean(body.completed),
        dueDate,
        dueTime: body.dueTime ? String(body.dueTime) : null,
        ownerId: user.id,
      },
      include: TASK_INCLUDE,
    });

    return NextResponse.json(serializeTask(task), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
