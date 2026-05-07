// const API_BASE_URL = "https://api.azhabalouch.dev";
const API_BASE_URL = "http://localhost:3000";

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
	get: `${API_BASE_URL}/user/project/get`,
	create: `${API_BASE_URL}/user/project/create`,
	patch: `${API_BASE_URL}/user/project/patch`,
	delete: `${API_BASE_URL}/user/project/delete`,
} as const;

export const CALENDAR_URLS = {
	get: `${API_BASE_URL}/user/event/get`,
} as const;

export const TODO_URLS = {
	get: `${API_BASE_URL}/user/todo/get`,
	create: `${API_BASE_URL}/user/todo/create`,
	patch: `${API_BASE_URL}/user/todo/patch`,
	delete: `${API_BASE_URL}/user/todo/delete`,
} as const;