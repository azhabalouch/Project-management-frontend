import React from 'react';

export interface LoginFormData {
  email: string;
  password: string;
};

export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export interface AuthResponse {
  firstName: string;
  lastName: string;
};

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  isCompleted: boolean;
  createdAt: string; 
  dueDate: Date | null;   
}

export interface TaskContextValue {
	tasks: Task[];
	loading: boolean;
	error: string;
	refreshTasks: () => Promise<void>;
	addTask: (task: Task) => void;
	updateTask: (taskId: string, updatedTask: Task) => void;
  removeTask: (taskId: string) => void;
}

export interface HandleSubmitEvent extends React.SyntheticEvent<HTMLFormElement> {};