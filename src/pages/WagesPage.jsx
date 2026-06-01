import { useMemo } from 'react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { formatAud } from '../utils/format';
import { simulateWageFlush } from '../utils/mortgage';

function formatTimeDiff(months) {
  if (months <= 0) return '—';
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y > 0) parts.push(`${y} yr${y !== 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} mo`);
  return parts.join(' ');
}

export default function WagesPage({
  loanBalance,
  interestRate,
  loanTermYears,
  combinedMonthlySavings,
  weeklyWage,
  setWeeklyWage,
  wageFlushEnabled,
  setWageFlushEnabled,
}) {
  const simulation = useMemo(() => {
    const baseParams = {
      loanBalance,
      annualRate: interestRate,
      termYears: loanTermYears,
      monthlyOffsetDeposit: combinedMonthlySavings,
    };

    const withoutWages = simulateWageFlush({ ...baseParams, weeklyWage: 0 });
    const withWages = simulateWageFlush({
      ...baseParams,
      weeklyWage: wageFlushEnabled ? weeklyWage : 0,
    });

    const wageInterestSaved = Math.max(
      0,
      withoutWages.totalInterest - withWages.totalInterest,
    );
    const timeSavedMonths = Math.max(
      0,
      withoutWages.monthsToPayoff - withWages.monthsToPayoff,
    );

    return {
      withoutWages,
      withWages,
      wageInterestSaved,
      timeSavedMonths,
    };
  }, [
    loanBalance,
    interestRate,
    loanTermYears,
    combinedMonthlySavings,
    weeklyWage,
    wageFlushEnabled,
  ]);

  const monthlyTakeHome = weeklyWage * 52 / 12;

  return (
    <>
      {wageFlushEnabled && weeklyWage > 0 && (
        <section className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-6 text-white shadow-lg">
          <h2 className="text-sm font-medium uppercase tracking-wider text-teal-100">
            Interest saved from wage flushing
          </h2>
          <p className="mt-1 text-sm text-teal-100/90">
            {formatAud(weeklyWage)}/wk parked in offset during the month, withdrawn at
            month-end — on top of{' '}
            {combinedMonthlySavings > 0
              ? `${formatAud(combinedMonthlySavings)}/mo from other savings`
              : 'your standard repayments'}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ResultStat
              label="Interest saved from wages"
              value={simulation.wageInterestSaved}
              highlight
            />
            <ResultStat
              label="Time saved on loan"
              value={formatTimeDiff(simulation.timeSavedMonths)}
              isText
            />
            <ResultStat
              label="Peak offset (mid-month)"
              value={simulation.withWages.peakWageOffset}
              sublabel="Highest balance before month-end withdrawal"
            />
            <ResultStat
              label="Avg wage offset"
              value={simulation.withWages.avgWageOffsetInMonth}
              sublabel="Average flushed balance each month"
            />
          </div>
        </section>
      )}

      <section
        className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80${
          wageFlushEnabled && weeklyWage > 0 ? ' mt-8' : ''
        }`}
      >
        <h2 className="text-lg font-semibold text-slate-900">Weekly take-home pay</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your net weekly wage — the amount that lands in your account each pay
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Net weekly wage (AUD)</span>
            <input
              type="number"
              min="0"
              step="50"
              value={weeklyWage}
              onChange={(e) => setWeeklyWage(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm tabular-nums focus:border-refai-teal focus:outline-none focus:ring-2 focus:ring-refai-teal/20"
            />
          </label>
          <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200/60">
            <p className="text-sm text-slate-500">Approx. monthly take-home</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
              {formatAud(monthlyTakeHome)}
            </p>
            <p className="mt-1 text-xs text-slate-400">52 weeks ÷ 12 months</p>
          </div>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-teal-50 px-4 py-4 ring-1 ring-teal-200">
          <input
            type="checkbox"
            checked={wageFlushEnabled}
            onChange={(e) => setWageFlushEnabled(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-refai-teal focus:ring-refai-teal"
          />
          <span>
            <span className="block text-sm font-semibold text-teal-900">
              Include wage flushing in mortgage calculations
            </span>
            <span className="mt-1 block text-sm text-teal-800/80">
              Models depositing your weekly pay into offset, withdrawing it at month-end,
              and repeating each month for the loan term
            </span>
          </span>
        </label>
      </section>

      {wageFlushEnabled && weeklyWage > 0 ? (
        <>
          <section className="mt-8 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200/60">
            <h3 className="font-semibold text-slate-900">How wage flushing works</h3>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              <ExplainerCard
                step="1"
                title="Weekly deposit"
                desc="Each week your net pay is credited to your offset account, immediately reducing the balance used to calculate daily interest."
              />
              <ExplainerCard
                step="2"
                title="Spend from offset"
                desc="You pay bills and living costs from the same account during the month — your wages stay working against the mortgage the whole time."
              />
              <ExplainerCard
                step="3"
                title="Month-end reset"
                desc="At the end of each month the wage portion is withdrawn (e.g. to a transaction account), then the cycle repeats for the loan term."
              />
            </div>
            <p className="mt-5 text-xs text-slate-500">
              Assumes weekly pay every 7 days, month-end withdrawal of all wage deposits,
              and standard monthly P&amp;I repayments. Does not account for rate changes,
              fees, tax, or months with an extra pay week.
            </p>
          </section>
        </>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <p className="font-medium text-slate-600">
            {weeklyWage <= 0
              ? 'Enter your weekly wage above to see savings'
              : 'Enable wage flushing to include it in your calculations'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Even wages you spend each month can cut interest while they sit in offset.
          </p>
        </div>
      )}
    </>
  );
}

function ResultStat({ label, value, sublabel, highlight = false, isText = false }) {
  const animated = useAnimatedNumber(typeof value === 'number' ? value : 0, 700);

  return (
    <div
      className={`rounded-xl p-4 ${
        highlight ? 'bg-white/20 ring-1 ring-white/30' : 'bg-white/10'
      }`}
    >
      <p className="text-sm text-teal-100">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-white">
        {isText ? value : formatAud(animated)}
      </p>
      {sublabel && <p className="mt-1 text-xs text-teal-100/80">{sublabel}</p>}
    </div>
  );
}

function ExplainerCard({ step, title, desc }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-refai-teal text-xs font-bold text-white">
        {step}
      </span>
      <div>
        <p className="font-medium text-slate-800">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
    </div>
  );
}
