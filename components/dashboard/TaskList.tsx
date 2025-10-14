import React, { useState, useMemo } from 'react';
import { Pencil } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

type Priority = 'High' | 'Medium' | 'Low';
type SortBy = 'default' | 'highToLow' | 'lowToHigh';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
}

const priorityConfig: Record<Priority, { color: string }> = {
    High: { color: 'bg-red-500' },
    Medium: { color: 'bg-amber-500' },
    Low: { color: 'bg-emerald-500' },
};

const TaskItem: React.FC<{
  task: Task;
  onToggleComplete: (id: number) => void;
  onPriorityChange: (id: number, priority: Priority) => void;
}> = ({ task, onToggleComplete, onPriorityChange }) => {

  return (
    <div className="flex items-center p-3 bg-background rounded-lg">
      <div className="flex items-center">
        <input
          type="checkbox"
          id={`task-${task.id}`}
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-primary focus:ring-primary focus:ring-offset-background"
          style={{accentColor: 'var(--primary)'}}
        />
      </div>
      <label htmlFor={`task-${task.id}`} className={`ml-3 flex-1 text-sm cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {task.text}
      </label>
      <div className="flex items-center gap-2 text-sm ml-4">
        <span className={`h-2.5 w-2.5 rounded-full ${priorityConfig[task.priority].color}`}></span>
        <span className="w-12">{task.priority}</span>
      </div>
      <div className="ml-4">
        <select
          value={task.priority}
          onChange={(e) => onPriorityChange(task.id, e.target.value as Priority)}
          className="bg-secondary border border-border text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-1.5"
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>
      <button className="ml-4 text-muted-foreground hover:text-foreground">
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
};


const TaskList: React.FC = () => {
    const { t } = useLanguage();
    
    const initialTasks: Task[] = useMemo(() => [
        { id: 1, text: t('task_1_text'), completed: false, priority: 'High' },
        { id: 2, text: t('task_2_text'), completed: true, priority: 'High' },
        { id: 3, text: t('task_3_text'), completed: false, priority: 'Medium' },
        { id: 4, text: t('task_4_text'), completed: false, priority: 'Low' },
        { id: 5, text: t('task_5_text'), completed: false, priority: 'Low' },
        { id: 6, text: t('task_6_text'), completed: false, priority: 'Medium' },
    ], [t]);
    
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [sortBy, setSortBy] = useState<SortBy>('default');
    
    const handleToggleComplete = (id: number) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
    };

    const handlePriorityChange = (id: number, priority: Priority) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, priority } : task));
    };

    const sortedTasks = useMemo(() => {
        const priorityOrder: Record<Priority, number> = { High: 1, Medium: 2, Low: 3 };

        if (sortBy === 'default') {
            const incomplete = tasks.filter(t => !t.completed);
            const completed = tasks.filter(t => t.completed);
            return [...incomplete, ...completed];
        }

        return [...tasks].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            if (sortBy === 'highToLow') {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            if (sortBy === 'lowToHigh') {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return 0;
        });
    }, [tasks, sortBy]);
    

    return (
        <div className="glass-card p-6 rounded-2xl relative">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-foreground">{t('dashboard_task_title')}</h3>
                <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="text-sm text-muted-foreground">{t('dashboard_task_sort')}</label>
                    <select
                        id="sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                        className="bg-secondary border border-border text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-1.5"
                    >
                        <option value="default">{t('dashboard_task_sort_default')}</option>
                        <option value="highToLow">{t('dashboard_task_sort_hightolow')}</option>
                        <option value="lowToHigh">{t('dashboard_task_sort_lowtohigh')}</option>
                    </select>
                </div>
            </div>
            <div className="space-y-2">
                {sortedTasks.map(task => (
                    <TaskItem 
                        key={task.id} 
                        task={task} 
                        onToggleComplete={handleToggleComplete} 
                        onPriorityChange={handlePriorityChange}
                    />
                ))}
            </div>
        </div>
    );
};

export default TaskList;