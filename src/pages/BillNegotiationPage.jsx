import { useMemo, useState } from 'react';
import BillCard from '../components/BillCard';
import BillFormModal from '../components/BillFormModal';
import BillSavingsBanner from '../components/BillSavingsBanner';
import {
  applyTargetSavingsPercent,
  getRenegotiationStatus,
  projectedSavingAtPercent,
  resetBillsToOriginalPrices,
  sortBills,
  summarizeBills,
} from '../utils/bills';
import { formatAud } from '../utils/format';
import { RENEGOTIATION_STATUS } from '../data/initialBills';

const SORT_OPTIONS = [
  { value: 'saving', label: 'Highest saving' },
  { value: 'date', label: 'Oldest negotiation first' },
  { value: 'category', label: 'Category' },
];

const TARGET_PRESETS = [5, 10, 15, 20];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function BillNegotiationPage({ bills, setBills }) {
  const [sortBy, setSortBy] = useState('saving');
  const [formModal, setFormModal] = useState(null);
  const [targetPercent, setTargetPercent] = useState(10);

  const summary = useMemo(() => summarizeBills(bills), [bills]);
  const sortedBills = useMemo(() => sortBills(bills, sortBy), [bills, sortBy]);
  const projectedMonthlySaving = useMemo(
    () => projectedSavingAtPercent(bills, targetPercent),
    [bills, targetPercent],
  );

  const overdueCount = useMemo(
    () =>
      bills.filter(
        (b) =>
          getRenegotiationStatus(b.lastNegotiated) ===
          RENEGOTIATION_STATUS.OVERDUE,
      ).length,
    [bills],
  );

  const openAdd = () => setFormModal({ mode: 'add' });
  const openEdit = (bill) => setFormModal({ mode: 'edit', bill });
  const closeForm = () => setFormModal(null);

  const handleSave = (data) => {
    if (formModal?.mode === 'edit' && formModal.bill) {
      setBills((prev) =>
        prev.map((b) =>
          b.id === formModal.bill.id
            ? {
                ...b,
                ...data,
                lastNegotiated: todayIso(),
              }
            : b,
        ),
      );
    } else {
      setBills((prev) => [
        ...prev,
        {
          id: `bill-${Date.now()}`,
          ...data,
          lastNegotiated: todayIso(),
        },
      ]);
    }
    closeForm();
  };

  const handleCallNudge = (bill) => {
    openEdit(bill);
  };

  const applyTargetToAll = () => {
    setBills((prev) => applyTargetSavingsPercent(prev, targetPercent));
  };

  const resetAllToOriginal = () => {
    setBills((prev) => resetBillsToOriginalPrices(prev));
  };

  return (
    <>
      <BillSavingsBanner {...summary} />

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <h2 className="text-lg font-semibold text-slate-900">Target savings planner</h2>
        <p className="mt-1 text-sm text-slate-500">
          Apply a target discount to every bill to model your negotiation goal
        </p>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Target saving (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={targetPercent}
                onChange={(e) => setTargetPercent(Number(e.target.value))}
                className="mt-1 w-28 rounded-lg border border-slate-200 px-3 py-2.5 text-sm tabular-nums focus:border-refai-teal focus:outline-none focus:ring-2 focus:ring-refai-teal/20"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {TARGET_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTargetPercent(preset)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    targetPercent === preset
                      ? 'bg-refai-teal text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={applyTargetToAll}
              disabled={bills.length === 0 || targetPercent <= 0}
              className="rounded-xl bg-refai-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-refai-teal-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply {targetPercent}% to all bills
            </button>
            <button
              type="button"
              onClick={resetAllToOriginal}
              disabled={bills.length === 0 || summary.totalMonthlySaving <= 0}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset to original prices
            </button>
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-900 ring-1 ring-teal-200">
          At <span className="font-semibold">{targetPercent}%</span> off every bill you would
          save{' '}
          <span className="font-semibold tabular-nums">
            {formatAud(projectedMonthlySaving)}/mo
          </span>{' '}
          ({formatAud(projectedMonthlySaving * 12)}/yr). Applying updates each bill&apos;s
          negotiated price to your target rate.
        </p>
      </section>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Household bills</h2>
          <p className="mt-1 text-sm text-slate-500">
            {bills.length} bills tracked
            {overdueCount > 0 && (
              <span className="ml-2 font-medium text-red-600">
                · {overdueCount} overdue for renegotiation
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Sort by
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-refai-teal focus:outline-none focus:ring-2 focus:ring-refai-teal/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={openAdd}
            className="rounded-xl bg-refai-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-refai-teal-dark"
          >
            + Add Bill
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedBills.map((bill) => (
          <BillCard
            key={bill.id}
            bill={bill}
            onEdit={openEdit}
            onCallNudge={handleCallNudge}
          />
        ))}
      </div>

      <BillFormModal
        open={Boolean(formModal)}
        bill={formModal?.mode === 'edit' ? formModal.bill : null}
        onSave={handleSave}
        onClose={closeForm}
      />
    </>
  );
}
