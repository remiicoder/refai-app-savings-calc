import { useEffect, useMemo, useState } from 'react';
import AppLayout from './components/AppLayout';
import MortgageOffsetCalculator from './components/MortgageOffsetCalculator';
import BillNegotiationPage from './pages/BillNegotiationPage';
import InterestRatePage from './pages/InterestRatePage';
import LumpSumOffsetPage from './pages/LumpSumOffsetPage';
import PaymentFrequencyPage from './pages/PaymentFrequencyPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import { initialLumpSums } from './data/initialLumpSums';
import {
  STATUS,
  initialSubscriptions,
  LIFETIME_SAVINGS_KEY,
} from './data/initialSubscriptions';
import { initialBills } from './data/initialBills';
import { summarizeBills } from './utils/bills';
import { monthlyRepayment } from './utils/mortgage';

const MORTGAGE_DEFAULTS = {
  loanBalance: 600000,
  interestRate: 6.2,
  loanTermYears: 25,
};

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
  frequency: {
    title: 'Payment Frequency',
    subtitle: 'Monthly vs Fortnightly · AUD',
  },
  rates: {
    title: 'Rate Comparison',
    subtitle: 'See how a lower rate saves you · AUD',
  },
  lumpsums: {
    title: 'Tax & Savings Deposits',
    subtitle: 'Lump sums into your offset account · AUD',
  },
};

export default function App() {
  const [view, setView] = useState('subscriptions');
  const meta = VIEW_META[view];

  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [lifetimeSavings, setLifetimeSavings] = useState(loadLifetimeSavings);
  const [bills, setBills] = useState(initialBills);

  const [loanBalance, setLoanBalance] = useState(MORTGAGE_DEFAULTS.loanBalance);
  const [interestRate, setInterestRate] = useState(MORTGAGE_DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(MORTGAGE_DEFAULTS.loanTermYears);
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [comparisonRate, setComparisonRate] = useState(
    MORTGAGE_DEFAULTS.interestRate - 0.5,
  );
  const [rateSavingsApplied, setRateSavingsApplied] = useState(false);
  const [lumpSums, setLumpSums] = useState(initialLumpSums);

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

  const rateMonthlySavings = useMemo(() => {
    if (!rateSavingsApplied || comparisonRate >= interestRate) return 0;
    const current = monthlyRepayment(loanBalance, interestRate, loanTermYears);
    const lower = monthlyRepayment(loanBalance, comparisonRate, loanTermYears);
    return Math.max(0, current - lower);
  }, [rateSavingsApplied, comparisonRate, interestRate, loanBalance, loanTermYears]);

  const combinedMonthlySavings =
    subscriptionMonthlySavings + billSummary.totalMonthlySaving + rateMonthlySavings;

  const mortgageProps = {
    loanBalance,
    setLoanBalance,
    interestRate,
    setInterestRate,
    loanTermYears,
    setLoanTermYears,
  };

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
        rateSavings={rateMonthlySavings}
        paymentFrequency={paymentFrequency}
        {...mortgageProps}
      />

      <div className="mt-6">
        {view === 'subscriptions' && (
          <SubscriptionsPage
            subscriptions={subscriptions}
            setSubscriptions={setSubscriptions}
            lifetimeSavings={lifetimeSavings}
            setLifetimeSavings={setLifetimeSavings}
            subscriptionMonthlySavings={subscriptionMonthlySavings}
          />
        )}
        {view === 'bills' && (
          <BillNegotiationPage bills={bills} setBills={setBills} />
        )}
        {view === 'frequency' && (
          <PaymentFrequencyPage
            loanBalance={loanBalance}
            interestRate={interestRate}
            loanTermYears={loanTermYears}
            combinedMonthlySavings={combinedMonthlySavings}
            paymentFrequency={paymentFrequency}
            setPaymentFrequency={setPaymentFrequency}
          />
        )}
        {view === 'rates' && (
          <InterestRatePage
            loanBalance={loanBalance}
            interestRate={interestRate}
            loanTermYears={loanTermYears}
            paymentFrequency={paymentFrequency}
            combinedMonthlySavings={combinedMonthlySavings}
            comparisonRate={comparisonRate}
            setComparisonRate={setComparisonRate}
            rateSavingsApplied={rateSavingsApplied}
            setRateSavingsApplied={setRateSavingsApplied}
          />
        )}
        {view === 'lumpsums' && (
          <LumpSumOffsetPage
            loanBalance={loanBalance}
            interestRate={interestRate}
            loanTermYears={loanTermYears}
            combinedMonthlySavings={combinedMonthlySavings}
            lumpSums={lumpSums}
            setLumpSums={setLumpSums}
          />
        )}
      </div>
    </AppLayout>
  );
}
