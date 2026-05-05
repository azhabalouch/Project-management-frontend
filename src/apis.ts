const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const AUTH_URLS = {
	login: `${API_BASE_URL}/auth/login`,
	register: `${API_BASE_URL}/auth/register`,
	verify: `${API_BASE_URL}/auth/verify`,
	logout: `${API_BASE_URL}/auth/logout`,
} as const;

export const TASK_URLS = {
	get: `${API_BASE_URL}/user/task/get`,
	create: `${API_BASE_URL}/user/task/create`,
	patch: `${API_BASE_URL}/user/task/patch`,
	delete: `${API_BASE_URL}/user/task/delete`,
	history: `${API_BASE_URL}/user/task/history`,
	subtaskAdd: `${API_BASE_URL}/user/task/subtask/add`,
	subtaskUpdate: `${API_BASE_URL}/user/task/subtask/update`,
	subtaskDelete: `${API_BASE_URL}/user/task/subtask/delete`,
} as const;

export const PROJECT_URLS = {
	get: `${API_BASE_URL}/project/project/get`,
	create: `${API_BASE_URL}/project/project/create`,
	patch: `${API_BASE_URL}/project/project/patch`,
	delete: `${API_BASE_URL}/project/project/delete`,
} as const;

export const CALENDAR_URLS = {
	get: `${API_BASE_URL}/calendar`,
} as const;

export const TODO_URLS = {
	get: `${API_BASE_URL}/todo/todo/get`,
	create: `${API_BASE_URL}/todo/todo/create`,
	patch: `${API_BASE_URL}/todo/todo/patch`,
	delete: `${API_BASE_URL}/todo/todo/delete`,
} as const;