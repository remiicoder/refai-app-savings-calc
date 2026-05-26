export const BILL_CATEGORIES = {
  electricity: { label: 'Electricity', icon: '⚡', color: '#F59E0B' },
  internet: { label: 'Internet', icon: '🌐', color: '#3B82F6' },
  insurance: { label: 'Insurance', icon: '🛡️', color: '#6366F1' },
  mobile: { label: 'Mobile', icon: '📱', color: '#EC4899' },
  health: { label: 'Health', icon: '❤️', color: '#EF4444' },
  'home-loan': { label: 'Home loan', icon: '🏠', color: '#0D9488' },
  gym: { label: 'Gym', icon: '💪', color: '#8B5CF6' },
  other: { label: 'Other', icon: '📋', color: '#64748B' },
};

export const RENEGOTIATION_STATUS = {
  RECENT: 'recent',
  DUE_SOON: 'due_soon',
  OVERDUE: 'overdue',
};

function monthsAgoDate(months) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

export const initialBills = [
  {
    id: 'agl-electricity',
    name: 'Electricity (AGL)',
    category: 'electricity',
    originalPrice: 280,
    negotiatedPrice: 210,
    lastNegotiated: monthsAgoDate(8),
  },
  {
    id: 'telstra-nbn',
    name: 'Internet (Telstra NBN)',
    category: 'internet',
    originalPrice: 99,
    negotiatedPrice: 79,
    lastNegotiated: monthsAgoDate(14),
  },
  {
    id: 'nrma-car',
    name: 'Car Insurance (NRMA)',
    category: 'insurance',
    originalPrice: 180,
    negotiatedPrice: 145,
    lastNegotiated: monthsAgoDate(3),
  },
  {
    id: 'home-contents',
    name: 'Home & Contents Insurance',
    category: 'insurance',
    originalPrice: 160,
    negotiatedPrice: 130,
    lastNegotiated: monthsAgoDate(11),
  },
  {
    id: 'optus-mobile',
    name: 'Mobile Plan (Optus)',
    category: 'mobile',
    originalPrice: 65,
    negotiatedPrice: 49,
    lastNegotiated: monthsAgoDate(6),
  },
  {
    id: 'bupa-health',
    name: 'Health Insurance (Bupa)',
    category: 'health',
    originalPrice: 320,
    negotiatedPrice: 290,
    lastNegotiated: monthsAgoDate(18),
  },
  {
    id: 'cba-home-loan',
    name: 'Home Loan (CBA)',
    category: 'home-loan',
    originalPrice: 2800,
    negotiatedPrice: 2650,
    lastNegotiated: monthsAgoDate(2),
  },
  {
    id: 'gym',
    name: 'Gym Membership',
    category: 'gym',
    originalPrice: 79,
    negotiatedPrice: 59,
    lastNegotiated: monthsAgoDate(5),
  },
];
