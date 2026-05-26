import { formatAud } from '../utils/format';

export default function ConfirmationModal({
  open,
  subscription,
  action,
  onConfirm,
  onCancel,
}) {
  if (!open || !subscription) return null;

  const verb = action === 'pause' ? 'pause' : 'cancel';
  const savingsLine =
    action === 'pause' || action === 'cancel'
      ? ` You'll save ${formatAud(subscription.monthlyCost)}/mo.`
      : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
          Confirm {verb}
        </h2>
        <p className="mt-3 text-slate-600">
          Are you sure you want to {verb}{' '}
          <span className="font-semibold text-slate-900">{subscription.name}</span>?
          {savingsLine}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Keep subscription
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
              action === 'cancel'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            Yes, {verb}
          </button>
        </div>
      </div>
    </div>
  );
}
