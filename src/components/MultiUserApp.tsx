import { useEffect, useState } from 'react';
import { UserSelection } from './UserSelection';
import { UserTodoApp } from './UserTodoApp';
import { getTasks } from '../api';
import type { ApiTask, AuthSession } from '../api';

interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
  type?: 'individual' | 'shared';
}

interface MultiUserAppProps {
  session: AuthSession;
  onLogout?: () => void;
}

export function MultiUserApp({ session, onLogout }: MultiUserAppProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [error, setError] = useState('');

  const users: User[] = [
    {
      id: session.user.id,
      name: session.user.username,
      initials: session.user.username.slice(0, 2).toUpperCase(),
      color: 'bg-blue-500',
      type: 'individual',
    },
    {
      id: 'shared',
      name: 'Shared Tasks',
      initials: 'ST',
      color: 'bg-gradient-to-r from-blue-500 to-purple-500',
      type: 'shared',
    },
  ];

  useEffect(() => {
    getTasks(session.token)
      .then(setTasks)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load tasks'));
  }, [session.token]);

  const selectedUser = users.find(user => user.id === selectedUserId);

  const getUserTaskCount = (userId: string) => {
    const visibleTasks = userId === 'shared'
      ? tasks.filter(task => typeof task.owner !== 'string' && task.owner._id !== session.user.id)
      : tasks.filter(task => (typeof task.owner === 'string' ? task.owner : task.owner._id) === userId);
    return {
      total: visibleTasks.length,
      completed: visibleTasks.filter(task => task.completed).length,
    };
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleBack = () => {
    setSelectedUserId(null);
  };

  // Show user selection screen
  if (!selectedUser) {
    return (
      <>
        <UserSelection
          users={users}
          onSelectUser={handleSelectUser}
          getUserTaskCount={getUserTaskCount}
          onLogout={onLogout}
        />
        {error && <p className="text-center text-sm text-destructive">{error}</p>}
      </>
    );
  }

  // Show individual user's todo app
  return (
    <UserTodoApp
      user={selectedUser}
      currentUserId={session.user.id}
      token={session.token}
      tasks={tasks}
      onTasksChange={setTasks}
      onBack={handleBack}
    />
  );
}