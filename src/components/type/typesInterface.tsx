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

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  isCompleted: boolean;
  createdAt: string;
  dueDate: Date | null;
  project?: string;
  priority?: 'high' | 'medium' | 'low' | 'skippable';
  assignee?: {
    name: string;
    avatar?: string;
  };
  progress?: number;
  tags?: string[];
  subtasks?: Subtask[];
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

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  taskCount?: number;
}

export interface ProjectContextValue {
  projects: Project[];
  loading: boolean;
  error: string;
  refreshProjects: () => Promise<void>;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updatedProject: Project) => void;
  removeProject: (projectId: string) => void;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'project' | 'reminder';
  status?: string;
  priority?: string;
}

export interface Todo {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface DateNote {
  id: string;
  date: string;
  color: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteContextValue {
  notes: DateNote[];
  loading: boolean;
  error: string;
  refreshNotes: () => Promise<void>;
  addNote: (note: DateNote) => void;
  updateNote: (noteId: string, updatedNote: DateNote) => void;
  removeNote: (noteId: string) => void;
}

export interface HandleSubmitEvent extends React.SyntheticEvent<HTMLFormElement> {};