// The Next.js route handlers under app/api/* replace the old Express backend,
// so all requests go to the same origin under /api.
const API_URL = '/api';

export interface AuthUser {
  id: string;
  username: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface SharedWithEntry {
  user: AuthUser;
  permission: 'read' | 'write';
}

export interface ApiTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  dueDate?: string | null;
  dueTime?: string | null;
  owner: AuthUser;
  sharedWith: SharedWithEntry[];
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown network error';
    throw new Error(
      `Unable to reach the server. Make sure the app is running ("npm run dev") and reload the page. (${reason})`,
    );
  }

  if (response.status === 204) return undefined as T;

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

export function logout() {
  return request<void>('/auth/logout', { method: 'POST' });
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
