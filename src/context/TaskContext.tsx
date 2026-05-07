import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { TASK_URLS } from '../apis';
import type { Task, Subtask, TaskContextValue } from '../components/type/typesInterface';

export const TaskContext = createContext<TaskContextValue | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

/**
 * Normalizes a raw task object from the API into a standard Task interface.
 * * @param {any} task - The raw task data.
 * @returns {Task} The sanitized Task object.
 */
export const normalizeTask = (task: any): Task => ({
  id: String(task.id),
  title: String(task.title ?? ''),
  description: String(task.description ?? ''),
  status: String(task.status ?? ''),
  isCompleted: Boolean(task.isCompleted),
  createdAt: String(task.createdAt ?? ''),
  dueDate: task.dueDate ? new Date(task.dueDate) : null,
  priority: task.priority ?? undefined,
  project: task.project ?? undefined,
  tags: Array.isArray(task.tags) ? task.tags.map(String) : undefined,
  assignee: task.assignee
    ? { name: String(task.assignee.name ?? ''), avatar: task.assignee.avatar ? String(task.assignee.avatar) : undefined }
    : undefined,
  progress: task.progress != null ? Number(task.progress) : undefined,
  subtasks: Array.isArray(task.subtasks)
    ? task.subtasks.map((st: any): Subtask => ({
        id: String(st.id),
        text: String(st.text ?? ''),
        completed: Boolean(st.completed),
        createdAt: st.createdAt ? String(st.createdAt) : undefined,
        updatedAt: st.updatedAt ? String(st.updatedAt) : undefined,
      }))
    : undefined,
});

const normalizeTasks = (tasks: unknown): Task[] => {
  return Array.isArray(tasks) ? tasks.map(normalizeTask) : [];
};

const isIncompleteTask = (task: any) => task?.isCompleted === false;

/**
 * TaskProvider
 * * Wraps the application to provide global access to the tasks state,
 * loading status, and CRUD operation handlers.
 */
export const TaskProvider = ({ children }: TaskProviderProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /** Fetches all incomplete tasks from the backend and updates local state. */
  const refreshTasks = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(TASK_URLS.get, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setTasks(normalizeTasks(Array.isArray(data) ? data.filter(isIncompleteTask) : []));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tasks on initial mount
  useEffect(() => {
    void refreshTasks();
  }, [refreshTasks]);

  const addTask = useCallback((task: Task) => {
    setTasks((currentTasks) => [...currentTasks, normalizeTask(task)]);
  }, []);

  const updateTask = useCallback((taskId: string, updatedTask: Task) => {
    const normalizedTask = normalizeTask(updatedTask);

    setTasks((currentTasks) => {
      // If marked as completed, remove it from this active list
      if (normalizedTask.isCompleted) {
        return currentTasks.filter((task) => task.id !== taskId);
      }
      return currentTasks.map((task) => (task.id === taskId ? normalizedTask : task));
    });
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        refreshTasks,
        addTask,
        updateTask,
        removeTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

/**
 * Custom hook to consume the TaskContext.
 * Ensures it is used within a valid TaskProvider tree.
 */
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};