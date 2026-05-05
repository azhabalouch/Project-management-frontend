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
import './style/Home.css';

type FilterType = 'all' | 'high' | 'medium' | 'low' | 'in-progress' | 'pending' | 'skipped' | 'bug';
type SortType = 'newest' | 'oldest' | 'due-date' | 'priority';

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

  const filters: { key: FilterType; label: string; tabClass: string }[] = [
    { key: 'all', label: 'All', tabClass: 'tab-all' },
    { key: 'high', label: 'High', tabClass: 'tab-high' },
    { key: 'medium', label: 'Medium', tabClass: 'tab-medium' },
    { key: 'low', label: 'Low', tabClass: 'tab-low' },
    { key: 'in-progress', label: 'In-progress', tabClass: 'tab-inprogress' },
    { key: 'pending', label: 'Pending', tabClass: 'tab-pending' },
    { key: 'skipped', label: 'Skipped', tabClass: 'tab-skipped' },
    { key: 'bug', label: 'Bug', tabClass: 'tab-bug' },
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
    <div className='home-layout'>
      <SideNavigation />

      <main className='home-main'>
        <TopNavigation onSearch={setSearchQuery} />

        <section className='home-content'>
          <div className='home-header'>
            <div className='home-header-title-container'>
              <h1 className='home-header-title'>Today {date}</h1>
              <span className='home-task-count'>{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</span>
            </div>
            <div className='home-header-actions'>
              {editMode ? (
                <div className='home-edit-mode-bar'>
                  <span className='home-edit-mode-count'>{selectedIds.size} selected</span>
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
                <button className='home-header-edit-btn' onClick={() => setEditMode(true)}>
                  <img src="/edit.svg" alt="Edit" width={18} height={18} />
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className='home-filters'>
            <div className='home-filter-tabs-container'>
              {filters.map((filter, index) => (
                <span key={filter.key} className='home-filter-tabs-wrapper'>
                  {index > 0 && <div className='home-filter-divider'></div>}
                  <span
                    className={`home-filter-tab ${filter.tabClass} ${activeFilter === filter.key ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter.key)}
                    role='button'
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveFilter(filter.key); }}
                  >
                    {filter.label}
                  </span>
                </span>
              ))}
            </div>

            <div className='home-filter-actions'>
              <select
                className='home-filter-sort-btn'
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                aria-label='Sort tasks'
              >
                <option value='newest'>Newest first</option>
                <option value='oldest'>Oldest first</option>
                <option value='due-date'>Due date</option>
                <option value='priority'>Priority</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className='home-loading-state'>
              <div className='loading-spinner'></div>
              <p>Loading tasks...</p>
            </div>
          ) : error ? (
            <div className='home-error-state'>
              <img src="/error.svg" alt="Error" width={48} height={48} />
              <p>Unable to load tasks. Please try again.</p>
              <button className='btn-primary' onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : filteredTasks.length > 0 ? (
            <ul className='task-list'>
              {filteredTasks.map(task => (
                <li key={task.id} className='task-item'>
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
            <div className='home-empty-state'>
              <img src="/empty.svg" alt="No tasks" width={64} height={64} />
              <h3>No tasks found</h3>
              <p>{searchQuery || activeFilter !== 'all' ? 'Try adjusting your filters or search' : 'Click "New Task" to create your first task'}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}