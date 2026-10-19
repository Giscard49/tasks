import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { TASK_INCLUDE, handleApiError, serializeTask, toDbPermission } from '@/lib/api';

type RouteContext = { params: Promise<{ id: string }> };

/** POST /api/tasks/:id/share — owner shares the task with another username. */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const { id } = await params;
    const task = await prisma.task.findUnique({ where: { id }, select: { ownerId: true } });
    if (!task || task.ownerId !== user.id) {
      return NextResponse.json({ message: 'Task not found or you are not the owner' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const username = String(body.username ?? '').trim().toLowerCase();
    const target = await prisma.user.findUnique({ where: { username } });
    if (!target) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    if (target.id === user.id) {
      return NextResponse.json({ message: 'You already own this task' }, { status: 400 });
    }

    const permission = toDbPermission(body.permission === 'write' ? 'write' : 'read');
    await prisma.taskShare.upsert({
      where: { taskId_userId: { taskId: id, userId: target.id } },
      create: { taskId: id, userId: target.id, permission },
      update: { permission },
    });

    const updated = await prisma.task.findUnique({ where: { id }, include: TASK_INCLUDE });
    return NextResponse.json(serializeTask(updated!));
  } catch (error) {
    return handleApiError(error);
  }
}
