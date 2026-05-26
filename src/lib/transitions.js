export const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];

export const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export function allowedNext(from) {
  const idx = STATUS_ORDER.indexOf(from);
  if (idx === -1) return { forward: null, backward: null };
  return {
    forward: idx + 1 < STATUS_ORDER.length ? STATUS_ORDER[idx + 1] : null,
    backward: idx - 1 >= 0 ? STATUS_ORDER[idx - 1] : null,
  };
}

export function isValidTransition(from, to) {
  const fromIdx = STATUS_ORDER.indexOf(from);
  const toIdx = STATUS_ORDER.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  const diff = toIdx - fromIdx;
  return diff === 1 || diff === -1;
}

export function formatAge(minutes) {
  if (minutes == null) return '—';
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours ? `${days}d ${remHours}h` : `${days}d`;
}
