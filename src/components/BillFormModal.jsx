import { useEffect, useState } from 'react';
import { BILL_CATEGORIES } from '../data/initialBills';

const emptyForm = {
  name: '',
  category: 'electricity',
  originalPrice: '',
  negotiatedPrice: '',
};

export default function BillFormModal({ open, bill, onSave, onClose }) {
  const isEdit = Boolean(bill);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;
    if (bill) {
      setForm({
        name: bill.name,
        category: bill.category,
        originalPrice: String(bill.originalPrice),
        negotiatedPrice: String(bill.negotiatedPrice),
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, bill]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const originalPrice = parseFloat(form.originalPrice);
    const negotiatedPrice = parseFloat(form.negotiatedPrice);
    if (!form.name.trim() || Number.isNaN(originalPrice) || Number.isNaN(negotiatedPrice)) {
      return;
    }
    onSave({
      name: form.name.trim(),
      category: form.category,
      originalPrice,
      negotiatedPrice,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bill-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <form
        onSubmit={handleSubmit}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="bill-form-title" className="text-lg font-semibold text-slate-900">
          {isEdit ? 'Update negotiated price' : 'Add a bill'}
        </h2>
        {isEdit && (
          <p className="mt-1 text-sm text-slate-500">
            Saving will reset &quot;last negotiated&quot; to today.
          </p>
        )}

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Bill name</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Electricity (Origin)"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm focus:border-refai-teal focus:outline-none focus:ring-2 focus:ring-refai-teal/20"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm focus:border-refai-teal focus:outline-none focus:ring-2 focus:ring-refai-teal/20"
            >
              {Object.entries(BILL_CATEGORIES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Original ($/mo)</span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.originalPrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, originalPrice: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 tabular-nums shadow-sm focus:border-refai-teal focus:outline-none focus:ring-2 focus:ring-refai-teal/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Negotiated ($/mo)</span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.negotiatedPrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, negotiatedPrice: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 tabular-nums shadow-sm focus:border-refai-teal focus:outline-none focus:ring-2 focus:ring-refai-teal/20"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-refai-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-refai-teal-dark"
          >
            {isEdit ? 'Save & update date' : 'Add bill'}
          </button>
        </div>
      </form>
    </div>
  );
}
