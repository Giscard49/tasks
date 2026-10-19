import { useState, useEffect } from 'react';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';
import { TodoFilters } from './TodoFilters';
import { ThemeToggle } from './ThemeToggle';
import { NotificationManager } from './NotificationManager';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Plus, ArrowLeft, Heart, Users } from 'lucide-react';
import { createTask, deleteTask, shareTask, updateTask } from '../api';
import type { ApiTask } from '../api';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: Date;
}

export type FilterType = 'all' | 'active' | 'completed';
export type SortType = 'newest' | 'oldest' | 'alphabetical' | 'priority' | 'duedate';

interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
  type?: 'individual' | 'shared';
}

interface UserTodoAppProps {
  user: User;
  currentUserId: string;
  token: string;
  tasks: ApiTask[];
  onTasksChange: React.Dispatch<React.SetStateAction<ApiTask[]>>;
  onBack: () => void;
}

export function UserTodoApp({ user, currentUserId, token, tasks, onTasksChange, onBack }: UserTodoAppProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [shareUsername, setShareUsername] = useState('');
  const [sharePermission, setSharePermission] = useState<'read' | 'write'>('read');

  const isShared = user.type === 'shared';

  useEffect(() => {
    const visibleTasks = isShared
      ? tasks.filter(task => task.owner.id !== currentUserId)
      : tasks.filter(task => task.owner.id === currentUserId);
    setTodos(visibleTasks.map(task => ({
      id: task.id,
      text: task.title,
      completed: task.completed,
      priority: task.priority,
      createdAt: new Date(task.createdAt),
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    })));
  }, [currentUserId, isShared, tasks]);

  const addTodo = async (text: string, priority: 'low' | 'medium' | 'high', dueDate?: Date) => {
    try {
      const task = await createTask(token, { title: text, priority, dueDate: dueDate?.toISOString() });
      onTasksChange(prev => [task, ...prev]);
      setIsAddingTodo(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to add task');
    }
  };

  const updateTodo = async (id: string, text: string, priority: 'low' | 'medium' | 'high', dueDate?: Date) => {
    try {
      const task = await updateTask(token, id, { title: text, priority, dueDate: dueDate?.toISOString() });
      onTasksChange(prev => prev.map(item => item.id === id ? task : item));
      setEditingId(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update task');
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(item => item.id === id);
    if (!todo) return;
    try {
      const task = await updateTask(token, id, { completed: !todo.completed });
      onTasksChange(prev => prev.map(item => item.id === id ? task : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update task');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await deleteTask(token, id);
      onTasksChange(prev => prev.filter(item => item.id !== id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete task');
    }
  };

  const submitShare = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sharingId || !shareUsername.trim()) return;
    try {
      const task = await shareTask(token, sharingId, shareUsername.trim(), sharePermission);
      onTasksChange(prev => prev.map(item => item.id === task.id ? task : item));
      setSharingId(null);
      setShareUsername('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to share task');
    }
  };

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    switch (sort) {
      case 'oldest':
        return a.createdAt.getTime() - b.createdAt.getTime();
      case 'alphabetical':
        return a.text.localeCompare(b.text);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'duedate':
        // Sort by due date, with no due date items at the end
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      default: // newest
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.filter(todo => !todo.completed).length;

  const getTodoCount = () => {
    const total = todos.length;
    const active = todos.filter(todo => !todo.completed).length;
    return { total, active };
  };

  const getTodos = () => {
    return todos;
  };

  return (
    <div className={`min-h-screen ${isShared ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/10 dark:to-purple-950/10' : 'bg-background'}`}>
      <div className="w-full max-w-md mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        {error && <p className="text-sm text-destructive break-words">{error}</p>}
        {/* Header with Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 sm:pt-8">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-10 w-10 p-0 mr-1 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="relative shrink-0">
              <Avatar className="w-10 h-10">
                <AvatarFallback className={`${user.color} text-white font-bold`}>
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              {isShared && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <Heart className="w-2.5 h-2.5 text-white fill-current" />
                </div>
              )}
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{user.name}</h1>
                {isShared && (
                  <div className="shrink-0 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-xs text-white font-medium">
                    Shared
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {isShared ? (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 shrink-0" />
                    {activeCount} active, {completedCount} completed goals
                  </span>
                ) : (
                  `${activeCount} active, ${completedCount} completed`
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <NotificationManager 
              userId={user.id}
              userName={user.name}
              getTodoCount={getTodoCount}
              getTodos={getTodos}
            />
            <ThemeToggle />
          </div>
        </div>

        {/* Shared Tasks Info Banner */}
        {isShared && (
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-current" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Our Tasks</h3>
                <p className="text-sm text-muted-foreground">
                  Tasks and goals to accomplish together
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Todo Form */}
        {isAddingTodo && (
          <TodoForm
            onSubmit={addTodo}
            onCancel={() => setIsAddingTodo(false)}
          />
        )}

        {/* Filters and Sorting */}
        <TodoFilters
          filter={filter}
          sort={sort}
          onFilterChange={setFilter}
          onSortChange={setSort}
        />

        {/* Todo List */}
        <TodoList
          todos={sortedTodos}
          editingId={editingId}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={setEditingId}
          onUpdate={updateTodo}
          onShare={isShared ? undefined : setSharingId}
        />

        {sharingId && (
          <form onSubmit={submitShare} className="space-y-3 rounded-lg border p-3 sm:p-4">
            <p className="font-medium">Share this task</p>
            <Input
              value={shareUsername}
              onChange={(event) => setShareUsername(event.target.value)}
              placeholder="Username"
              className="text-base"
              autoFocus
            />
            <Select value={sharePermission} onValueChange={(value) => setSharePermission(value as 'read' | 'write')}>
              <SelectTrigger className="text-base"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Can view</SelectItem>
                <SelectItem value="write">Can edit</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={!shareUsername.trim()}>Share</Button>
              <Button type="button" variant="outline" onClick={() => setSharingId(null)}>Cancel</Button>
            </div>
          </form>
        )}

        {/* Add Button */}
        {!isShared && !isAddingTodo && (
          <Button
            onClick={() => setIsAddingTodo(true)}
            className={`w-full h-12 gap-2 ${
              isShared 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            <Plus className="w-5 h-5" />
            {isShared ? 'Add Tasks Baby' : 'Add New Task'}
          </Button>
        )}

        {/* Empty State */}
        {sortedTodos.length === 0 && (
          <div className="text-center py-12">
            <div className={`w-16 h-16 ${user.color} rounded-full flex items-center justify-center mx-auto mb-4 relative`}>
              <Plus className="w-8 h-8 text-white" />
              {isShared && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white fill-current" />
                </div>
              )}
            </div>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? (isShared ? 'No shared goals yet' : 'No tasks yet')
                : `No ${filter} ${isShared ? 'family goals' : 'tasks'}`
              }
            </p>
            {isShared && filter === 'all' && (
              <p className="text-sm text-muted-foreground mt-2">
                Create goals that we can work on together!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}