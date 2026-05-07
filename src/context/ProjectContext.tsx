import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { PROJECT_URLS } from '../apis';
import type { Project, ProjectContextValue } from '../components/type/typesInterface';

export const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

/**
 * Normalizes a raw project object from the API into a standard Project interface.
 * * @param {any} project - The raw project data.
 * @returns {Project} The sanitized Project object.
 */
export const normalizeProject = (project: any): Project => ({
  id: String(project.id),
  name: String(project.name ?? ''),
  description: String(project.description ?? ''),
  createdAt: String(project.createdAt ?? ''),
  taskCount: project.taskCount != null ? Number(project.taskCount) : undefined,
});

const normalizeProjects = (projects: unknown): Project[] => {
  return Array.isArray(projects) ? projects.map(normalizeProject) : [];
};

/**
 * ProjectProvider
 * * Wraps the application to provide global access to the projects state,
 * loading status, and CRUD operation handlers.
 */
export const ProjectProvider = ({ children }: ProjectProviderProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /** Fetches all projects from the backend and updates local state. */
  const refreshProjects = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(PROJECT_URLS.get, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setProjects(normalizeProjects(Array.isArray(data) ? data : []));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch projects on initial mount
  useEffect(() => {
    void refreshProjects();
  }, [refreshProjects]);

  const addProject = useCallback((project: Project) => {
    setProjects((current) => [...current, normalizeProject(project)]);
  }, []);

  const updateProject = useCallback((projectId: string, updatedProject: Project) => {
    setProjects((current) =>
      current.map((p) => (p.id === projectId ? normalizeProject(updatedProject) : p))
    );
  }, []);

  const removeProject = useCallback((projectId: string) => {
    setProjects((current) => current.filter((p) => p.id !== projectId));
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        error,
        refreshProjects,
        addProject,
        updateProject,
        removeProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

/**
 * Custom hook to consume the ProjectContext.
 * Ensures it is used within a valid ProjectProvider tree.
 */
export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};