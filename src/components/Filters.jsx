import { PRIORITIES, PRIORITY_LABELS } from '@/lib/transitions';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';

export default function Filters({ priority, onPriorityChange, breached, onBreachedToggle, onClear, onCreate }) {
  const hasFilter = priority || breached;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-sm text-slate-600">
        <Filter className="h-4 w-4" /> Filters:
      </div>
      <Select value={priority || 'all'} onValueChange={(v) => onPriorityChange(v === 'all' ? '' : v)}>
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant={breached ? 'default' : 'outline'}
        size="sm"
        onClick={onBreachedToggle}
        className={breached ? 'bg-amber-600 hover:bg-amber-700' : ''}
      >
        {breached ? 'Showing breached only' : 'Show breached only'}
      </Button>
      {hasFilter && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="mr-1 h-3.5 w-3.5" /> Clear
        </Button>
      )}
      <div className="ml-auto">
        <Button onClick={onCreate}>+ New ticket</Button>
      </div>
    </div>
  );
}
