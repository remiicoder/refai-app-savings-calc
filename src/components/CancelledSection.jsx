import { useState } from 'react';
import SubscriptionCard from './SubscriptionCard';

export default function CancelledSection({ subscriptions }) {
  const [expanded, setExpanded] = useState(false);

  if (subscriptions.length === 0) return null;

  return (
    <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={expanded}
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Cancelled</h2>
          <p className="text-sm text-slate-500">
            {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition ${
            expanded ? 'rotate-180' : ''
          }`}
          aria-hidden
        >
          ▼
        </span>
      </button>
      {expanded && (
        <div className="grid gap-4 border-t border-slate-100 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <SubscriptionCard key={sub.id} subscription={sub} compact />
          ))}
        </div>
      )}
    </section>
  );
}
