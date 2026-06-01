import { useMemo, useState } from 'react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { formatAud } from '../utils/format';
import {
  simulateFrequency,
  simulateOffsetWithLumpSums,
  simulateWageFlush,
} from '../utils/mortgage';

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

const FREQ_LABELS = { monthly: 'Monthly', fortnightly: 'Fortnightly' };

export default function MortgageOffsetCalculator({
  totalMonthlySavings,
  subscriptionSavings,
  billNegotiationSavings,
  rateSavings = 0,
  paymentFrequency,
  weeklyWage = 0,
  wageFlushEnabled = false,
  lumpSums = [],
  loanBalance,
  setLoanBalance,
  interestRate,
  setInterestRate,
  loanTermYears,
  setLoanTermYears,
}) {
  const [expanded, setExpanded] = useState(true);

  const monthlyBaseline = useMemo(
    () =>
      simulateFrequency({
        loanBalance,
        annualRate: interestRate,
        termYears: loanTermYears,
        frequency: 'monthly',
        monthlyOffsetDeposit: 0,
      }),
    [loanBalance, interestRate, loanTermYears],
  );

  const withSavingsAndFreq = useMemo(
    () =>
      simulateFrequency({
        loanBalance,
        annualRate: interestRate,
        termYears: loanTermYears,
        frequency: paymentFrequency,
        monthlyOffsetDeposit: totalMonthlySavings,
      }),
    [loanBalance, interestRate, loanTermYears, paymentFrequency, totalMonthlySavings],
  );

  const wageFlushOnly = useMemo(() => {
    if (!wageFlushEnabled || weeklyWage <= 0) {
      return { totalInterestSaved: 0, timeSavedMonths: 0 };
    }
    const withoutWages = simulateWageFlush({
      loanBalance,
      annualRate: interestRate,
      termYears: loanTermYears,
      weeklyWage: 0,
      monthlyOffsetDeposit: totalMonthlySavings,
    });
    const withWages = simulateWageFlush({
      loanBalance,
      annualRate: interestRate,
      termYears: loanTermYears,
      weeklyWage,
      monthlyOffsetDeposit: totalMonthlySavings,
    });
    return {
      totalInterestSaved: Math.max(0, withoutWages.totalInterest - withWages.totalInterest),
      timeSavedMonths: Math.max(0, withoutWages.monthsToPayoff - withWages.monthsToPayoff),
    };
  }, [
    loanBalance,
    interestRate,
    loanTermYears,
    totalMonthlySavings,
    weeklyWage,
    wageFlushEnabled,
  ]);

  const hasLumpSums = lumpSums.some((l) => l?.amount > 0);

  const lumpSumImpact = useMemo(() => {
    if (!hasLumpSums) {
      return {
        totalInterestSaved: 0,
        timeSavedMonths: 0,
        offsetBalanceYear1: null,
        offsetBalanceYear5: null,
        totalDeposited: 0,
      };
    }
    const baseParams = {
      loanBalance,
      annualRate: interestRate,
      termYears: loanTermYears,
      monthlyOffsetDeposit: totalMonthlySavings,
    };
    const withoutLumps = simulateOffsetWithLumpSums({ ...baseParams, lumpSums: [] });
    const withLumps = simulateOffsetWithLumpSums({ ...baseParams, lumpSums });
    return {
      totalInterestSaved: Math.max(0, withoutLumps.totalInterest - withLumps.totalInterest),
      timeSavedMonths: Math.max(0, withoutLumps.monthsToPayoff - withLumps.monthsToPayoff),
      offsetBalanceYear1: withLumps.offsetBalanceYear1,
      offsetBalanceYear5: withLumps.offsetBalanceYear5,
      totalDeposited: withLumps.totalLumpSumsDeposited,
    };
  }, [loanBalance, interestRate, loanTermYears, totalMonthlySavings, lumpSums, hasLumpSums]);

  const freqInterestSaved = Math.max(
    0,
    monthlyBaseline.totalInterest - withSavingsAndFreq.totalInterest,
  );
  const freqTimeSavedMonths = Math.max(
    0,
    monthlyBaseline.monthsToPayoff - withSavingsAndFreq.monthsToPayoff,
  );

  const totalInterestSaved =
    freqInterestSaved + wageFlushOnly.totalInterestSaved + lumpSumImpact.totalInterestSaved;
  const timeSavedMonths =
    freqTimeSavedMonths + wageFlushOnly.timeSavedMonths + lumpSumImpact.timeSavedMonths;
  const yearsSaved = Math.floor(timeSavedMonths / 12);
  const monthsSaved = timeSavedMonths % 12;

  const timeSavedLabel =
    yearsSaved > 0 || monthsSaved > 0
      ? `${yearsSaved > 0 ? `${yearsSaved} yr${yearsSaved !== 1 ? 's' : ''}` : ''}${yearsSaved > 0 && monthsSaved > 0 ? ' ' : ''}${monthsSaved > 0 ? `${monthsSaved} mo` : ''}`
      : '—';

  const offsetBalanceYear1 =
    lumpSumImpact.offsetBalanceYear1 ?? totalMonthlySavings * 12;
  const offsetBalanceYear5 =
    lumpSumImpact.offsetBalanceYear5 ?? totalMonthlySavings * 60;

  const animatedTotal = useAnimatedNumber(totalMonthlySavings);
  const baselineInterest = monthlyBaseline.totalInterest;
  const netInterestPayable = Math.max(0, baselineInterest - totalInterestSaved);
  const animatedNetInterest = useAnimatedNumber(netInterestPayable, 700);
  const isFortnightly = paymentFrequency === 'fortnightly';
  const hasWageFlush = wageFlushEnabled && weeklyWage > 0;
  const showResults =
    totalMonthlySavings > 0 ||
    isFortnightly ||
    rateSavings > 0 ||
    hasWageFlush ||
    hasLumpSums;

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
            Combined savings from subscriptions, bills, lump sums &amp; more
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

          {loanBalance > 0 && interestRate > 0 && loanTermYears > 0 && (
            <div className="mt-5 rounded-lg bg-slate-700/50 px-4 py-4 ring-1 ring-slate-600">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">
                    Total interest payable
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {totalInterestSaved > 0 ? (
                      <>
                        <span className="line-through decoration-slate-500">
                          {formatAud(baselineInterest)}
                        </span>
                        {' · '}
                        <span className="text-emerald-400">
                          {formatAud(totalInterestSaved)} saved
                        </span>
                      </>
                    ) : (
                      <>Standard monthly P&amp;I over {loanTermYears} years, no offset</>
                    )}
                  </p>
                </div>
                <p
                  className={`text-3xl font-bold tabular-nums tracking-tight ${
                    totalInterestSaved > 0 ? 'text-emerald-300' : 'text-white'
                  }`}
                >
                  {formatAud(animatedNetInterest)}
                </p>
              </div>
            </div>
          )}

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
              {rateSavings > 0 && (
                <SourceBar
                  label="Rate refinance saving"
                  icon="📉"
                  amount={rateSavings}
                  color="text-violet-300"
                />
              )}
              {hasWageFlush && (
                <div className="flex items-center gap-3">
                  <span className="text-base">💰</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-300">Wage flush</p>
                      <p className="text-sm font-semibold tabular-nums text-sky-300">
                        {formatAud(weeklyWage)}/wk
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Saves {formatAud(wageFlushOnly.totalInterestSaved)} interest over loan
                    </p>
                  </div>
                </div>
              )}
              {hasLumpSums && (
                <div className="flex items-center gap-3">
                  <span className="text-base">💵</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-300">Lump sum deposits</p>
                      <p className="text-sm font-semibold tabular-nums text-amber-300">
                        {lumpSums.filter((l) => l.amount > 0).length} scheduled
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Saves {formatAud(lumpSumImpact.totalInterestSaved)} interest over loan
                      {lumpSumImpact.totalDeposited > 0 && (
                        <> · {formatAud(lumpSumImpact.totalDeposited)} total deposited</>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {isFortnightly && (
              <div className="mt-3 flex items-center gap-2 border-t border-teal-700/40 pt-3">
                <span className="text-base">🏦</span>
                <p className="text-sm text-slate-300">
                  Fortnightly payments
                </p>
                <span className="ml-auto rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-semibold text-violet-300 ring-1 ring-violet-400/30">
                  Active
                </span>
              </div>
            )}
          </div>

          {showResults ? (
            <>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Total interest saved"
                  value={totalInterestSaved}
                  sublabel={`vs standard monthly${isFortnightly ? ' (no offset)' : ''}`}
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
                  value={offsetBalanceYear1}
                  sublabel="Accumulated in 12 months"
                />
                <StatCard
                  label="Offset balance (5 yrs)"
                  value={offsetBalanceYear5}
                  sublabel="Accumulated in 5 years"
                />
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Compared against a standard monthly P&amp;I schedule with no offset.
                {isFortnightly
                  ? ' Includes the benefit of fortnightly repayments (26 half-payments = 13 monthly equivalents/yr).'
                  : ''}
                {hasWageFlush
                  ? ' Wage flush models weekly pay deposited into offset and withdrawn at month-end.'
                  : ''}
                {hasLumpSums
                  ? ' Lump sums follow your deposit schedule on top of monthly offset savings.'
                  : ''}{' '}
                Does not account for rate changes, fees, or tax.
              </p>
            </>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-slate-600 px-6 py-8 text-center">
              <p className="text-lg font-semibold text-slate-400">
                Pause subscriptions, negotiate bills, add lump sums, flush wages, compare rates, or switch to fortnightly
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
