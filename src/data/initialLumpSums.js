export const LUMP_SUM_TYPES = {
  TAX_RETURN: 'tax_return',
  SAVINGS: 'savings_lump',
};

export const LUMP_SUM_TYPE_LABELS = {
  [LUMP_SUM_TYPES.TAX_RETURN]: 'Tax return',
  [LUMP_SUM_TYPES.SAVINGS]: 'Savings lump sum',
};

export const LUMP_SUM_TYPE_ICONS = {
  [LUMP_SUM_TYPES.TAX_RETURN]: '🧾',
  [LUMP_SUM_TYPES.SAVINGS]: '💰',
};

export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const initialLumpSums = [
  {
    id: 'lump-tax-1',
    label: 'Annual tax return',
    type: LUMP_SUM_TYPES.TAX_RETURN,
    amount: 3500,
    month: 7,
    recurring: true,
  },
  {
    id: 'lump-savings-1',
    label: 'Emergency fund deposit',
    type: LUMP_SUM_TYPES.SAVINGS,
    amount: 8000,
    month: 1,
    recurring: false,
  },
];
