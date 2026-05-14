import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { useDelete } from '../hooks/useDelete';
import { usePatch } from '../hooks/usePatch';
import { useToast } from '../context/ToastContext';
import { TASK_URLS } from '../apis';
import TaskCard from '../components/TaskCard';
import { EditIcon, ErrorIcon, EmptyStateIcon } from '../components/Icons';
import Layout from '../components/Layout';

// Custom hook and constants
import { useFilteredTasks } from '../hooks/useFilteredTasks';
import type { FilterType, SortType } from '../utils/filterConstants';
import { 
  FILTERS, 
  filterChipClassNames, 
  activeFilterChipClassNames 
} from '../utils/filterConstants';

/**
 * Home Component
 * Renders the main dashboard for task management, including filtering, sorting,
 * and bulk actions.
 * 
 * @returns {JSX.Element} The rendered Home page component.
 */
export default function Home() {
  const { tasks, loading, error, removeTask, updateTask } = useTaskContext();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const { remove: deleteTask } = useDelete(TASK_URLS.delete);
  const { execute: patchTask } = usePatch(TASK_URLS.patch);

  // Date formatting as DD/MM/YYYY
  const date = new Date().toLocaleDateString('en-GB');

  const filteredTasks = useFilteredTasks(tasks, activeFilter, sortBy, searchQuery);

  /**
   * Toggles the selection state of a specific task.
   * @param {string} taskId - The unique identifier of the task.
   */
  const toggleSelect = useCallback((taskId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(taskId) ? next.delete(taskId) : next.add(taskId);
      return next;
    });
  }, []);

  /**
   * Selects all currently filtered tasks.
   */
  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredTasks.map((t) => t.id)));
  }, [filteredTasks]);

  /**
   * Deselects all tasks.
   */
  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * Deletes all currently selected tasks.
   */
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    let deleted = 0;
    
    for (const id of selectedIds) {
      const result = await deleteTask({ id });
      if (result) {
        removeTask(id);
        deleted++;
      }
    }
    
    setBulkActionLoading(false);
    exitEditMode();
    addToast(`${deleted} task${deleted !== 1 ? 's' : ''} deleted`, 'info');
  };

  /**
   * Marks all currently selected tasks as complete.
   */
  const handleBulkComplete = async () => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    let completed = 0;
    
    for (const id of selectedIds) {
      const task = tasks.find((t) => t.id === id);
      if (task && !task.isCompleted) {
        const result = await patchTask({ taskId: id, isCompleted: true });
        if (result) {
          updateTask(id, { ...task, isCompleted: true });
          completed++;
        }
      }
    }
    
    setBulkActionLoading(false);
    exitEditMode();
    addToast(`${completed} task${completed !== 1 ? 's' : ''} completed`, 'success');
  };

  /**
   * Exits edit mode and clears any active selections.
   */
  const exitEditMode = () => {
    setEditMode(false);
    deselectAll();
  };

  return (
    <Layout onSearch={setSearchQuery}>
      <section className='flex-1 overflow-y-auto flex flex-col gap-6 px-4 py-5 pb-24 md:px-16 md:py-8 md:pb-8 min-w-0'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-wrap items-center gap-3 min-w-0'>
            <h1 className='flex min-w-0 items-center gap-2 text-[1.6rem] font-semibold tracking-tighter text-text-primary sm:text-3xl md:text-4xl'>
              <span className='whitespace-nowrap'>Today</span>
              <span className='whitespace-nowrap text-[0.95em]'>{date}</span>
            </h1>
            <span className='whitespace-nowrap rounded-full border border-border bg-surface-nav px-3 py-1 font-ui text-sm font-medium text-text-secondary'>
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className='flex items-center justify-start gap-2 sm:justify-end'>
            {editMode ? (
              <div className='flex flex-wrap items-center gap-2 rounded-lg border border-brand-primary bg-surface-nav px-3 py-2 shadow-sm shadow-glow-primary animate-editModeSlideIn sm:px-4'>
                <span className='font-ui text-sm font-semibold text-brand-primary pr-2 border-r border-border mr-1 whitespace-nowrap'>{selectedIds.size} selected</span>
                <button className='btn-ghost' onClick={selectAll} disabled={bulkActionLoading}>
                  Select All
                </button>
                <button className='btn-secondary' onClick={deselectAll} disabled={bulkActionLoading}>
                  Deselect
                </button>
                <button className='btn-primary' onClick={handleBulkComplete} disabled={bulkActionLoading || selectedIds.size === 0}>
                  {bulkActionLoading ? 'Completing...' : 'Complete'}
                </button>
                <button className='btn-danger' onClick={handleBulkDelete} disabled={bulkActionLoading || selectedIds.size === 0}>
                  {bulkActionLoading ? 'Deleting...' : 'Delete'}
                </button>
                <button className='btn-secondary' onClick={exitEditMode}>
                  Done
                </button>
              </div>
            ) : (
              <button className='flex items-center gap-2 rounded-sm border border-border bg-surface-nav px-4 py-2 font-ui text-sm font-medium text-text-primary cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-button' onClick={() => setEditMode(true)}>
                <EditIcon size={18} className="opacity-70 hover:opacity-100" />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className='flex flex-col gap-3 rounded-lg border border-border bg-surface-nav px-4 py-3 shadow-filter transition-all duration-300 hover:shadow-card md:flex-row md:items-center md:justify-between md:py-2'>
          <div className='-mx-1 flex flex-wrap items-center gap-2 pb-1 pr-1 md:mx-0 md:gap-2 md:pb-0 md:pr-0'>
            {FILTERS.map((filter, index) => (
              <span key={filter.key} className='flex items-center gap-2 md:gap-2'>
                {index > 0 && <div className='w-px h-6 bg-border hidden md:block'></div>}
                <button
                  type='button'
                  className={`whitespace-nowrap rounded border px-2.5 py-1 font-ui text-xs font-medium cursor-pointer user-select-none transition-all duration-200 ${activeFilter === filter.key ? activeFilterChipClassNames[filter.key] : filterChipClassNames[filter.key]}`}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.label}
                </button>
              </span>
            ))}
          </div>

          <div className='flex w-full items-center gap-2 rounded-full border border-border bg-priority-low-bg px-2 py-1 transition-all duration-300 hover:shadow-glow-primary md:w-auto md:shrink-0'>
            <select
              className='flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-4 py-1.5 font-ui text-xs font-semibold text-priority-low-text appearance-none transition-all duration-200 focus:outline-none focus:shadow-brand-primary/50 md:w-auto md:px-7'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              aria-label='Sort tasks'
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%232B7A8B' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center'
              }}
            >
              <option value='newest'>Newest first</option>
              <option value='oldest'>Oldest first</option>
              <option value='due-date'>Due date</option>
              <option value='priority'>Priority</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className='flex flex-col items-center justify-center py-16 gap-4'>
            <div className='w-10 h-10 border-[3px] border-bg-input border-t-brand-primary rounded-full animate-spin'></div>
            <p className='font-body text-base text-text-secondary'>Loading tasks...</p>
          </div>
        ) : error ? (
          <div className='flex flex-col items-center justify-center py-16 gap-4'>
            <ErrorIcon size={48} className="text-text-secondary" />
            <p className='font-body text-base text-text-secondary'>Unable to load tasks. Please try again.</p>
            <button className='btn-primary' onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : filteredTasks.length > 0 ? (
          <ul className='flex flex-col gap-4 list-none p-0 m-0'>
            {filteredTasks.map(task => (
              <li key={task.id} className='w-full animate-fadeIn'>
                <TaskCard
                  task={task}
                  editMode={editMode}
                  selected={selectedIds.has(task.id)}
                  onToggleSelect={() => toggleSelect(task.id)}
                  onEdit={() => navigate(`/task/${task.id}`)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className='flex flex-col items-center justify-center py-16 gap-4 text-center'>
            <EmptyStateIcon size={64} className="opacity-30 text-text-secondary" />
            <h3 className='font-heading text-2xl font-semibold text-text-primary m-0'>No tasks found</h3>
            <p className='font-body text-base text-text-secondary m-0'>{activeFilter !== 'all' ? 'Try adjusting your filters' : 'Click "New Task" to create your first task'}</p>
          </div>
        )}
      </section>
    </Layout>
  );
}
