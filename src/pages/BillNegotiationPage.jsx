import { useMemo, useState } from 'react';
import BillCard from '../components/BillCard';
import BillFormModal from '../components/BillFormModal';
import BillSavingsBanner from '../components/BillSavingsBanner';
import {
  getRenegotiationStatus,
  sortBills,
  summarizeBills,
} from '../utils/bills';
import { RENEGOTIATION_STATUS } from '../data/initialBills';

const SORT_OPTIONS = [
  { value: 'saving', label: 'Highest saving' },
  { value: 'date', label: 'Oldest negotiation first' },
  { value: 'category', label: 'Category' },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function BillNegotiationPage({ bills, setBills }) {
  const [sortBy, setSortBy] = useState('saving');
  const [formModal, setFormModal] = useState(null);

  const summary = useMemo(() => summarizeBills(bills), [bills]);
  const sortedBills = useMemo(() => sortBills(bills, sortBy), [bills, sortBy]);

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

  return (
    <>
      <BillSavingsBanner {...summary} />

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
