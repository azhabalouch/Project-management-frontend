import { useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useProjectContext } from '../context/ProjectContext';

/**
 * Hook to generate standardized dropdown options for Projects and Tags
 * based on current application state.
 */
export function useTaskFormOptions() {
  const { tasks } = useTaskContext();
  const { projects } = useProjectContext();

  const projectOptions = useMemo(() => [
    { value: '', label: 'No project' },
    ...projects.map(p => ({ value: p.name, label: p.name })),
  ], [projects]);

  const existingTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(t => t.tags?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort().map(tag => ({ value: tag, label: tag }));
  }, [tasks]);

  return { projectOptions, existingTags };
}