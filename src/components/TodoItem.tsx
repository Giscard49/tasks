import { motion } from 'motion/react';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Trash2, Edit3, Calendar, AlertTriangle, Share2 } from 'lucide-react';
import { Todo } from './TodoApp';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onShare?: () => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit, onShare }: TodoItemProps) {
  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '';
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-muted';
    }
  };

  const getDueDateInfo = (dueDate?: Date) => {
    if (!dueDate) return null;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    const diffTime = dueDateOnly.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const timeStr = dueDate.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    let label = '';
    let variant: 'default' | 'destructive' | 'secondary' | 'outline' = 'default';
    let icon = <Calendar className="w-3 h-3" />;
    
    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      label = `Overdue ${overdueDays} day${overdueDays > 1 ? 's' : ''} • ${timeStr}`;
      variant = 'destructive';
      icon = <AlertTriangle className="w-3 h-3" />;
    } else if (diffDays === 0) {
      // Check if it's also overdue by time
      const isTimeOverdue = now.getTime() > dueDate.getTime();
      if (isTimeOverdue) {
        label = `Overdue • ${timeStr}`;
        variant = 'destructive';
        icon = <AlertTriangle className="w-3 h-3" />;
      } else {
        label = `Due today • ${timeStr}`;
        variant = 'destructive';
        icon = <AlertTriangle className="w-3 h-3" />;
      }
    } else if (diffDays === 1) {
      label = `Due tomorrow • ${timeStr}`;
      variant = 'outline';
    } else if (diffDays <= 7) {
      label = `Due in ${diffDays} days • ${timeStr}`;
      variant = 'secondary';
    } else {
      label = `${dueDate.toLocaleDateString()} • ${timeStr}`;
      variant = 'outline';
    }
    
    return { label, variant, icon };
  };

  const dueDateInfo = getDueDateInfo(todo.dueDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-3 sm:p-4 border-l-4 ${getPriorityBorder(todo.priority)} hover:shadow-md transition-shadow group`}>
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="pt-1">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={onToggle}
              className="w-5 h-5"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs">{getPriorityIndicator(todo.priority)}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {todo.priority} priority
              </span>
            </div>
            
            <p className={`text-base leading-relaxed break-words ${
              todo.completed 
                ? 'line-through text-muted-foreground' 
                : 'text-foreground'
            }`}>
              {todo.text}
            </p>
            
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mt-2">
              <div className="text-xs text-muted-foreground">
                Created {todo.createdAt.toLocaleDateString()} at {todo.createdAt.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              
              {dueDateInfo && (
                <Badge variant={dueDateInfo.variant} className="flex items-center gap-1 text-xs">
                  {dueDateInfo.icon}
                  {dueDateInfo.label}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Always visible on touch/small screens; hover-reveal on desktop */}
          <div className="flex shrink-0 gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0 hover:bg-accent"
              disabled={todo.completed}
              title="Edit task"
            >
              <Edit3 className="w-4 h-4 text-muted-foreground" />
            </Button>

            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="h-8 w-8 p-0 hover:bg-accent"
                title="Share task"
              >
                <Share2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 hover:bg-destructive/10"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}