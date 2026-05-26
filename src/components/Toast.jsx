import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => onDismiss(), 4000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={cn(
          'flex max-w-sm items-start gap-2 rounded-lg border px-4 py-3 shadow-lg',
          isError ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
        )}
      >
        {isError ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
        <div className="flex-1 text-sm">{toast.message}</div>
        <button onClick={onDismiss} className="text-slate-500 hover:text-slate-900">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
