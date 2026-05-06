import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { useDelete } from '../hooks/useDelete';
import { usePatch } from '../hooks/usePatch';
import { useToast } from '../context/ToastContext';
import { TASK_URLS } from '../apis';
import TaskCard from '../components/TaskCard';
import SideNavigation from '../components/SideNavigation';
import TopNavigation from '../components/TopNavigation';

type FilterType = 'all' | 'high' | 'medium' | 'low' | 'in-progress' | 'pending' | 'skipped' | 'bug';
type SortType = 'newest' | 'oldest' | 'due-date' | 'priority';

const filterChipClassNames: Record<FilterType, string> = {
  all: 'border-border bg-surface-nav text-text-secondary hover:bg-bg-active',
  high: 'border-priority-high-text/20 bg-priority-high-bg text-priority-high-text hover:bg-priority-high-bg/80',
  medium: 'border-priority-medium-text/20 bg-priority-medium-bg text-priority-medium-text hover:bg-priority-medium-bg/80',
  low: 'border-priority-low-text/20 bg-priority-low-bg text-priority-low-text hover:bg-priority-low-bg/80',
  'in-progress': 'border-status-inprogress-text/20 bg-status-inprogress-bg text-status-inprogress-text hover:bg-status-inprogress-bg/80',
  pending: 'border-status-pending-text/20 bg-status-pending-bg text-status-pending-text hover:bg-status-pending-bg/80',
  skipped: 'border-status-skipped-text/20 bg-status-skipped-bg text-status-skipped-text hover:bg-status-skipped-bg/80',
  bug: 'border-status-bug-text/20 bg-status-bug-bg text-status-bug-text hover:bg-status-bug-bg/80',
};

const activeFilterChipClassNames: Record<FilterType, string> = {
  all: 'border-border bg-surface-nav text-text-primary shadow-sm shadow-black/5',
  high: 'border-priority-high-text bg-priority-high-bg text-priority-high-text shadow-sm shadow-priority-high-text/10',
  medium: 'border-priority-medium-text bg-priority-medium-bg text-priority-medium-text shadow-sm shadow-priority-medium-text/10',
  low: 'border-priority-low-text bg-priority-low-bg text-priority-low-text shadow-sm shadow-priority-low-text/10',
  'in-progress': 'border-status-inprogress-text bg-status-inprogress-bg text-status-inprogress-text shadow-sm shadow-status-inprogress-text/10',
  pending: 'border-status-pending-text bg-status-pending-bg text-status-pending-text shadow-sm shadow-status-pending-text/10',
  skipped: 'border-status-skipped-text bg-status-skipped-bg text-status-skipped-text shadow-sm shadow-status-skipped-text/10',
  bug: 'border-status-bug-text bg-status-bug-bg text-status-bug-text shadow-sm shadow-status-bug-text/10',
};

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

  const current = new Date();
  const date = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`;

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          (task.project && task.project.toLowerCase().includes(query)) ||
          (task.tags && task.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    if (activeFilter !== 'all') {
      result = result.filter((task) => {
        switch (activeFilter) {
          case 'high':
          case 'medium':
          case 'low':
            return task.priority === activeFilter;
          case 'in-progress':
            return task.status === 'in-progress' || task.status === 'inprogress';
          case 'pending':
            return task.status === 'pending';
          case 'skipped':
            return task.status === 'skipped';
          case 'bug':
            return task.status === 'bug';
          default:
            return true;
        }
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'due-date': {
          const aDate = a.dueDate ? a.dueDate.getTime() : Infinity;
          const bDate = b.dueDate ? b.dueDate.getTime() : Infinity;
          return aDate - bDate;
        }
        case 'priority': {
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2, skippable: 3 };
          return (priorityOrder[a.priority ?? ''] ?? 4) - (priorityOrder[b.priority ?? ''] ?? 4);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, activeFilter, sortBy, searchQuery]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'high', label: 'High' },
    { key: 'medium', label: 'Medium' },
    { key: 'low', label: 'Low' },
    { key: 'in-progress', label: 'In-progress' },
    { key: 'pending', label: 'Pending' },
    { key: 'skipped', label: 'Skipped' },
    { key: 'bug', label: 'Bug' },
  ];

  const toggleSelect = useCallback((taskId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredTasks.map(t => t.id)));
  }, [filteredTasks]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

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
    setSelectedIds(new Set());
    setEditMode(false);
    addToast(`${deleted} task${deleted !== 1 ? 's' : ''} deleted`, 'info');
  };

  const handleBulkComplete = async () => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    let completed = 0;
    for (const id of selectedIds) {
      const task = tasks.find(t => t.id === id);
      if (task && !task.isCompleted) {
        const result = await patchTask({ taskId: id, isCompleted: true });
        if (result) {
          updateTask(id, { ...task, isCompleted: true });
          completed++;
        }
      }
    }
    setBulkActionLoading(false);
    setSelectedIds(new Set());
    setEditMode(false);
    addToast(`${completed} task${completed !== 1 ? 's' : ''} completed`, 'success');
  };

  const exitEditMode = () => {
    setEditMode(false);
    setSelectedIds(new Set());
  };

  return (
    <div className='flex bg-surface-main w-full h-screen overflow-hidden'>
      <SideNavigation />

      <main className='flex-1 flex flex-col relative min-w-0'>
        <TopNavigation onSearch={setSearchQuery} />

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
                  <img src="/edit.svg" alt="Edit" width={18} height={18} className='opacity-70 hover:opacity-100' />
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className='flex flex-col gap-3 rounded-lg border border-border bg-surface-nav px-4 py-3 shadow-filter transition-all duration-300 hover:shadow-card md:flex-row md:items-center md:justify-between md:py-2'>
            <div className='-mx-1 flex items-center gap-2 overflow-x-auto pb-1 pr-1 md:mx-0 md:gap-4 md:overflow-visible md:pb-0 md:pr-0'>
              {filters.map((filter, index) => (
                <span key={filter.key} className='flex items-center gap-2 md:gap-4 shrink-0'>
                  {index > 0 && <div className='w-px h-6 bg-border hidden md:block'></div>}
                  <button
                    type='button'
                    className={`whitespace-nowrap rounded border px-3 py-1 font-ui text-xs font-medium cursor-pointer user-select-none transition-all duration-200 ${activeFilter === filter.key ? activeFilterChipClassNames[filter.key] : filterChipClassNames[filter.key]}`}
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
              <img src="/error.svg" alt="Error" width={48} height={48} />
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
              <img src="/empty.svg" alt="No tasks" width={64} height={64} className='opacity-30' />
              <h3 className='font-heading text-2xl font-semibold text-text-primary m-0'>No tasks found</h3>
              <p className='font-body text-base text-text-secondary m-0'>{searchQuery || activeFilter !== 'all' ? 'Try adjusting your filters or search' : 'Click "New Task" to create your first task'}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}