import { useEffect, useState, useCallback } from 'react';
import { useGet } from '../hooks/useGet';
import { TASK_URLS } from '../apis';
import { normalizeTask } from '../context/TaskContext';

import type { Task } from '../components/type/typesInterface';
import TaskCard from '../components/TaskCard';
import Layout from '../components/Layout';
import { ErrorIcon, EmptyStateIcon } from '../components/Icons';

/**
 * History Component
 *
 * Fetches and displays a chronological list of completed tasks.
 * Reuses the standard Layout component to maintain consistent UI structure.
 *
 * @returns {JSX.Element} The rendered History page component.
 */
export default function History() {
  const { execute, loading, error } = useGet<Task[]>(TASK_URLS.history);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  /**
   * Fetches history data from the API, normalizes the objects,
   * filters out incomplete tasks, and sorts them by most recent.
   */
  const loadHistory = useCallback(async () => {
    try {
      const data = await execute();
      if (Array.isArray(data)) {
        const processedTasks = data
          .map(normalizeTask)
          .filter(task => task.isCompleted) 
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); 
          
        setCompletedTasks(processedTasks);
      }
    } catch {
      // Error is already gracefully handled by useGet hook
    }
  }, [execute]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <Layout>
      <section className='flex-1 px-4 py-6 md:px-16 md:py-8 overflow-y-auto flex flex-col gap-6'>
        <div className='home-header'>
          <div className='home-header-title-container'>
            <h1 className='home-header-title'>History</h1>
          </div>
        </div>

        {loading ? (
          <div className='home-loading-state'>
            <div className='loading-spinner'></div>
            <p>Loading history...</p>
          </div>
        ) : error ? (
          <div className='home-error-state'>
            <ErrorIcon size={48} className="text-status-error-text" />
            <p>Unable to load task history. Please try again.</p>
            <button className='btn-primary' onClick={loadHistory}>Retry</button>
          </div>
        ) : completedTasks.length > 0 ? (
          <ul className='task-list'>
            {completedTasks.map(task => (
              <li key={task.id} className='task-item'>
                <TaskCard task={task} />
              </li>
            ))}
          </ul>
        ) : (
          <div className='home-empty-state flex flex-col items-center justify-center py-16 gap-4 text-center'>
            <EmptyStateIcon size={64} className="opacity-30 text-text-secondary" />
            <h3 className='font-heading text-2xl font-semibold text-text-primary m-0'>No completed tasks</h3>
            <p className='font-body text-base text-text-secondary m-0'>Tasks you complete will appear here</p>
          </div>
        )}
      </section>
    </Layout>
  );
}