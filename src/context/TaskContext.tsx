import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TASK_URLS } from '../apis';
import type { Task, Subtask, TaskContextValue } from '../components/type/typesInterface';

export const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export const normalizeTask = (task: any): Task => ({
	id: String(task.id),
	title: String(task.title ?? ''),
	description: String(task.description ?? ''),
	status: String(task.status ?? ''),
	isCompleted: Boolean(task.isCompleted),
	createdAt: String(task.createdAt ?? ''),
	dueDate: task.dueDate ? new Date(task.dueDate) : null,
	priority: task.priority ?? undefined,
	project: task.project ?? undefined,
	tags: Array.isArray(task.tags) ? task.tags.map(String) : undefined,
	assignee: task.assignee
		? { name: String(task.assignee.name ?? ''), avatar: task.assignee.avatar ? String(task.assignee.avatar) : undefined }
		: undefined,
	progress: task.progress != null ? Number(task.progress) : undefined,
	subtasks: Array.isArray(task.subtasks)
		? task.subtasks.map((st: any): Subtask => ({
			id: String(st.id),
			text: String(st.text ?? ''),
			completed: Boolean(st.completed),
			createdAt: st.createdAt ? String(st.createdAt) : undefined,
			updatedAt: st.updatedAt ? String(st.updatedAt) : undefined,
		}))
		: undefined,
});

const normalizeTasks = (tasks: unknown): Task[] => {
	if (!Array.isArray(tasks)) {
		return [];
	}

	return tasks.map(normalizeTask);
};

const isIncompleteTask = (task: any) => task?.isCompleted === false;

export const TaskProvider = () => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const refreshTasks = useCallback(async () => {
		setLoading(true);
		setError('');

		try {
			const res = await fetch(TASK_URLS.get, {
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
			setTasks(normalizeTasks(Array.isArray(data) ? data.filter(isIncompleteTask) : []));
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to load tasks';
			setError(message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void refreshTasks();
	}, [refreshTasks]);

	const addTask = useCallback((task: Task) => {
		setTasks((currentTasks) => [...currentTasks, normalizeTask(task)]);
	}, []);

	const updateTask = useCallback((taskId: string, updatedTask: Task) => {
		const normalizedTask = normalizeTask(updatedTask);

		setTasks((currentTasks) => {
			if (normalizedTask.isCompleted) {
				return currentTasks.filter((task) => task.id !== taskId);
			}

			return currentTasks.map((task) => (task.id === taskId ? normalizedTask : task));
		});
	}, []);

	const removeTask = useCallback((taskId: string) => {
		setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
	}, []);

	return (
		<TaskContext.Provider
			value={{
				tasks,
				loading,
				error,
				refreshTasks,
				addTask,
				updateTask,
				removeTask,
			}}
		>
			<Outlet />
		</TaskContext.Provider>
	);
};

export const useTaskContext = () => {
	const context = useContext(TaskContext);

	if (!context) {
		throw new Error('useTaskContext must be used within a TaskProvider');
	}

	return context;
};