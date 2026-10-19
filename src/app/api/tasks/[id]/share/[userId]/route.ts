import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api';

type RouteContext = { params: Promise<{ id: string; userId: string }> };

/** DELETE /api/tasks/:id/share/:userId — owner revokes a share. */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const { id, userId } = await params;
    const task = await prisma.task.findUnique({ where: { id }, select: { ownerId: true } });
    if (!task || task.ownerId !== user.id) {
      return NextResponse.json({ message: 'Task not found or you are not the owner' }, { status: 404 });
    }

    await prisma.taskShare.deleteMany({ where: { taskId: id, userId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
