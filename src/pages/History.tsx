import { useEffect, useState, useCallback } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import TaskCard from '../components/TaskCard';
import { useGet } from '../hooks/useGet';
import { TASK_URLS } from '../apis';
import type { Task } from '../components/type/typesInterface';
import { normalizeTask } from '../context/TaskContext';
import SideNavigation from '../components/SideNavigation';
import TopNavigation from '../components/TopNavigation';

export default function History(){
  const { execute, loading, error } = useGet<Task[]>(TASK_URLS.history);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await execute();
      if (Array.isArray(data)) {
        setCompletedTasks(data.map(normalizeTask));
      }
    } catch {
      // Error is already handled by useGet
    }
  }, [execute]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return(
    <div className='home-layout'>
      <SideNavigation />
      <main className='home-main'>
        <TopNavigation />
        <section className='home-content'>
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
              <img src="/error.svg" alt="Error" width={48} height={48} />
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
            <div className='home-empty-state'>
              <img src="/empty.svg" alt="No history" width={64} height={64} />
              <h3>No completed tasks</h3>
              <p>Tasks you complete will appear here</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}