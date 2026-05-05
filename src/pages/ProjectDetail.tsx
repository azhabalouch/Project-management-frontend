import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import { useTaskContext } from '../context/TaskContext';
import SideNavigation from '../components/SideNavigation';
import TopNavigation from '../components/TopNavigation';
import TaskCard from '../components/TaskCard';
import './style/ProjectDetail.css';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useProjectContext();
  const { tasks } = useTaskContext();

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
    </div>
  );
}
