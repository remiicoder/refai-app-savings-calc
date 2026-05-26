import { STATUS } from '../data/initialSubscriptions';
import { formatAud, formatBillingDate } from '../utils/format';

const statusStyles = {
  [STATUS.ACTIVE]: {
    badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Active',
  },
  [STATUS.PAUSED]: {
    badge: 'bg-amber-100 text-amber-800 ring-amber-200',
    dot: 'bg-amber-500',
    label: 'Paused',
  },
  [STATUS.CANCELLED]: {
    badge: 'bg-red-100 text-red-800 ring-red-200',
    dot: 'bg-red-500',
    label: 'Cancelled',
  },
};

export default function SubscriptionCard({
  subscription,
  onPause,
  onCancel,
  onReactivate,
  compact = false,
}) {
  const style = statusStyles[subscription.status];
  const isActive = subscription.status === STATUS.ACTIVE;
  const isPaused = subscription.status === STATUS.PAUSED;

  return (
    <article
      className={`flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-inner"
          style={{ backgroundColor: subscription.color }}
          aria-hidden
        >
          {subscription.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {subscription.name}
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-refai-teal-dark">
            {formatAud(subscription.monthlyCost)}
            <span className="text-sm font-normal text-slate-500">/mo</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Next billing: {formatBillingDate(subscription.billingDate)}
          </p>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {isActive && (
            <button
              type="button"
              onClick={() => onPause(subscription)}
              className="flex-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100 sm:flex-none sm:px-4"
            >
              Pause
            </button>
          )}
          {isPaused && (
            <button
              type="button"
              onClick={() => onReactivate(subscription)}
              className="w-full rounded-xl bg-refai-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-refai-teal-dark sm:w-auto"
            >
              Reactivate
            </button>
          )}
        </div>
      )}
    </article>
  );
}
