import { RENEGOTIATION_STATUS } from '../data/initialBills';

export function monthlySaving(bill) {
  return Math.max(0, bill.originalPrice - bill.negotiatedPrice);
}

export function monthsSinceNegotiation(isoDate) {
  const then = new Date(isoDate);
  const now = new Date();
  let months =
    (now.getFullYear() - then.getFullYear()) * 12 +
    (now.getMonth() - then.getMonth());
  if (now.getDate() < then.getDate()) months -= 1;
  return Math.max(0, months);
}

export function getRenegotiationStatus(isoDate) {
  const months = monthsSinceNegotiation(isoDate);
  if (months >= 12) return RENEGOTIATION_STATUS.OVERDUE;
  if (months >= 6) return RENEGOTIATION_STATUS.DUE_SOON;
  return RENEGOTIATION_STATUS.RECENT;
}

export function renegotiationLabel(status, months) {
  if (status === RENEGOTIATION_STATUS.OVERDUE) {
    return `Last negotiated ${months} months ago — time to call!`;
  }
  if (status === RENEGOTIATION_STATUS.DUE_SOON) {
    return `Last negotiated ${months} months ago — due soon`;
  }
  return `Negotiated ${months} month${months === 1 ? '' : 's'} ago`;
}

export const renegotiationStyles = {
  [RENEGOTIATION_STATUS.RECENT]: {
    badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Up to date',
  },
  [RENEGOTIATION_STATUS.DUE_SOON]: {
    badge: 'bg-amber-100 text-amber-800 ring-amber-200',
    dot: 'bg-amber-500',
    label: 'Due soon',
  },
  [RENEGOTIATION_STATUS.OVERDUE]: {
    badge: 'bg-red-100 text-red-800 ring-red-200',
    dot: 'bg-red-500',
    label: 'Overdue',
  },
};

export function sortBills(bills, sortBy) {
  const sorted = [...bills];
  switch (sortBy) {
    case 'saving':
      return sorted.sort((a, b) => monthlySaving(b) - monthlySaving(a));
    case 'date':
      return sorted.sort(
        (a, b) =>
          new Date(a.lastNegotiated).getTime() -
          new Date(b.lastNegotiated).getTime(),
      );
    case 'category':
      return sorted.sort((a, b) => a.category.localeCompare(b.category));
    default:
      return sorted;
  }
}

export function summarizeBills(bills) {
  const totalOriginal = bills.reduce((s, b) => s + b.originalPrice, 0);
  const totalNegotiated = bills.reduce((s, b) => s + b.negotiatedPrice, 0);
  const totalMonthlySaving = totalOriginal - totalNegotiated;
  return {
    totalOriginal,
    totalNegotiated,
    totalMonthlySaving,
    totalAnnualSaving: totalMonthlySaving * 12,
  };
}
