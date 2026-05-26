import { useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from './components/AppLayout';
import MortgageOffsetCalculator from './components/MortgageOffsetCalculator';
import BillNegotiationPage from './pages/BillNegotiationPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import {
  STATUS,
  initialSubscriptions,
  LIFETIME_SAVINGS_KEY,
} from './data/initialSubscriptions';
import { initialBills } from './data/initialBills';
import { summarizeBills } from './utils/bills';

function loadLifetimeSavings() {
  try {
    const raw = localStorage.getItem(LIFETIME_SAVINGS_KEY);
    return raw ? parseFloat(raw) : 0;
  } catch {
    return 0;
  }
}

const VIEW_META = {
  subscriptions: {
    title: 'Subscription Manager',
    subtitle: 'Manage streaming & subscriptions · AUD',
  },
  bills: {
    title: 'Bill Negotiation Tracker',
    subtitle: 'Track household bill savings · AUD',
  },
};

export default function App() {
  const [view, setView] = useState('subscriptions');
  const meta = VIEW_META[view];

  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [lifetimeSavings, setLifetimeSavings] = useState(loadLifetimeSavings);
  const [bills, setBills] = useState(initialBills);

  useEffect(() => {
    localStorage.setItem(LIFETIME_SAVINGS_KEY, String(lifetimeSavings));
  }, [lifetimeSavings]);

  const subscriptionMonthlySavings = useMemo(
    () =>
      subscriptions
        .filter((s) => s.status === STATUS.PAUSED || s.status === STATUS.CANCELLED)
        .reduce((sum, s) => sum + s.monthlyCost, 0),
    [subscriptions],
  );

  const billSummary = useMemo(() => summarizeBills(bills), [bills]);

  const combinedMonthlySavings =
    subscriptionMonthlySavings + billSummary.totalMonthlySaving;

  return (
    <AppLayout
      activeView={view}
      onNavigate={setView}
      title={meta.title}
      subtitle={meta.subtitle}
    >
      <MortgageOffsetCalculator
        totalMonthlySavings={combinedMonthlySavings}
        subscriptionSavings={subscriptionMonthlySavings}
        billNegotiationSavings={billSummary.totalMonthlySaving}
      />

      <div className="mt-6">
        {view === 'subscriptions' ? (
          <SubscriptionsPage
            subscriptions={subscriptions}
            setSubscriptions={setSubscriptions}
            lifetimeSavings={lifetimeSavings}
            setLifetimeSavings={setLifetimeSavings}
            subscriptionMonthlySavings={subscriptionMonthlySavings}
          />
        ) : (
          <BillNegotiationPage
            bills={bills}
            setBills={setBills}
          />
        )}
      </div>
    </AppLayout>
  );
}
