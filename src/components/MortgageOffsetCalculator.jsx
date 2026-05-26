import { useMemo, useState } from 'react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { formatAud } from '../utils/format';

const DEFAULTS = {
  loanBalance: 600000,
  interestRate: 6.2,
  loanTermYears: 25,
};

function calculateOffset(monthlyRedirect, loanBalance, annualRate, termYears) {
  if (monthlyRedirect <= 0 || loanBalance <= 0 || annualRate <= 0 || termYears <= 0) {
    return {
      totalInterestSaved: 0,
      yearsSaved: 0,
      monthsSaved: 0,
      offsetBalanceYear1: 0,
      offsetBalanceYear5: 0,
    };
  }

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = termYears * 12;

  const repayment =
    (loanBalance * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const totalPaidWithout = repayment * totalMonths;
  const totalInterestWithout = totalPaidWithout - loanBalance;

  let balance = loanBalance;
  let offsetBalance = 0;
  let totalInterestWith = 0;
  let monthsToPayoff = totalMonths;

  for (let m = 1; m <= totalMonths; m++) {
    offsetBalance += monthlyRedirect;
    const effectiveBalance = Math.max(0, balance - offsetBalance);
    const interestThisMonth = effectiveBalance * monthlyRate;
    totalInterestWith += interestThisMonth;
    const principalPaid = repayment - interestThisMonth;

    if (principalPaid <= 0) continue;

    balance -= principalPaid;

    if (balance <= 0) {
      monthsToPayoff = m;
      break;
    }
  }

  const totalInterestSaved = Math.max(0, totalInterestWithout - totalInterestWith);
  const timeSavedMonths = Math.max(0, totalMonths - monthsToPayoff);

  return {
    totalInterestSaved,
    yearsSaved: Math.floor(timeSavedMonths / 12),
    monthsSaved: timeSavedMonths % 12,
    offsetBalanceYear1: monthlyRedirect * 12,
    offsetBalanceYear5: monthlyRedirect * 60,
  };
}

function StatCard({ label, value, sublabel, highlight = false }) {
  const animated = useAnimatedNumber(
    typeof value === 'number' ? value : 0,
    700,
  );
  const isNumber = typeof value === 'number';

  return (
    <div
      className={`rounded-xl p-4 ${
        highlight
          ? 'bg-emerald-600/20 ring-1 ring-emerald-400/30'
          : 'bg-white/10'
      }`}
    >
      <p className="text-sm text-teal-100">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-white sm:text-3xl">
        {isNumber ? formatAud(animated) : value}
      </p>
      {sublabel && <p className="mt-1 text-xs text-teal-200">{sublabel}</p>}
    </div>
  );
}

function SourceBar({ label, icon, amount, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-base">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-300">{label}</p>
          <p className={`text-sm font-semibold tabular-nums ${color}`}>
            {formatAud(amount)}/mo
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MortgageOffsetCalculator({
  totalMonthlySavings,
  subscriptionSavings,
  billNegotiationSavings,
}) {
  const [loanBalance, setLoanBalance] = useState(DEFAULTS.loanBalance);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [expanded, setExpanded] = useState(true);

  const result = useMemo(
    () => calculateOffset(totalMonthlySavings, loanBalance, interestRate, loanTermYears),
    [totalMonthlySavings, loanBalance, interestRate, loanTermYears],
  );

  const timeSavedLabel =
    result.yearsSaved > 0 || result.monthsSaved > 0
      ? `${result.yearsSaved > 0 ? `${result.yearsSaved} yr${result.yearsSaved !== 1 ? 's' : ''}` : ''}${result.yearsSaved > 0 && result.monthsSaved > 0 ? ' ' : ''}${result.monthsSaved > 0 ? `${result.monthsSaved} mo` : ''}`
      : '—';

  const animatedTotal = useAnimatedNumber(totalMonthlySavings);

  return (
    <section className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-teal-300">
            Mortgage offset calculator
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Combined savings from subscriptions &amp; bill negotiations
          </p>
        </div>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-slate-300 transition ${
            expanded ? 'rotate-180' : ''
          }`}
          aria-hidden
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="mt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-400">
                Loan balance ($)
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                value={loanBalance}
                onChange={(e) => setLoanBalance(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm tabular-nums text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">
                Interest rate (%)
              </span>
              <input
                type="number"
                min="0"
                max="15"
                step="0.05"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm tabular-nums text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">
                Loan term (years)
              </span>
              <input
                type="number"
                min="1"
                max="30"
                step="1"
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm tabular-nums text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </label>
          </div>

          {/* Savings breakdown by source */}
          <div className="mt-5 rounded-lg bg-teal-900/40 px-4 py-4 ring-1 ring-teal-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏠</span>
                <p className="text-sm font-medium text-teal-200">
                  Monthly redirect to offset account
                </p>
              </div>
              <p className="text-xl font-bold tabular-nums text-teal-300">
                {formatAud(animatedTotal)}/mo
              </p>
            </div>

            <div className="mt-3 space-y-2 border-t border-teal-700/40 pt-3">
              <SourceBar
                label="Paused subscriptions"
                icon="💳"
                amount={subscriptionSavings}
                color="text-amber-300"
              />
              <SourceBar
                label="Bill negotiations"
                icon="📋"
                amount={billNegotiationSavings}
                color="text-emerald-300"
              />
            </div>
          </div>

          {totalMonthlySavings > 0 ? (
            <>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Total interest saved"
                  value={result.totalInterestSaved}
                  sublabel="Over the life of your loan"
                  highlight
                />
                <div className="rounded-xl bg-emerald-600/20 p-4 ring-1 ring-emerald-400/30">
                  <p className="text-sm text-teal-100">Time saved on mortgage</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {timeSavedLabel}
                  </p>
                  <p className="mt-1 text-xs text-teal-200">Earlier payoff date</p>
                </div>
                <StatCard
                  label="Offset balance (1 yr)"
                  value={result.offsetBalanceYear1}
                  sublabel="Accumulated in 12 months"
                />
                <StatCard
                  label="Offset balance (5 yrs)"
                  value={result.offsetBalanceYear5}
                  sublabel="Accumulated in 5 years"
                />
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Assumes all savings are deposited monthly into an offset account linked to a
                principal &amp; interest home loan. Does not account for rate changes, fees, or tax.
              </p>
            </>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-slate-600 px-6 py-8 text-center">
              <p className="text-lg font-semibold text-slate-400">
                Pause subscriptions or negotiate bills to see the impact
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Every dollar you redirect into your mortgage offset account reduces
                the interest you pay — and shortens your loan.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
