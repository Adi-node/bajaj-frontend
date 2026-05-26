import { STATUS_LABELS, STATUS_ORDER } from '@/lib/transitions';
import { AlertTriangle } from 'lucide-react';

export default function StatsStrip({ stats, loading }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {STATUS_ORDER.map((status) => (
        <div
          key={status}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {STATUS_LABELS[status]}
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {loading ? '—' : stats?.byStatus?.[status] ?? 0}
          </div>
        </div>
      ))}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5" /> SLA breached (open)
        </div>
        <div className="mt-1 text-2xl font-semibold text-amber-900">
          {loading ? '—' : stats?.breachedOpen ?? 0}
        </div>
      </div>
    </div>
  );
}
