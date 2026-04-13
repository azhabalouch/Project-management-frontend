const API_BASE_URL = 'https://project-management-backend-iota.vercel.app';

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
} as const;