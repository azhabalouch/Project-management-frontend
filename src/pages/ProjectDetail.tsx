import { useMemo, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { useTaskContext } from '../context/TaskContext';
import { useDelete } from '../hooks/useDelete';
import { PROJECT_URLS } from '../apis';
import SideNavigation from '../components/SideNavigation';
import TopNavigation from '../components/TopNavigation';
import TaskCard from '../components/TaskCard';
import './style/ProjectDetail.css';

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
      <div className='home-layout'>
        <SideNavigation />
        <main className='home-main'>
          <TopNavigation />
          <section className='home-content'>
            <div className='home-empty-state'>
              <img src="/empty.svg" alt="Not found" width={64} height={64} />
              <h3>Project not found</h3>
              <p>The project you're looking for doesn't exist or has been deleted.</p>
              <button className='btn-primary' onClick={() => navigate('/projects')}>Back to Projects</button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className='home-layout'>
      <SideNavigation />
      <main className='home-main'>
        <TopNavigation />
        <section className='home-content'>
          <div className='task-detail-breadcrumb'>
            <button className='breadcrumb-link' onClick={() => navigate('/projects')}>Projects</button>
            <span className='breadcrumb-separator'>/</span>
            <span className='breadcrumb-current'>{project.name}</span>
          </div>

          <div className='project-detail-layout'>
            <div className='project-detail-main'>
              <div className='project-detail-card'>
                <div className='project-detail-header'>
                  <div className='project-detail-header-left'>
                    <span className='project-detail-label'>Project</span>
                    <h1 className='project-detail-title'>{project.name}</h1>
                  </div>
                  <div className='project-detail-header-actions'>
                    <button className='btn-secondary' onClick={() => navigate('/projects')}>
                      Back to Projects
                    </button>
                    <div className='detail-action-menu' ref={actionMenuRef}>
                      <button
                        className='detail-action-menu-trigger'
                        type='button'
                        aria-label='More actions'
                        aria-haspopup='menu'
                        aria-expanded={showActionMenu}
                        onClick={() => setShowActionMenu((prev) => !prev)}
                      >
                        <img src="/dots.svg" alt="" width={16} height={16} />
                      </button>
                      {showActionMenu && (
                        <div className='detail-action-menu-popover' role='menu'>
                          <button
                            type='button'
                            role='menuitem'
                            className='detail-action-menu-item detail-action-menu-item-danger'
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
                  <div className='project-detail-description'>
                    <p>{project.description}</p>
                  </div>
                )}

                <div className='project-detail-progress-section'>
                  <div className='project-detail-progress-header'>
                    <span className='project-detail-progress-label'>Overall Progress</span>
                    <span className='project-detail-progress-value'>{progressPercent}%</span>
                  </div>
                  <div className='project-detail-progress-track'>
                    <div
                      className='project-detail-progress-bar'
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className='project-detail-progress-stats'>
                    <span className='project-detail-stat'>
                      <span className='project-detail-stat-value'>{completedCount}</span> completed
                    </span>
                    <span className='project-detail-stat'>
                      <span className='project-detail-stat-value'>{totalCount - completedCount}</span> remaining
                    </span>
                    <span className='project-detail-stat'>
                      <span className='project-detail-stat-value'>{totalCount}</span> total
                    </span>
                  </div>
                </div>
              </div>

              <div className='project-detail-tasks-section'>
                <div className='project-detail-tasks-header'>
                  <h2>Tasks</h2>
                  <button
                    className='btn-primary'
                    onClick={() => navigate('/task-create')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <img src="/add.svg" alt="Add" width={16} height={16} />
                    Add Task
                  </button>
                </div>

                {projectTasks.length > 0 ? (
                  <ul className='task-list'>
                    {projectTasks.map(task => (
                      <li key={task.id} className='task-item'>
                        <TaskCard
                          task={task}
                          onEdit={() => navigate(`/task/${task.id}`)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className='home-empty-state'>
                    <img src="/empty.svg" alt="No tasks" width={64} height={64} />
                    <h3>No tasks in this project</h3>
                    <p>Create a task and assign it to this project</p>
                  </div>
                )}
              </div>
            </div>

            <div className='project-detail-sidebar'>
              <div className='task-detail-sidebar-card'>
                <h4>Project Details</h4>
                <div className='task-detail-sidebar-rows'>
                  <div className='task-detail-sidebar-row'>
                    <span className='task-detail-sidebar-label'>Created</span>
                    <span className='task-detail-sidebar-value'>{formatDate(project.createdAt)}</span>
                  </div>
                  <div className='task-detail-sidebar-row'>
                    <span className='task-detail-sidebar-label'>Tasks</span>
                    <span className='task-detail-sidebar-value'>{totalCount}</span>
                  </div>
                  <div className='task-detail-sidebar-row'>
                    <span className='task-detail-sidebar-label'>Completed</span>
                    <span className='task-detail-sidebar-value'>{completedCount}</span>
                  </div>
                  <div className='task-detail-sidebar-row'>
                    <span className='task-detail-sidebar-label'>Progress</span>
                    <span className='task-detail-sidebar-value' style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{progressPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showDeleteModal && (
        <div
          className='modal-backdrop'
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div className='modal-content project-delete-modal' role='dialog' aria-modal='true' aria-labelledby='delete-project-detail-heading'>
            <div className='modal-header'>
              <h2 id='delete-project-detail-heading'>Delete Project</h2>
              <button
                className='modal-close-btn'
                onClick={() => setShowDeleteModal(false)}
                aria-label='Close modal'
                disabled={deleting}
              >
                &times;
              </button>
            </div>
            {deleteError && <div className='modal-error'>{deleteError}</div>}
            <p className='project-delete-copy'>
              This will permanently delete <strong>{project.name}</strong>.
            </p>
            <p className='project-delete-subcopy'>
              This action cannot be undone.
            </p>
            <div className='modal-actions'>
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
