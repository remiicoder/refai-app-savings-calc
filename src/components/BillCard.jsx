import { BILL_CATEGORIES, RENEGOTIATION_STATUS } from '../data/initialBills';
import { formatAud, formatBillingDate } from '../utils/format';
import {
  getRenegotiationStatus,
  monthlySaving,
  monthsSinceNegotiation,
  renegotiationLabel,
  renegotiationStyles,
} from '../utils/bills';

export default function BillCard({ bill, onEdit, onCallNudge }) {
  const category = BILL_CATEGORIES[bill.category] ?? BILL_CATEGORIES.other;
  const saving = monthlySaving(bill);
  const months = monthsSinceNegotiation(bill.lastNegotiated);
  const status = getRenegotiationStatus(bill.lastNegotiated);
  const style = renegotiationStyles[status];
  const isOverdue = status === RENEGOTIATION_STATUS.OVERDUE;

  return (
    <article
      className={`flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 transition hover:shadow-md ${
        isOverdue ? 'ring-red-200' : 'ring-slate-200/80'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl shadow-inner"
          style={{ backgroundColor: `${category.color}22` }}
          aria-hidden
        >
          {category.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">{bill.name}</h3>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{category.label}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center sm:text-left">
        <div>
          <p className="text-xs text-slate-500">Original</p>
          <p className="mt-0.5 font-semibold text-slate-700 line-through decoration-slate-300">
            {formatAud(bill.originalPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Negotiated</p>
          <p className="mt-0.5 font-bold text-refai-teal-dark">
            {formatAud(bill.negotiatedPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">You save</p>
          <p className="mt-0.5 font-bold text-emerald-600">{formatAud(saving)}/mo</p>
        </div>
      </div>

      <p
        className={`mt-3 text-sm ${
          isOverdue ? 'font-medium text-red-700' : 'text-slate-600'
        }`}
      >
        {renegotiationLabel(status, months)}
        <span className="block text-xs font-normal text-slate-500">
          Last call: {formatBillingDate(bill.lastNegotiated)}
        </span>
      </p>

      {status === RENEGOTIATION_STATUS.DUE_SOON && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Negotiate again — it&apos;s been over 6 months since your last call.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        {isOverdue && (
          <button
            type="button"
            onClick={() => onCallNudge(bill)}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 sm:flex-none"
          >
            Time to Call 📞
          </button>
        )}
        <button
          type="button"
          onClick={() => onEdit(bill)}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:flex-none"
        >
          Edit price
        </button>
      </div>
    </article>
  );
}
