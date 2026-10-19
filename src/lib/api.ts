import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export type Priority = 'low' | 'medium' | 'high';
export type Permission = 'read' | 'write';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Maps errors (including Prisma ones) to the JSON error shape the frontend expects. */
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Username is already taken' }, { status: 409 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    if (error.code === 'P2023') {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }
  }
  console.error(error);
  return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
}

const PRIORITY_TO_DB = { low: 'LOW', medium: 'MEDIUM', high: 'HIGH' } as const;
const PRIORITY_FROM_DB = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' } as const;
const PERMISSION_TO_DB = { read: 'READ', write: 'WRITE' } as const;
const PERMISSION_FROM_DB = { READ: 'read', WRITE: 'write' } as const;

export function parsePriority(value: unknown): Priority {
  if (value === 'low' || value === 'medium' || value === 'high') return value;
  throw new ApiError('Priority must be low, medium or high', 400);
}

export function toDbPriority(value: Priority) {
  return PRIORITY_TO_DB[value];
}

export function toDbPermission(value: Permission) {
  return PERMISSION_TO_DB[value];
}

function toDbDueDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) throw new ApiError('dueDate must be a valid date', 400);
  return date;
}

export function validateTitle(value: unknown): string {
  const title = String(value ?? '').trim();
  if (!title) throw new ApiError('Title is required', 400);
  if (title.length > 200) throw new ApiError('Title must be 200 characters or fewer', 400);
  return title;
}

/** Builds a Prisma `data` object from a PATCH body, ignoring undefined fields. */
export function buildTaskUpdate(body: Record<string, unknown>) {
  const data: Prisma.TaskUpdateInput = {};
  if (body.title !== undefined) data.title = validateTitle(body.title);
  if (body.priority !== undefined) data.priority = toDbPriority(parsePriority(body.priority));
  if (body.completed !== undefined) data.completed = Boolean(body.completed);
  if (body.dueDate !== undefined) {
    const dueDate = toDbDueDate(body.dueDate);
    data.dueDate = dueDate ?? null;
  }
  if (body.dueTime !== undefined) {
    data.dueTime = body.dueTime === null || body.dueTime === '' ? null : String(body.dueTime);
  }
  return data;
}

/** Task includes needed to answer "who owns / who can see this task". */
export const TASK_INCLUDE = {
  owner: { select: { id: true, username: true } },
  sharedWith: {
    include: { user: { select: { id: true, username: true } } },
  },
} satisfies Prisma.TaskInclude;

export type TaskWithRelations = Prisma.TaskGetPayload<{ include: typeof TASK_INCLUDE }>;

/** Converts a Prisma task into the JSON shape the frontend consumes. */
export function serializeTask(task: TaskWithRelations) {
  return {
    id: task.id,
    title: task.title,
    completed: task.completed,
    priority: PRIORITY_FROM_DB[task.priority] as Priority,
    createdAt: task.createdAt.toISOString(),
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    dueTime: task.dueTime ?? null,
    owner: task.owner,
    sharedWith: task.sharedWith.map((share) => ({
      user: share.user,
      permission: PERMISSION_FROM_DB[share.permission] as Permission,
    })),
  };
}
