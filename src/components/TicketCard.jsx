import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { allowedNext, formatAge, PRIORITY_LABELS, STATUS_LABELS } from '@/lib/transitions';
import { cn } from '@/lib/utils';

const PRIORITY_STYLES = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
};

export default function TicketCard({ ticket, onMove, onDelete, busy, dragHandlers }) {
  const { forward, backward } = allowedNext(ticket.status);

  return (
    <div
      {...(dragHandlers || {})}
      className={cn(
        'group cursor-grab rounded-lg border bg-white p-3 shadow-sm transition active:cursor-grabbing',
        ticket.slaBreached ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200',
        busy && 'opacity-60'
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{ticket.subject}</h4>
        <Badge variant="outline" className={cn('shrink-0 capitalize', PRIORITY_STYLES[ticket.priority])}>
          {PRIORITY_LABELS[ticket.priority]}
        </Badge>
      </div>

      <p className="mb-3 line-clamp-2 text-xs text-slate-500">{ticket.description}</p>

      <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
          age {formatAge(ticket.ageMinutes)}
        </span>
        {ticket.slaBreached && (
          <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">
            <AlertTriangle className="h-3 w-3" /> SLA breached
          </span>
        )}
        {ticket.resolvedAt && (
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">resolved</span>
        )}
      </div>

      <div className="mb-2 truncate text-[11px] text-slate-400">{ticket.customerEmail}</div>

      <div className="flex items-center justify-between gap-1">
        <div className="flex gap-1">
          {backward && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onMove(ticket, backward)}
              disabled={busy}
              title={`Move to ${STATUS_LABELS[backward]}`}
            >
              <ArrowLeft className="mr-1 h-3 w-3" /> {STATUS_LABELS[backward]}
            </Button>
          )}
          {forward && (
            <Button
              variant="default"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onMove(ticket, forward)}
              disabled={busy}
              title={`Move to ${STATUS_LABELS[forward]}`}
            >
              {STATUS_LABELS[forward]} <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-400 hover:text-red-600"
          onClick={() => onDelete(ticket)}
          disabled={busy}
          title="Delete ticket"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
