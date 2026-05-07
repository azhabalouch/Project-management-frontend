export const SELECT_BG_STYLE = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%2375736E' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '36px',
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: 'var(--priority-high-bg)', text: 'var(--priority-high-text)' },
  medium: { bg: 'var(--priority-medium-bg)', text: 'var(--priority-medium-text)' },
  low: { bg: 'var(--priority-low-bg)', text: 'var(--priority-low-text)' },
  skippable: { bg: 'var(--priority-skippable-bg)', text: 'var(--priority-skippable-text)' },
  default: { bg: 'var(--priority-low-bg)', text: 'var(--priority-low-text)' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'var(--status-pending-bg)', text: 'var(--status-pending-text)' },
  inprogress: { bg: 'var(--status-inprogress-bg)', text: 'var(--status-inprogress-text)' },
  'in-progress': { bg: 'var(--status-inprogress-bg)', text: 'var(--status-inprogress-text)' },
  notworking: { bg: 'var(--status-notworking-bg)', text: 'var(--status-notworking-text)' },
  'not-working': { bg: 'var(--status-notworking-bg)', text: 'var(--status-notworking-text)' },
  issue: { bg: 'var(--status-issue-bg)', text: 'var(--status-issue-text)' },
  bug: { bg: 'var(--status-bug-bg)', text: 'var(--status-bug-text)' },
  error: { bg: 'var(--status-error-bg)', text: 'var(--status-error-text)' },
  skipped: { bg: 'var(--status-skipped-bg)', text: 'var(--status-skipped-text)' },
  default: { bg: 'var(--status-pending-bg)', text: 'var(--status-pending-text)' },
};

export const getPriorityColor = (priority?: string) => PRIORITY_COLORS[priority?.toLowerCase() ?? 'default'] || PRIORITY_COLORS.default;
export const getStatusColor = (status: string) => STATUS_COLORS[status.toLowerCase()] || STATUS_COLORS.default;

export const getProgressColor = (p: number): string => {
  if (p >= 90) return 'var(--pct-90-text)';
  if (p >= 75) return 'var(--pct-75-text)';
  if (p >= 50) return 'var(--pct-50-text)';
  if (p >= 35) return 'var(--pct-35-text)';
  return 'var(--pct-10-text)';
};

export const getProgressBg = (p: number): string => {
  if (p >= 90) return 'var(--pct-90-bg)';
  if (p >= 75) return 'var(--pct-75-bg)';
  if (p >= 50) return 'var(--pct-50-bg)';
  if (p >= 35) return 'var(--pct-35-bg)';
  return 'var(--pct-10-bg)';
};