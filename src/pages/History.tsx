import { useEffect, useState, useCallback } from 'react';
import { useGet } from '../hooks/useGet';
import { useDelete } from '../hooks/useDelete';
import { TASK_URLS } from '../apis';
import { normalizeTask } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';

import type { Task } from '../components/type/typesInterface';
import TaskCard from '../components/TaskCard';
import Layout from '../components/Layout';
import { ErrorIcon, EmptyStateIcon, Trash2, AlertTriangle, CloseIcon } from '../components/Icons';

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
  const { remove: deleteHistory } = useDelete(TASK_URLS.historyDelete);
  const { addToast } = useToast();
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /**
   * Fetches history data from the API, normalizes the objects,
   * filters out incomplete tasks, and sorts them by most recent.
   */
  const loadHistory = useCallback(async () => {
    try {
      const data = await execute();
      const tasks = data?.tasks ?? (Array.isArray(data) ? data : []);
      if (Array.isArray(tasks)) {
        const processedTasks = tasks
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
        <div className='flex items-center justify-between'>
          <div className='home-header-title-container'>
            <h1 className='home-header-title'>History</h1>
          </div>
          {completedTasks.length > 0 && !loading && !error && (
            <button
              className='flex items-center gap-2 rounded-sm border border-border bg-surface-nav px-4 py-2 font-ui text-sm font-medium text-text-primary cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-status-error-text hover:shadow-button'
              onClick={() => setShowConfirm(true)}
              disabled={deleting}
            >
              <Trash2 size={16} className="opacity-70" />
              {deleting ? 'Deleting...' : 'Clear History'}
            </button>
          )}
        </div>

        {showConfirm && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50' onClick={() => setShowConfirm(false)}>
            <div className='mx-4 w-full max-w-md rounded-lg border border-border bg-surface-main p-6 shadow-card-hover' onClick={(e) => e.stopPropagation()}>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <AlertTriangle size={20} className="text-status-error-text" />
                  <h2 className='font-heading text-lg font-semibold text-text-primary m-0'>Clear History</h2>
                </div>
                <button className='rounded p-1 text-text-secondary hover:text-text-primary transition-colors' onClick={() => setShowConfirm(false)}>
                  <CloseIcon size={18} />
                </button>
              </div>
              <p className='font-body text-sm text-text-secondary mb-6'>
                This will permanently delete all completed tasks from your history. This action cannot be undone.
              </p>
              <div className='flex items-center justify-end gap-3'>
                <button className='btn-secondary' onClick={() => setShowConfirm(false)}>Cancel</button>
                <button
                  className='btn-danger'
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    const result = await deleteHistory();
                    setDeleting(false);
                    setShowConfirm(false);
                    if (result) {
                      setCompletedTasks([]);
                      addToast('History cleared successfully', 'success');
                    } else {
                      addToast('Failed to clear history', 'error');
                    }
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete All'}
                </button>
              </div>
            </div>
          </div>
        )}

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