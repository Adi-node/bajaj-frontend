import { STATUS_LABELS } from '@/lib/transitions';
import TicketCard from './TicketCard';
import { cn } from '@/lib/utils';

export default function BoardColumn({
  status,
  tickets,
  onMove,
  onDelete,
  busyIds,
  onDragOver,
  onDrop,
  dragOver,
  onDragStart,
  onDragEnd,
}) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(status);
      }}
      onDragLeave={() => onDragOver(null)}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(status);
      }}
      className={cn(
        'flex flex-col rounded-lg border border-slate-200 bg-slate-100/60 p-3 transition',
        dragOver && 'border-slate-400 bg-slate-200/80 ring-2 ring-slate-300'
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          {STATUS_LABELS[status]}
        </h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600 shadow-sm">
          {tickets.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1" style={{ minHeight: 120 }}>
        {tickets.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-300 bg-white/50 p-4 text-center text-xs text-slate-400">
            No tickets
          </div>
        )}
        {tickets.map((t) => (
          <TicketCard
            key={t.id}
            ticket={t}
            onMove={onMove}
            onDelete={onDelete}
            busy={busyIds.has(t.id)}
            dragHandlers={{
              draggable: true,
              onDragStart: (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', t.id);
                onDragStart(t);
              },
              onDragEnd,
            }}
          />
        ))}
      </div>
    </div>
  );
}
