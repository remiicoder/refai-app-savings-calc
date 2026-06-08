import { useEffect, useMemo, useState } from 'react';
import AppLayout from './components/AppLayout';
import MortgageOffsetCalculator from './components/MortgageOffsetCalculator';
import BillNegotiationPage from './pages/BillNegotiationPage';
import InterestRatePage from './pages/InterestRatePage';
import LumpSumOffsetPage from './pages/LumpSumOffsetPage';
import PaymentFrequencyPage from './pages/PaymentFrequencyPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import WagesPage from './pages/WagesPage';
import AdvancedPage from './pages/AdvancedPage';
import {
  STATUS,
  initialSubscriptions,
  LIFETIME_SAVINGS_KEY,
} from './data/initialSubscriptions';
import { getFreshBills } from './data/initialBills';
import { summarizeBills } from './utils/bills';
import { monthlyRepayment } from './utils/mortgage';

const MORTGAGE_DEFAULTS = {
  loanBalance: 800000,
  interestRate: 6.5,
  loanTermYears: 30,
};

function createDefaultSubscriptions() {
  return structuredClone(initialSubscriptions).map((s) => ({
    ...s,
    status: STATUS.ACTIVE,
  }));
}

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
  wages: {
    title: 'Wage Offset Flushing',
    subtitle: 'Salary crediting through your offset · AUD',
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
  advanced: {
    title: 'Advanced',
    subtitle: 'See if you qualify · confidential strategy preview',
  },
};

export default function App() {
  const [view, setView] = useState('subscriptions');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [scenarioKey, setScenarioKey] = useState(0);
  const meta = VIEW_META[view];

  const [subscriptions, setSubscriptions] = useState(createDefaultSubscriptions);
  const [lifetimeSavings, setLifetimeSavings] = useState(loadLifetimeSavings);
  const [bills, setBills] = useState(() => structuredClone(getFreshBills()));

  const [loanBalance, setLoanBalance] = useState(MORTGAGE_DEFAULTS.loanBalance);
  const [interestRate, setInterestRate] = useState(MORTGAGE_DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(MORTGAGE_DEFAULTS.loanTermYears);
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [comparisonRate, setComparisonRate] = useState(
    MORTGAGE_DEFAULTS.interestRate - 0.5,
  );
  const [rateSavingsApplied, setRateSavingsApplied] = useState(false);
  const [lumpSums, setLumpSums] = useState([]);
  const [weeklyWage, setWeeklyWage] = useState(0);
  const [wageFlushEnabled, setWageFlushEnabled] = useState(false);

  useEffect(() => {
    localStorage.setItem(LIFETIME_SAVINGS_KEY, String(lifetimeSavings));
  }, [lifetimeSavings]);

  function resetAllSavings() {
    setSubscriptions(createDefaultSubscriptions());
    setLifetimeSavings(0);
    localStorage.setItem(LIFETIME_SAVINGS_KEY, '0');
    setBills(structuredClone(getFreshBills()));
    setLoanBalance(MORTGAGE_DEFAULTS.loanBalance);
    setInterestRate(MORTGAGE_DEFAULTS.interestRate);
    setLoanTermYears(MORTGAGE_DEFAULTS.loanTermYears);
    setPaymentFrequency('monthly');
    setComparisonRate(MORTGAGE_DEFAULTS.interestRate - 0.5);
    setRateSavingsApplied(false);
    setLumpSums([]);
    setWeeklyWage(0);
    setWageFlushEnabled(false);
    setScenarioKey((k) => k + 1);
    setView('subscriptions');
    setResetConfirmOpen(false);
  }

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
      onResetClick={() => setResetConfirmOpen(true)}
    >
      <MortgageOffsetCalculator
        totalMonthlySavings={combinedMonthlySavings}
        subscriptionSavings={subscriptionMonthlySavings}
        billNegotiationSavings={billSummary.totalMonthlySaving}
        rateSavings={rateMonthlySavings}
        paymentFrequency={paymentFrequency}
        weeklyWage={weeklyWage}
        wageFlushEnabled={wageFlushEnabled}
        lumpSums={lumpSums}
        {...mortgageProps}
      />

      <div className="mt-6" key={scenarioKey}>
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
        {view === 'wages' && (
          <WagesPage
            loanBalance={loanBalance}
            interestRate={interestRate}
            loanTermYears={loanTermYears}
            combinedMonthlySavings={combinedMonthlySavings}
            weeklyWage={weeklyWage}
            setWeeklyWage={setWeeklyWage}
            wageFlushEnabled={wageFlushEnabled}
            setWageFlushEnabled={setWageFlushEnabled}
          />
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
        {view === 'advanced' && (
          <AdvancedPage
            loanBalance={loanBalance}
            interestRate={interestRate}
            loanTermYears={loanTermYears}
          />
        )}
      </div>

      {resetConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setResetConfirmOpen(false)}
            aria-label="Close modal"
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="reset-modal-title" className="text-lg font-semibold text-slate-900">
              Start a new scenario?
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              This clears all savings, reactivates subscriptions, resets bills and lump sums,
              and restores mortgage settings. Interest saved will return to $0.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={resetAllSavings}
                className="rounded-xl bg-refai-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-refai-teal-dark"
              >
                Reset all savings
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
