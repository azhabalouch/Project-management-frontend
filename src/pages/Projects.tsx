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
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

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

  const handleDelete = async () => {
    if (!deletingProject) return;

    const result = await deleteProject({ projectId: deletingProject.id });
    if (result) {
      setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      setDeletingProject(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className='flex bg-surface-main w-full h-screen overflow-hidden'>
      <SideNavigation />
      <main className='flex-1 flex flex-col relative'>
        <TopNavigation />
        <section className='flex-1 px-4 py-6 md:px-16 md:py-8 overflow-y-auto flex flex-col gap-6'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-4'>
              <h1 className='text-2xl md:text-4xl font-semibold tracking-tighter text-text-primary'>Projects</h1>
            </div>
            <button
              className='btn-primary flex items-center gap-2'
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <img src="/add.svg" alt="Add" width={iconS} height={iconS} />
              {showCreateForm ? 'Cancel' : 'New Project'}
            </button>
          </div>

          {showCreateForm && (
            <div className='bg-surface-nav border border-border rounded-2xl p-8 shadow-card max-w-2xl'>
              {createError && <div className='bg-status-error-bg text-status-error-text px-4 py-3 rounded mb-4 font-ui text-sm'>{createError}</div>}
              <form onSubmit={handleCreate} className='flex flex-col gap-4'>
                <div className='flex flex-col text-left'>
                  <label htmlFor='project-name' className='font-ui text-sm font-medium text-text-secondary mb-1.5'>Project Name</label>
                  <input
                    id='project-name'
                    type='text'
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder='Name your project'
                    required
                    className='bg-bg-input border border-transparent rounded px-3.5 py-2.5 font-body text-sm text-text-primary transition-all focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20 focus:bg-bg-active'
                  />
                </div>
                <div className='flex flex-col text-left'>
                  <label htmlFor='project-description' className='font-ui text-sm font-medium text-text-secondary mb-1.5'>Description</label>
                  <textarea
                    id='project-description'
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder='Describe your project'
                    rows={3}
                    className='bg-bg-input border border-transparent rounded px-3.5 py-2.5 font-body text-sm text-text-primary transition-all resize-vertical focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20 focus:bg-bg-active'
                  />
                </div>
                <div className='flex gap-3 mt-2'>
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

          {deleteError && !editingProject && (
            <div className='bg-status-error-bg text-status-error-text px-4 py-3 rounded mb-4 font-ui text-sm'>{deleteError}</div>
          )}

          {loading ? (
            <div className='flex flex-col items-center justify-center py-16 gap-4'>
              <div className='w-10 h-10 border-[3px] border-bg-input border-t-brand-primary rounded-full animate-spin'></div>
              <p className='font-body text-base text-text-secondary'>Loading projects...</p>
            </div>
          ) : error ? (
            <div className='flex flex-col items-center justify-center py-16 gap-4'>
              <img src="/error.svg" alt="Error" width={48} height={48} />
              <p className='font-body text-base text-text-secondary'>Unable to load projects. Please try again.</p>
              <button className='btn-primary' onClick={fetchProjects}>Retry</button>
            </div>
          ) : projects.length > 0 ? (
            <div className='grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5'>
              {projects.map((project) => (
                <div key={project.id} className='bg-surface-nav border border-border rounded-lg p-6 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5 relative overflow-hidden cursor-pointer group' onClick={() => navigate(`/project/${project.id}`)}>
                  <div className='absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary to-accent-orange opacity-0 group-hover:opacity-100 transition-opacity'></div>
                  <div className='flex justify-between items-start mb-3'>
                    <h3 className='font-heading text-lg font-semibold text-text-primary m-0 line-clamp-2'>{project.name}</h3>
                    <div className='flex gap-1'>
                      <button
                        className='w-8 h-8 border-none rounded flex items-center justify-center bg-transparent text-text-secondary hover:bg-bg-active hover:text-text-primary cursor-pointer transition-all'
                        onClick={(e) => { e.stopPropagation(); openEdit(project); }}
                        title='Edit project'
                        aria-label='Edit project'
                      >
                        <img src="/edit.svg" alt="Edit" width={iconS} height={iconS} />
                      </button>
                      <button
                        className='w-8 h-8 border-none rounded flex items-center justify-center bg-transparent text-text-secondary hover:bg-bg-active hover:text-text-primary cursor-pointer transition-all'
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProject(project);
                        }}
                        title='Delete project'
                        aria-label='Delete project'
                      >
                        <img src="/dots.svg" alt="Delete" width={iconS} height={iconS} />
                      </button>
                    </div>
                  </div>
                  <p className='font-body text-sm text-text-secondary m-0 mb-4 line-clamp-2'>
                    {project.description || 'No description provided'}
                  </p>
                  <div className='flex justify-between items-center'>
                    <div className='flex gap-3 items-center'>
                      {project.taskCount != null && (
                        <span className='flex items-center gap-1 font-ui text-xs text-text-secondary'>
                          <img src="/task.svg" alt="Tasks" width={12} height={12} />
                          {project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <span className='font-ui text-xs text-text-secondary'>{formatDate(project.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-16 gap-4 text-center'>
              <img src="/empty.svg" alt="No projects" width={64} height={64} className='opacity-30' />
              <h3 className='font-heading text-2xl font-semibold text-text-primary m-0'>No projects yet</h3>
              <p className='font-body text-base text-text-secondary m-0'>Create a project to organize your tasks</p>
            </div>
          )}
        </section>
      </main>

      {editingProject && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50' onClick={(e) => { if (e.target === e.currentTarget) setEditingProject(null); }}>
          <div className='bg-surface-main border border-border rounded-xl shadow-card-hover w-full max-w-lg mx-4' role='dialog' aria-modal='true' aria-labelledby='edit-project-heading'>
            <div className='flex justify-between items-center px-6 py-4 border-b border-border'>
              <h2 id='edit-project-heading' className='text-xl font-semibold text-text-primary m-0'>Edit Project</h2>
              <button className='text-2xl cursor-pointer bg-none border-none text-text-secondary hover:text-text-primary' onClick={() => setEditingProject(null)} aria-label='Close modal'>&times;</button>
            </div>
            {(patchError || deleteError) && (
              <div className='bg-status-error-bg text-status-error-text px-4 py-3 m-4 rounded font-ui text-sm'>{patchError || deleteError}</div>
            )}
            <form onSubmit={handleEdit} className='flex flex-col gap-4 px-6 py-4'>
              <div className='flex flex-col text-left'>
                <label htmlFor='edit-project-name' className='font-ui text-sm font-medium text-text-secondary mb-1.5'>Project Name</label>
                <input
                  id='edit-project-name'
                  type='text'
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className='bg-bg-input border border-transparent rounded px-3.5 py-2.5 font-body text-sm text-text-primary transition-all focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20 focus:bg-bg-active'
                />
              </div>
              <div className='flex flex-col text-left'>
                <label htmlFor='edit-project-description' className='font-ui text-sm font-medium text-text-secondary mb-1.5'>Description</label>
                <textarea
                  id='edit-project-description'
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className='bg-bg-input border border-transparent rounded px-3.5 py-2.5 font-body text-sm text-text-primary transition-all resize-vertical focus:outline-none focus:border-brand-primary focus:shadow-lg focus:shadow-brand-primary/20 focus:bg-bg-active'
                />
              </div>
              <div className='flex gap-3 mt-2 pt-2 border-t border-border'>
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

      {deletingProject && (
        <div
          className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setDeletingProject(null);
            }
          }}
        >
          <div className='bg-surface-main border border-border rounded-xl shadow-card-hover w-full max-w-lg mx-4' role='dialog' aria-modal='true' aria-labelledby='delete-project-heading'>
            <div className='flex justify-between items-center px-6 py-4 border-b border-border'>
              <h2 id='delete-project-heading' className='text-xl font-semibold text-text-primary m-0'>Delete Project</h2>
              <button
                className='text-2xl cursor-pointer bg-none border-none text-text-secondary hover:text-text-primary disabled:opacity-50'
                onClick={() => setDeletingProject(null)}
                aria-label='Close modal'
                disabled={deleting}
              >
                &times;
              </button>
            </div>
            {deleteError && <div className='bg-status-error-bg text-status-error-text px-4 py-3 m-4 rounded font-ui text-sm'>{deleteError}</div>}
            <div className='px-6 py-4'>
              <p className='font-body text-text-primary text-base leading-relaxed m-0 mb-3'>
                This will permanently delete <strong>{deletingProject.name}</strong>.
              </p>
              <p className='font-ui text-status-error-text text-sm m-0'>
                This action cannot be undone.
              </p>
            </div>
            <div className='flex gap-3 px-6 py-4 border-t border-border'>
              <button className='btn-danger' type='button' onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Project'}
              </button>
              <button className='btn-secondary' type='button' onClick={() => setDeletingProject(null)} disabled={deleting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
