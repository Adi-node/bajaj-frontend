import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, API_BASE } from '@/lib/api';
import { isValidTransition, STATUS_LABELS, STATUS_ORDER } from '@/lib/transitions';
import BoardColumn from '@/components/BoardColumn';
import CreateTicketDialog from '@/components/CreateTicketDialog';
import Filters from '@/components/Filters';
import StatsStrip from '@/components/StatsStrip';
import Toast from '@/components/Toast';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [priority, setPriority] = useState('');
  const [breached, setBreached] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [busyIds, setBusyIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  const [draggedId, setDraggedId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [snapBackId, setSnapBackId] = useState(null);

  const reqIdRef = useRef(0);

  const loadAll = useCallback(async () => {
    const myReq = ++reqIdRef.current;
    try {
      setError('');
      const [list, s] = await Promise.all([
        api.listTickets({ priority, breached: breached ? 'true' : undefined }),
        api.stats(),
      ]);
      if (myReq !== reqIdRef.current) return;
      setTickets(list);
      setStats(s);
    } catch (err) {
      if (myReq !== reqIdRef.current) return;
      setError(err.message || 'Failed to load tickets');
    } finally {
      if (myReq === reqIdRef.current) setLoading(false);
    }
  }, [priority, breached]);

  useEffect(() => {
    setLoading(true);
    loadAll();
  }, [loadAll]);

  // Refresh ages every 30s so SLA flags refresh without manual reload
  useEffect(() => {
    const i = setInterval(() => loadAll(), 30000);
    return () => clearInterval(i);
  }, [loadAll]);

  const grouped = useMemo(() => {
    const g = { open: [], in_progress: [], resolved: [], closed: [] };
    for (const t of tickets) {
      if (g[t.status]) g[t.status].push(t);
    }
    return g;
  }, [tickets]);

  function markBusy(id, on) {
    setBusyIds((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });
  }

  async function handleMove(ticket, nextStatus) {
    if (!isValidTransition(ticket.status, nextStatus)) {
      setToast({ type: 'error', message: `Cannot move ${STATUS_LABELS[ticket.status]} → ${STATUS_LABELS[nextStatus]}` });
      setSnapBackId(ticket.id);
      setTimeout(() => setSnapBackId(null), 600);
      return;
    }
    markBusy(ticket.id, true);
    // optimistic update
    const prev = tickets;
    setTickets((list) => list.map((t) => (t.id === ticket.id ? { ...t, status: nextStatus } : t)));
    try {
      const updated = await api.updateTicket(ticket.id, { status: nextStatus });
      setTickets((list) => list.map((t) => (t.id === ticket.id ? updated : t)));
      const s = await api.stats();
      setStats(s);
    } catch (err) {
      setTickets(prev);
      setToast({ type: 'error', message: err.message || 'Move failed' });
      setSnapBackId(ticket.id);
      setTimeout(() => setSnapBackId(null), 600);
    } finally {
      markBusy(ticket.id, false);
    }
  }

  async function handleDelete(ticket) {
    if (!window.confirm(`Delete ticket "${ticket.subject}"?`)) return;
    markBusy(ticket.id, true);
    try {
      await api.deleteTicket(ticket.id);
      setTickets((list) => list.filter((t) => t.id !== ticket.id));
      const s = await api.stats();
      setStats(s);
      setToast({ type: 'success', message: 'Ticket deleted' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Delete failed' });
    } finally {
      markBusy(ticket.id, false);
    }
  }

  async function handleCreate(payload) {
    const created = await api.createTicket(payload);
    setTickets((list) => [created, ...list]);
    const s = await api.stats();
    setStats(s);
    setToast({ type: 'success', message: 'Ticket created' });
  }

  function handleDrop(toStatus) {
    setDragOverCol(null);
    if (!draggedId) return;
    const t = tickets.find((x) => x.id === draggedId);
    setDraggedId(null);
    if (!t || t.status === toStatus) return;
    handleMove(t, toStatus);
  }

  const hasBackend = Boolean(API_BASE) || true;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="container flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">DeskFlow</h1>
            <p className="text-sm text-slate-500">Support ticket triage board</p>
          </div>
          <div className="text-xs text-slate-400">API: {API_BASE || '(same origin)'}</div>
        </div>
      </header>

      <main className="container space-y-4 py-6">
        <StatsStrip stats={stats} loading={loading && !stats} />

        <Filters
          priority={priority}
          onPriorityChange={setPriority}
          breached={breached}
          onBreachedToggle={() => setBreached((b) => !b)}
          onClear={() => {
            setPriority('');
            setBreached(false);
          }}
          onCreate={() => setCreateOpen(true)}
        />

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
            <button onClick={() => loadAll()} className="ml-3 underline">Retry</button>
          </div>
        )}

        {loading && !tickets.length ? (
          <div className="grid gap-3 lg:grid-cols-4">
            {STATUS_ORDER.map((s) => (
              <div key={s} className="h-64 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-4">
            {STATUS_ORDER.map((status) => (
              <BoardColumn
                key={status}
                status={status}
                tickets={grouped[status]}
                onMove={handleMove}
                onDelete={handleDelete}
                busyIds={busyIds}
                onDragOver={setDragOverCol}
                onDrop={handleDrop}
                dragOver={dragOverCol === status}
                onDragStart={(t) => setDraggedId(t.id)}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDragOverCol(null);
                }}
              />
            ))}
          </div>
        )}
      </main>

      <CreateTicketDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
