import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { PROJECT_URLS } from '../apis';
import type { Project, ProjectContextValue } from '../components/type/typesInterface';

export const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export const normalizeProject = (project: any): Project => ({
	id: String(project.id),
	name: String(project.name ?? ''),
	description: String(project.description ?? ''),
	createdAt: String(project.createdAt ?? ''),
	taskCount: project.taskCount != null ? Number(project.taskCount) : undefined,
});

const normalizeProjects = (projects: unknown): Project[] => {
	if (!Array.isArray(projects)) {
		return [];
	}
	return projects.map(normalizeProject);
};

export const ProjectProvider = () => {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const refreshProjects = useCallback(async () => {
		setLoading(true);
		setError('');

		try {
			const res = await fetch(PROJECT_URLS.get, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
				credentials: 'include',
			});

			if (!res.ok) {
				const contentType = res.headers.get('content-type');
				const data = contentType?.includes('application/json') ? await res.json() : null;
				const message =
					data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
						? data.message
						: `Request failed with status ${res.status}`;
				throw new Error(message);
			}

			const data = await res.json();
			setProjects(normalizeProjects(Array.isArray(data) ? data : []));
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to load projects';
			setError(message);
		} finally {
			setLoading(false);
		}
	}, []);

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
			<Outlet />
		</ProjectContext.Provider>
	);
};

export const useProjectContext = () => {
	const context = useContext(ProjectContext);

	if (!context) {
		throw new Error('useProjectContext must be used within a ProjectProvider');
	}

	return context;
};
