import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { TASK_INCLUDE, buildTaskUpdate, handleApiError, serializeTask } from '@/lib/api';

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH /api/tasks/:id — owner or a user with write permission can edit. */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: { sharedWith: { select: { userId: true, permission: true } } },
    });
    if (!task) return NextResponse.json({ message: 'Task not found' }, { status: 404 });

    const canWrite =
      task.ownerId === user.id ||
      task.sharedWith.some((share) => share.userId === user.id && share.permission === 'WRITE');
    if (!canWrite) {
      return NextResponse.json({ message: 'You cannot edit this task' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const updated = await prisma.task.update({
      where: { id },
      data: buildTaskUpdate(body),
      include: TASK_INCLUDE,
    });

    return NextResponse.json(serializeTask(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/tasks/:id — only the owner can delete. */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const { id } = await params;
    const task = await prisma.task.findUnique({ where: { id }, select: { ownerId: true } });
    if (!task || task.ownerId !== user.id) {
      return NextResponse.json({ message: 'Task not found or you are not the owner' }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
