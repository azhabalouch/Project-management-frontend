import { useMemo, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { useTaskContext } from '../context/TaskContext';
import { useDelete } from '../hooks/useDelete';
import { PROJECT_URLS } from '../apis';
import SideNavigation from '../components/SideNavigation';
import TopNavigation from '../components/TopNavigation';
import TaskCard from '../components/TaskCard';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, removeProject } = useProjectContext();
  const { tasks } = useTaskContext();
  const { remove: deleteProject, loading: deleting, error: deleteError } = useDelete(PROJECT_URLS.delete);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  const project = useMemo(() => projects.find(p => p.id === id), [projects, id]);

  const projectTasks = useMemo(() => {
    if (!project) return [];
    return tasks.filter(t => t.project === project.name);
  }, [tasks, project]);

  const completedCount = projectTasks.filter(t => t.isCompleted).length;
  const totalCount = projectTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    const result = await deleteProject({ projectId: project.id });
    if (result) {
      removeProject(project.id);
      navigate('/projects');
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!actionMenuRef.current) return;
      if (event.target instanceof Node && !actionMenuRef.current.contains(event.target)) {
        setShowActionMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!project) {
    return (
      <div className='flex bg-surface-main w-full h-screen overflow-hidden'>
        <SideNavigation />
        <main className='flex-1 flex flex-col relative'>
          <TopNavigation />
          <section className='flex-1 px-4 py-6 md:px-16 md:py-8 overflow-y-auto flex flex-col gap-6'>
            <div className='flex flex-col items-center justify-center py-16 gap-4 text-center'>
              <img src="/empty.svg" alt="Not found" width={64} height={64} className='opacity-30' />
              <h3 className='font-heading text-2xl font-semibold text-text-primary m-0'>Project not found</h3>
              <p className='font-body text-base text-text-secondary m-0'>The project you're looking for doesn't exist or has been deleted.</p>
              <button className='btn-primary' onClick={() => navigate('/projects')}>Back to Projects</button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className='flex bg-surface-main w-full h-screen overflow-hidden'>
      <SideNavigation />
      <main className='flex-1 flex flex-col relative'>
        <TopNavigation />
        <section className='flex-1 px-4 py-6 md:px-16 md:py-8 overflow-y-auto flex flex-col gap-6'>
          <div className='flex items-center gap-2 mb-2 font-ui text-sm'>
            <button className='bg-none border-none text-text-secondary cursor-pointer hover:text-brand-primary transition-colors p-0 font-ui text-sm' onClick={() => navigate('/projects')}>Projects</button>
            <span className='text-text-secondary opacity-50'>/</span>
            <span className='text-text-primary font-medium overflow-hidden text-overflow-ellipsis whitespace-nowrap max-w-[400px]'>{project.name}</span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start'>
            <div className='min-w-0'>
              <div className='bg-surface-nav border border-border rounded-lg p-4 md:p-8 shadow-card'>
                <div className='flex justify-between items-start mb-6'>
                  <div className='flex flex-col gap-2'>
                    <span className='font-ui text-xs font-bold text-brand-primary uppercase tracking-wider'>Project</span>
                    <h1 className='text-3xl font-semibold text-text-primary m-0'>{project.name}</h1>
                  </div>
                  <div className='flex gap-2 flex-shrink-0'>
                    <button className='btn-secondary' onClick={() => navigate('/projects')}>
                      Back to Projects
                    </button>
                    <div className='relative' ref={actionMenuRef}>
                      <button
                        className='w-9 h-9 border border-border rounded px-2 py-2 bg-surface-nav text-text-secondary flex items-center justify-center cursor-pointer transition-all hover:border-text-secondary'
                        type='button'
                        aria-label='More actions'
                        aria-haspopup='menu'
                        aria-expanded={showActionMenu}
                        onClick={() => setShowActionMenu((prev) => !prev)}
                      >
                        <img src="/dots.svg" alt="" width={16} height={16} />
                      </button>
                      {showActionMenu && (
                        <div className='absolute top-10 right-0 bg-surface-nav border border-border rounded-lg shadow-card-hover z-50 py-2 min-w-max' role='menu'>
                          <button
                            type='button'
                            role='menuitem'
                            className='w-full px-4 py-2 text-left text-status-error-text hover:bg-bg-active transition-colors font-ui text-sm'
                            onClick={() => {
                              setShowActionMenu(false);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete Project
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {project.description && (
                  <div className='mb-6 text-text-secondary'>
                    <p className='m-0 whitespace-pre-wrap'>{project.description}</p>
                  </div>
                )}

                <div className='mb-6'>
                  <div className='flex justify-between items-center mb-3'>
                    <span className='font-ui text-sm font-semibold text-text-secondary'>Overall Progress</span>
                    <span className='font-heading text-lg font-bold text-accent-green'>{progressPercent}%</span>
                  </div>
                  <div className='w-full h-2 rounded overflow-hidden bg-bg-input'>
                    <div
                      className='h-full bg-accent-green rounded transition-all duration-300'
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className='flex gap-4 mt-4'>
                    <span className='font-ui text-sm text-text-secondary'>
                      <span className='font-semibold text-text-primary'>{completedCount}</span> completed
                    </span>
                    <span className='font-ui text-sm text-text-secondary'>
                      <span className='font-semibold text-text-primary'>{totalCount - completedCount}</span> remaining
                    </span>
                    <span className='font-ui text-sm text-text-secondary'>
                      <span className='font-semibold text-text-primary'>{totalCount}</span> total
                    </span>
                  </div>
                </div>
              </div>

              <div className='mt-6'>
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='text-2xl font-semibold text-text-primary m-0'>Tasks</h2>
                  <button
                    className='btn-primary flex items-center gap-2'
                    onClick={() => navigate('/task-create')}
                  >
                    <img src="/add.svg" alt="Add" width={16} height={16} />
                    Add Task
                  </button>
                </div>

                {projectTasks.length > 0 ? (
                  <ul className='flex flex-col gap-4 list-none p-0 m-0'>
                    {projectTasks.map(task => (
                      <li key={task.id} className='w-full animate-fadeIn'>
                        <TaskCard
                          task={task}
                          onEdit={() => navigate(`/task/${task.id}`)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className='flex flex-col items-center justify-center py-16 gap-4 text-center'>
                    <img src="/empty.svg" alt="No tasks" width={64} height={64} className='opacity-30' />
                    <h3 className='font-heading text-2xl font-semibold text-text-primary m-0'>No tasks in this project</h3>
                    <p className='font-body text-base text-text-secondary m-0'>Create a task and assign it to this project</p>
                  </div>
                )}
              </div>
            </div>

            <div className='flex flex-col gap-4'>
              <div className='bg-surface-nav border border-border rounded-lg p-5 shadow-card'>
                <h4 className='text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4 pb-3 border-b border-border'>Project Details</h4>
                <div className='flex flex-col gap-3'>
                  <div className='flex justify-between items-center'>
                    <span className='font-ui text-xs text-text-secondary'>Created</span>
                    <span className='font-ui text-xs text-text-primary'>{formatDate(project.createdAt)}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-ui text-xs text-text-secondary'>Tasks</span>
                    <span className='font-ui text-xs text-text-primary'>{totalCount}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-ui text-xs text-text-secondary'>Completed</span>
                    <span className='font-ui text-xs text-text-primary'>{completedCount}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='font-ui text-xs text-text-secondary'>Progress</span>
                    <span className='font-ui text-xs font-semibold text-accent-green'>{progressPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showDeleteModal && (
        <div
          className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div className='bg-surface-main border border-border rounded-xl shadow-card-hover w-full max-w-lg mx-4' role='dialog' aria-modal='true' aria-labelledby='delete-project-detail-heading'>
            <div className='flex justify-between items-center px-6 py-4 border-b border-border'>
              <h2 id='delete-project-detail-heading' className='text-xl font-semibold text-text-primary m-0'>Delete Project</h2>
              <button
                className='text-2xl cursor-pointer bg-none border-none text-text-secondary hover:text-text-primary disabled:opacity-50'
                onClick={() => setShowDeleteModal(false)}
                aria-label='Close modal'
                disabled={deleting}
              >
                &times;
              </button>
            </div>
            {deleteError && <div className='bg-status-error-bg text-status-error-text px-4 py-3 m-4 rounded font-ui text-sm'>{deleteError}</div>}
            <div className='px-6 py-4'>
              <p className='font-body text-text-primary text-base leading-relaxed m-0 mb-3'>
                This will permanently delete <strong>{project.name}</strong>.
              </p>
              <p className='font-ui text-status-error-text text-sm m-0'>
                This action cannot be undone.
              </p>
            </div>
            <div className='flex gap-3 px-6 py-4 border-t border-border'>
              <button className='btn-danger' type='button' onClick={handleDeleteProject} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Project'}
              </button>
              <button className='btn-secondary' type='button' onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
