import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNavigation from '../components/SideNavigation';
import TopNavigation from '../components/TopNavigation';
import { useGet } from '../hooks/useGet';
import { usePost } from '../hooks/usePost';
import { usePatch } from '../hooks/usePatch';
import { useDelete } from '../hooks/useDelete';
import { PROJECT_URLS } from '../apis';
import type { Project, HandleSubmitEvent } from '../components/type/typesInterface';
import { normalizeProject } from '../context/ProjectContext';
import './style/Home.css';
import './style/Projects.css';

const iconS = 16;

export default function Projects() {
  const navigate = useNavigate();
  const { execute: fetchProjects, loading, error } = useGet<Project[]>(PROJECT_URLS.get);
  const { execute: createProject, loading: creating, error: createError } = usePost(PROJECT_URLS.create);
  const { execute: patchProject, loading: patching, error: patchError } = usePatch(PROJECT_URLS.patch);
  const { remove: deleteProject, loading: deleting, error: deleteError } = useDelete(PROJECT_URLS.delete);

  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProjects();
        if (Array.isArray(data)) {
          setProjects(data.map(normalizeProject));
        }
      } catch {
        // Error handled by useGet
      }
    };
    load();
  }, [fetchProjects]);

  const handleCreate = async (e: HandleSubmitEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const result = await createProject({ name: newName.trim(), description: newDescription.trim() });
    if (result) {
      if (result === true) {
        const data = await fetchProjects();
        if (Array.isArray(data)) setProjects(data.map(normalizeProject));
      } else if (typeof result === 'object') {
        setProjects((prev) => [...prev, normalizeProject(result)]);
      }
      setNewName('');
      setNewDescription('');
      setShowCreateForm(false);
    }
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditDescription(project.description);
  };

  const handleEdit = async (e: HandleSubmitEvent) => {
    e.preventDefault();
    if (!editingProject || !editName.trim()) return;

    const payload: { id: string; [key: string]: unknown } = { id: editingProject.id };
    if (editName !== editingProject.name) payload.name = editName.trim();
    if (editDescription !== editingProject.description) payload.description = editDescription.trim();

    if (Object.keys(payload).length === 1) {
      setEditingProject(null);
      return;
    }

    const result = await patchProject(payload);
    if (result) {
      if (result === true) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingProject.id
              ? { ...p, name: editName.trim(), description: editDescription.trim() }
              : p
          )
        );
      } else if (typeof result === 'object') {
        setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? normalizeProject(result) : p)));
      }
      setEditingProject(null);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (confirmDeleteId !== projectId) {
      setConfirmDeleteId(projectId);
      return;
    }

    const result = await deleteProject({ id: projectId });
    if (result) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setConfirmDeleteId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className='home-layout'>
      <SideNavigation />
      <main className='home-main'>
        <TopNavigation />
        <section className='home-content'>
          <div className='home-header'>
            <div className='home-header-title-container'>
              <h1 className='home-header-title'>Projects</h1>
            </div>
            <button
              className='btn-primary'
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <img src="/add.svg" alt="Add" width={iconS} height={iconS} />
              {showCreateForm ? 'Cancel' : 'New Project'}
            </button>
          </div>

          {showCreateForm && (
            <div className='project-create-card'>
              {createError && <div className='project-create-error'>{createError}</div>}
              <form onSubmit={handleCreate} className='project-edit-form'>
                <div className='form-group'>
                  <label htmlFor='project-name'>Project Name</label>
                  <input
                    id='project-name'
                    type='text'
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder='Name your project'
                    required
                  />
                </div>
                <div className='form-group'>
                  <label htmlFor='project-description'>Description</label>
                  <textarea
                    id='project-description'
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder='Describe your project'
                    rows={3}
                  />
                </div>
                <div className='project-create-actions'>
                  <button type='submit' className='btn-primary' disabled={creating || !newName.trim()}>
                    {creating ? 'Creating...' : 'Create Project'}
                  </button>
                  <button type='button' className='btn-secondary' onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className='home-loading-state'>
              <div className='loading-spinner'></div>
              <p>Loading projects...</p>
            </div>
          ) : error ? (
            <div className='home-error-state'>
              <img src="/error.svg" alt="Error" width={48} height={48} />
              <p>Unable to load projects. Please try again.</p>
              <button className='btn-primary' onClick={fetchProjects}>Retry</button>
            </div>
          ) : projects.length > 0 ? (
            <div className='projects-grid'>
              {projects.map((project) => (
                <div key={project.id} className='project-card' onClick={() => navigate(`/project/${project.id}`)}>
                  <div className='project-card-header'>
                    <h3 className='project-card-title'>{project.name}</h3>
                    <div className='project-card-actions'>
                      <button
                        className='project-card-action-btn'
                        onClick={(e) => { e.stopPropagation(); openEdit(project); }}
                        title='Edit project'
                        aria-label='Edit project'
                      >
                        <img src="/edit.svg" alt="Edit" width={iconS} height={iconS} />
                      </button>
                      <button
                        className='project-card-action-btn'
                        onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                        title={confirmDeleteId === project.id ? 'Click again to confirm' : 'Delete project'}
                        aria-label='Delete project'
                      >
                        <img src="/dots.svg" alt="Delete" width={iconS} height={iconS} />
                      </button>
                    </div>
                  </div>
                  <p className='project-card-description'>
                    {project.description || 'No description provided'}
                  </p>
                  <div className='project-card-footer'>
                    <div className='project-card-meta'>
                      {project.taskCount != null && (
                        <span className='project-card-stat'>
                          <img src="/task.svg" alt="Tasks" width={12} height={12} />
                          {project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <span className='project-card-date'>{formatDate(project.createdAt)}</span>
                  </div>
                  {confirmDeleteId === project.id && (
                    <div className='project-confirm-delete'>
                      <span className='project-confirm-delete-text'>
                        Confirm deletion?
                      </span>
                      <button
                        className='btn-danger'
                        onClick={() => handleDelete(project.id)}
                        disabled={deleting}
                      >
                        {deleting ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        className='btn-secondary'
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='home-empty-state'>
              <img src="/empty.svg" alt="No projects" width={64} height={64} />
              <h3>No projects yet</h3>
              <p>Create a project to organize your tasks</p>
            </div>
          )}
        </section>
      </main>

      {editingProject && (
        <div className='modal-backdrop' onClick={(e) => { if (e.target === e.currentTarget) setEditingProject(null); }}>
          <div className='modal-content' role='dialog' aria-modal='true' aria-labelledby='edit-project-heading'>
            <div className='modal-header'>
              <h2 id='edit-project-heading'>Edit Project</h2>
              <button className='modal-close-btn' onClick={() => setEditingProject(null)} aria-label='Close modal'>&times;</button>
            </div>
            {(patchError || deleteError) && (
              <div className='modal-error'>{patchError || deleteError}</div>
            )}
            <form onSubmit={handleEdit} className='project-edit-form'>
              <div className='form-group'>
                <label htmlFor='edit-project-name'>Project Name</label>
                <input
                  id='edit-project-name'
                  type='text'
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className='form-group'>
                <label htmlFor='edit-project-description'>Description</label>
                <textarea
                  id='edit-project-description'
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className='modal-actions'>
                <button type='submit' className='btn-primary' disabled={patching}>
                  {patching ? 'Saving...' : 'Save Changes'}
                </button>
                <button type='button' className='btn-secondary' onClick={() => setEditingProject(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
