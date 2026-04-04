import { createContext } from 'react';
import type { Task } from '../components/Type/TypesInterface';

export const TaskContext = createContext<Task | null>(null);