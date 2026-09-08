const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface AuthUser {
  id: string;
  username: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface ApiTask {
  _id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  dueDate?: string;
  dueTime?: string;
  owner: string | { _id: string; username: string };
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown network error';
    throw new Error(`Unable to reach the server. Start the backend and try again. (${reason})`);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || 'Request failed');
  }
  return body as T;
}

export function login(username: string, password: string) {
  return request<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function getTasks(token: string) {
  return request<ApiTask[]>('/tasks', {}, token);
}

export function createTask(token: string, task: {
  title: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  dueTime?: string;
}) {
  return request<ApiTask>('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  }, token);
}

export function updateTask(token: string, id: string, updates: Partial<Pick<ApiTask, 'title' | 'priority' | 'completed' | 'dueDate' | 'dueTime'>>) {
  return request<ApiTask>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }, token);
}

export async function deleteTask(token: string, id: string) {
  await request<void>(`/tasks/${id}`, { method: 'DELETE' }, token);
}

export function shareTask(token: string, id: string, username: string, permission: 'read' | 'write') {
  return request<ApiTask>(`/tasks/${id}/share`, {
    method: 'POST',
    body: JSON.stringify({ username, permission }),
  }, token);
}

export function register(username: string, password: string) {
  return request<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}