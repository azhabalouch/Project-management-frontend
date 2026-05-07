import { useMemo } from 'react';
import type { Task } from '../components/type/typesInterface';
import type { FilterType, SortType } from '../utils/filterConstants';
import { PRIORITY_ORDER } from '../utils/filterConstants';

/**
 * Custom hook to encapsulate the logic for searching, filtering, and sorting tasks.
 * 
 * @param tasks - The raw array of tasks from context.
 * @param searchQuery - The user's current search input.
 * @param activeFilter - The currently selected status/priority filter.
 * @param sortBy - The currently selected sorting method.
 * @returns The processed array of tasks ready for rendering.
 */
export function useFilteredTasks(
  tasks: Task[],
  searchQuery: string,
  activeFilter: FilterType,
  sortBy: SortType
) {
  return useMemo(() => {
    let result = [...tasks];

    // 1. Handle Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.project?.toLowerCase().includes(query) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // 2. Handle Filters
    if (activeFilter !== 'all') {
      result = result.filter((task) => {
        if (['high', 'medium', 'low'].includes(activeFilter)) return task.priority === activeFilter;
        if (activeFilter === 'in-progress') return task.status === 'in-progress' || task.status === 'inprogress';
        return task.status === activeFilter;
      });
    }

    // 3. Handle Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'due-date') return (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity);
      if (sortBy === 'priority') return (PRIORITY_ORDER[a.priority ?? ''] ?? 4) - (PRIORITY_ORDER[b.priority ?? ''] ?? 4);
      return 0;
    });

    return result;
  }, [tasks, activeFilter, sortBy, searchQuery]);
}