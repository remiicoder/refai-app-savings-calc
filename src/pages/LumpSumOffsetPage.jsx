import { useMemo, useState } from 'react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import {
  LUMP_SUM_TYPE_ICONS,
  LUMP_SUM_TYPE_LABELS,
  LUMP_SUM_TYPES,
  MONTH_LABELS,
} from '../data/initialLumpSums';
import { formatAud } from '../utils/format';
import { simulateOffsetWithLumpSums } from '../utils/mortgage';

function formatTimeDiff(months) {
  if (months <= 0) return '—';
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y > 0) parts.push(`${y} yr${y !== 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} mo`);
  return parts.join(' ');
}

function AnimatedAud({ value, className = '' }) {
  const animated = useAnimatedNumber(value, 700);
  return <span className={className}>{formatAud(animated)}</span>;
}

const EMPTY_FORM = {
  label: '',
  type: LUMP_SUM_TYPES.TAX_RETURN,
  amount: '',
  month: 7,
  recurring: true,
};

function lumpToForm(lump) {
  return {
    label: lump.label,
    type: lump.type,
    amount: String(lump.amount),
    month: lump.month,
    recurring: lump.recurring,
  };
}

function LumpSumFormModal({ open, lump, onSave, onClose }) {
  const [form, setForm] = useState(() => (lump ? lumpToForm(lump) : EMPTY_FORM));

  const isEdit = Boolean(lump);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.label.trim() || !amount || amount <= 0) return;
    onSave({
      label: form.label.trim(),
      type: form.type,
      amount,
      month: Number(form.month),
      recurring: form.recurring,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lump-sum-form-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 id="lump-sum-form-title" className="text-lg font-bold text-slate-900">
          {isEdit ? 'Edit deposit' : 'Add lump sum'}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Label</span>
            <input
              type="text"
              required
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="e.g. Annual tax return"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-refai-teal focus:outline-none focus:ring-2 focus:ring-refai-teal/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-refai-teal focus:outline-none focus:ring-2 focus:ring-refai-teal/20"
            >
              <option value={LUMP_SUM_TYPES.TAX_RETURN}>Tax return</option>
              <option value={LUMP_SUM_TYPES.SAVINGS}>Savings lump sum</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Amount (AUD)</span>
            <input
              type="number"
              required
              min="1"
              step="100"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums focus:border-refai-teal focus:outline-none focus:ring-2 focus:ring-refai-teal/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Deposit month</span>
            <select
              value={form.month}
              onChange={(e) => setForm((f) => ({ ...f, month: Number(e.target.value) }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-refai-teal focus:outline-none focus:ring-2 focus:ring-refai-teal/20"
            >
              {MONTH_LABELS.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.recurring}
              onChange={(e) => setForm((f) => ({ ...f, recurring: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-refai-teal focus:ring-refai-teal"
            />
            <span className="text-sm text-slate-700">
              Repeat every year (e.g. annual tax return)
            </span>
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-refai-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-refai-teal-dark"
            >
              {isEdit ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LumpSumCard({ lump, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="text-2xl">{LUMP_SUM_TYPE_ICONS[lump.type]}</span>
          <div>
            <h3 className="font-semibold text-slate-900">{lump.label}</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {LUMP_SUM_TYPE_LABELS[lump.type]}
            </p>
          </div>
        </div>
        <p className="text-lg font-bold tabular-nums text-refai-teal-dark">
          {formatAud(lump.amount)}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
          {MONTH_LABELS[lump.month - 1]}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 font-medium ${
            lump.recurring
              ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200'
              : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
          }`}
        >
          {lump.recurring ? 'Every year' : 'One-off (year 1)'}
        </span>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(lump)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(lump.id)}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default function LumpSumOffsetPage({
  loanBalance,
  interestRate,
  loanTermYears,
  combinedMonthlySavings,
  lumpSums,
  setLumpSums,
}) {
  const [formModal, setFormModal] = useState(null);

  const simulation = useMemo(() => {
    const baseParams = {
      loanBalance,
      annualRate: interestRate,
      termYears: loanTermYears,
      monthlyOffsetDeposit: combinedMonthlySavings,
    };

    const monthlyOnly = simulateOffsetWithLumpSums({
      ...baseParams,
      lumpSums: [],
    });

    const withLumps = simulateOffsetWithLumpSums({
      ...baseParams,
      lumpSums,
    });

    const interestSaved = Math.max(
      0,
      monthlyOnly.totalInterest - withLumps.totalInterest,
    );
    const timeSavedMonths = Math.max(
      0,
      monthlyOnly.monthsToPayoff - withLumps.monthsToPayoff,
    );

    const extraOffsetYear1 = Math.max(
      0,
      withLumps.offsetBalanceYear1 - monthlyOnly.offsetBalanceYear1,
    );
    const extraOffsetYear5 = Math.max(
      0,
      withLumps.offsetBalanceYear5 - monthlyOnly.offsetBalanceYear5,
    );

    return {
      monthlyOnly,
      withLumps,
      interestSaved,
      timeSavedMonths,
      extraOffsetYear1,
      extraOffsetYear5,
    };
  }, [loanBalance, interestRate, loanTermYears, combinedMonthlySavings, lumpSums]);

  const recurringPerYear = useMemo(
    () => lumpSums.filter((l) => l.recurring).reduce((sum, l) => sum + l.amount, 0),
    [lumpSums],
  );

  const openAdd = () => setFormModal({ mode: 'add' });
  const openEdit = (lump) => setFormModal({ mode: 'edit', lump });
  const closeForm = () => setFormModal(null);

  const handleSave = (data) => {
    if (formModal?.mode === 'edit' && formModal.lump) {
      setLumpSums((prev) =>
        prev.map((l) => (l.id === formModal.lump.id ? { ...l, ...data } : l)),
      );
    } else {
      setLumpSums((prev) => [
        ...prev,
        { id: `lump-${Date.now()}`, ...data },
      ]);
    }
    closeForm();
  };

  return (
    <>
      <section className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-6 text-white shadow-lg">
        <h2 className="text-sm font-medium uppercase tracking-wider text-teal-100">
          Offset impact from lump sums
        </h2>
        <p className="mt-1 text-sm text-teal-100/90">
          Tax returns and savings deposits into your offset — on top of{' '}
          {formatAud(combinedMonthlySavings)}/mo from other savings
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResultStat
            label="Extra interest saved"
            value={simulation.interestSaved}
            highlight
          />
          <ResultStat
            label="Time saved on loan"
            value={formatTimeDiff(simulation.timeSavedMonths)}
            isText
          />
          <ResultStat
            label="Offset balance (1 yr)"
            value={simulation.withLumps.offsetBalanceYear1}
            sublabel={
              simulation.extraOffsetYear1 > 0
                ? `+${formatAud(simulation.extraOffsetYear1)} from lump sums`
                : undefined
            }
          />
          <ResultStat
            label="Offset balance (5 yrs)"
            value={simulation.withLumps.offsetBalanceYear5}
            sublabel={
              simulation.extraOffsetYear5 > 0
                ? `+${formatAud(simulation.extraOffsetYear5)} from lump sums`
                : undefined
            }
          />
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Lump sum deposits</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add yearly tax returns or one-off savings into your offset account
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-xl bg-refai-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-refai-teal-dark"
        >
          + Add lump sum
        </button>
      </div>

      {lumpSums.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <p className="font-medium text-slate-600">No lump sums yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Add your expected tax return or a savings deposit to see how much faster
            your offset grows.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lumpSums.map((lump) => (
            <LumpSumCard
              key={lump.id}
              lump={lump}
              onEdit={openEdit}
              onDelete={(id) => setLumpSums((prev) => prev.filter((l) => l.id !== id))}
            />
          ))}
        </div>
      )}

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <h3 className="font-semibold text-slate-900">Offset comparison</h3>
        <p className="mt-1 text-sm text-slate-500">
          Monthly redirect only vs including your lump sum schedule
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 pr-4 font-medium">Scenario</th>
                <th className="pb-3 pr-4 font-medium text-right">Total interest</th>
                <th className="pb-3 pr-4 font-medium text-right">Payoff time</th>
                <th className="pb-3 font-medium text-right">Offset @ 5 yrs</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4">Monthly savings only</td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  <AnimatedAud value={simulation.monthlyOnly.totalInterest} />
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {formatTimeDiff(simulation.monthlyOnly.monthsToPayoff)}
                </td>
                <td className="py-3 text-right tabular-nums">
                  <AnimatedAud value={simulation.monthlyOnly.offsetBalanceYear5} />
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-teal-800">
                  + Lump sums ({lumpSums.length})
                </td>
                <td className="py-3 pr-4 text-right font-semibold tabular-nums text-emerald-700">
                  <AnimatedAud value={simulation.withLumps.totalInterest} />
                </td>
                <td className="py-3 pr-4 text-right font-semibold text-emerald-700">
                  {formatTimeDiff(simulation.withLumps.monthsToPayoff)}
                </td>
                <td className="py-3 text-right font-semibold tabular-nums text-emerald-700">
                  <AnimatedAud value={simulation.withLumps.offsetBalanceYear5} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {simulation.withLumps.totalLumpSumsDeposited > 0 && (
          <p className="mt-4 text-xs text-slate-500">
            Total lump sums deposited over the loan life:{' '}
            <span className="font-medium text-slate-700">
              {formatAud(simulation.withLumps.totalLumpSumsDeposited)}
            </span>
            {recurringPerYear > 0 && (
              <>
                {' '}
                · {formatAud(recurringPerYear)}/yr from recurring deposits
              </>
            )}
          </p>
        )}
      </section>

      <section className="mt-8 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200/60">
        <h3 className="font-semibold text-slate-900">How this works</h3>
        <p className="mt-3 text-sm text-slate-600">
          Money in an offset account reduces the loan balance used to calculate interest
          each month. A tax return or savings lump sum parked in offset works the same as
          your ongoing subscription and bill savings — but in bigger chunks. Recurring
          entries model an annual tax refund; one-off entries apply in the first year only.
        </p>
      </section>

      {formModal && (
        <LumpSumFormModal
          key={formModal.mode === 'edit' ? formModal.lump.id : 'add'}
          open
          lump={formModal.mode === 'edit' ? formModal.lump : null}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}
    </>
  );
}

function ResultStat({ label, value, sublabel, highlight = false, isText = false }) {
  const animated = useAnimatedNumber(typeof value === 'number' ? value : 0, 700);

  return (
    <div
      className={`rounded-xl p-4 ${
        highlight ? 'bg-white/20 ring-1 ring-white/30' : 'bg-white/10'
      }`}
    >
      <p className="text-sm text-teal-100">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-white">
        {isText ? value : formatAud(animated)}
      </p>
      {sublabel && <p className="mt-1 text-xs text-teal-100/80">{sublabel}</p>}
    </div>
  );
}
