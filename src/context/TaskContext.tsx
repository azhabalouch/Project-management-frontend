import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { Task } from '../components/Type/TypesInterface';

const TASK_URL = 'http://localhost:3000/user/get/tasks';

export interface TaskContextValue {
	tasks: Task[];
	loading: boolean;
	error: string;
	refreshTasks: () => Promise<void>;
	addTask: (task: Task) => void;
	updateTask: (taskId: string, updatedTask: Task) => void;
	getTaskById: (taskId: string) => Task | undefined;
}

export const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export const normalizeTask = (task: any): Task => ({
	id: String(task.id),
	title: String(task.title ?? ''),
	description: String(task.description ?? ''),
	status: String(task.status ?? ''),
	isCompleted: Boolean(task.isCompleted),
	createdAt: String(task.createdAt ?? ''),
	dueDate: task.dueDate ? new Date(task.dueDate) : null,
});

const normalizeTasks = (tasks: unknown): Task[] => {
	if (!Array.isArray(tasks)) {
		return [];
	}

	return tasks.map(normalizeTask);
};

export const TaskProvider = () => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const refreshTasks = useCallback(async () => {
		setLoading(true);
		setError('');

		try {
			const res = await fetch(TASK_URL, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
				credentials: 'include',
			});

			const data = await res.json();
			setTasks(normalizeTasks(data));
		} catch (err: any) {
			setError(err.message);
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
		setTasks((currentTasks) =>
			currentTasks.map((task) => (task.id === taskId ? normalizeTask(updatedTask) : task))
		);
	}, []);

	const getTaskById = useCallback(
		(taskId: string) => tasks.find((task) => task.id === taskId),
		[tasks]
	);

	return (
		<TaskContext.Provider
			value={{
				tasks,
				loading,
				error,
				refreshTasks,
				addTask,
				updateTask,
				getTaskById,
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