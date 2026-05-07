export type FilterType = 'all' | 'high' | 'medium' | 'low' | 'in-progress' | 'pending' | 'skipped' | 'bug';
export type SortType = 'newest' | 'oldest' | 'due-date' | 'priority';

export const filterChipClassNames: Record<FilterType, string> = {
  all: 'border-border bg-surface-nav text-text-secondary hover:bg-bg-active',
  high: 'border-priority-high-text/20 bg-priority-high-bg text-priority-high-text hover:bg-priority-high-bg/80',
  medium: 'border-priority-medium-text/20 bg-priority-medium-bg text-priority-medium-text hover:bg-priority-medium-bg/80',
  low: 'border-priority-low-text/20 bg-priority-low-bg text-priority-low-text hover:bg-priority-low-bg/80',
  'in-progress': 'border-status-inprogress-text/20 bg-status-inprogress-bg text-status-inprogress-text hover:bg-status-inprogress-bg/80',
  pending: 'border-status-pending-text/20 bg-status-pending-bg text-status-pending-text hover:bg-status-pending-bg/80',
  skipped: 'border-status-skipped-text/20 bg-status-skipped-bg text-status-skipped-text hover:bg-status-skipped-bg/80',
  bug: 'border-status-bug-text/20 bg-status-bug-bg text-status-bug-text hover:bg-status-bug-bg/80',
};

export const activeFilterChipClassNames: Record<FilterType, string> = {
  all: 'border-border bg-surface-nav text-text-primary font-semibold shadow-sm shadow-black/5',
  high: 'border-priority-high-text bg-priority-high-bg text-priority-high-text font-semibold shadow-sm shadow-priority-high-text/10',
  medium: 'border-priority-medium-text bg-priority-medium-bg text-priority-medium-text font-semibold shadow-sm shadow-priority-medium-text/10',
  low: 'border-priority-low-text bg-priority-low-bg text-priority-low-text font-semibold shadow-sm shadow-priority-low-text/10',
  'in-progress': 'border-status-inprogress-text bg-status-inprogress-bg font-semibold text-status-inprogress-text shadow-sm shadow-status-inprogress-text/10',
  pending: 'border-status-pending-text bg-status-pending-bg text-status-pending-text font-semibold shadow-sm shadow-status-pending-text/10',
  skipped: 'border-status-skipped-text bg-status-skipped-bg text-status-skipped-text font-semibold shadow-sm shadow-status-skipped-text/10',
  bug: 'border-status-bug-text bg-status-bug-bg text-status-bug-text font-semibold shadow-sm shadow-status-bug-text/10',
};

export const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
  { key: 'in-progress', label: 'In-progress' },
  { key: 'pending', label: 'Pending' },
  { key: 'skipped', label: 'Skipped' },
  { key: 'bug', label: 'Bug' },
];

export const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2, skippable: 3 };
