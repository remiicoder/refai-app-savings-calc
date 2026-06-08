import { useEffect, useMemo, useState } from 'react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { formatAud } from '../utils/format';
import { simulateEquityRecyclingStrategy } from '../utils/mortgage';

const TEASER_INVESTMENT_PRICE = 800000;
const TEASER_GROWTH_PERCENT = 4;
const BOOKING_URL = 'https://refai.app';

const APPLY_STEPS = [
  'Scanning equity recycling pathways…',
  'Modelling investment property growth…',
  'Recycling capital into your home loan…',
  'Calculating accelerated payoff…',
];

function formatTimeDiff(months) {
  if (months <= 0) return '—';
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y > 0) parts.push(`${y} yr${y !== 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} mo`);
  return parts.join(' ');
}

function TeaserStat({
  label,
  value,
  sublabel,
  highlight = false,
  isText = false,
  delayMs = 0,
}) {
  const animated = useAnimatedNumber(typeof value === 'number' ? value : 0, 900);

  return (
    <div
      className={`animate-fade-in-up rounded-xl p-5 ${
        highlight ? 'bg-white/20 ring-1 ring-white/30' : 'bg-white/10'
      }`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <p className="text-sm text-teal-100">{label}</p>
      <p
        className={`mt-2 text-3xl font-bold tabular-nums tracking-tight text-white sm:text-4xl ${
          highlight ? 'animate-pulse-once' : ''
        }`}
      >
        {isText ? value : formatAud(animated)}
      </p>
      {sublabel && <p className="mt-1 text-xs text-teal-100/80">{sublabel}</p>}
    </div>
  );
}

export default function AdvancedPage({ loanBalance, interestRate, loanTermYears }) {
  const [phase, setPhase] = useState('idle');
  const [applyStep, setApplyStep] = useState(0);

  const simulation = useMemo(
    () =>
      simulateEquityRecyclingStrategy({
        loanBalance,
        annualRate: interestRate,
        termYears: loanTermYears,
        investmentPurchasePrice: TEASER_INVESTMENT_PRICE,
        annualGrowthPercent: TEASER_GROWTH_PERCENT,
      }),
    [loanBalance, interestRate, loanTermYears],
  );

  const payoffLabel = formatTimeDiff(simulation.monthsToPayoff);
  const baselineLabel = formatTimeDiff(simulation.baselineMonths);
  const savedLabel = formatTimeDiff(simulation.timeSavedMonths);

  useEffect(() => {
    setPhase('idle');
    setApplyStep(0);
  }, [loanBalance, interestRate, loanTermYears]);

  useEffect(() => {
    if (phase !== 'applying') return undefined;

    const stepDuration = 750;
    const timers = APPLY_STEPS.map((_, i) =>
      setTimeout(() => setApplyStep(i), i * stepDuration),
    );
    const finishTimer = setTimeout(() => setPhase('revealed'), APPLY_STEPS.length * stepDuration);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finishTimer);
    };
  }, [phase]);

  const handleApply = () => {
    if (phase === 'applying') return;
    setApplyStep(0);
    setPhase('applying');
  };

  const revealed = phase === 'revealed';
  const applying = phase === 'applying';

  return (
    <div className="relative">
      <section className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden>
            {revealed ? '✨' : '🔒'}
          </span>
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-teal-300">
              {revealed ? 'Strategy results' : 'Advanced strategy simulator'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {revealed
                ? 'Preview based on your mortgage — full playbook available with a strategist'
                : 'Press the button to see what advanced strategies could do to your loan'}
            </p>
          </div>
        </div>

        {!revealed && !applying && (
          <div className="mt-8 flex flex-col items-center text-center">
            <p className="max-w-md text-lg text-slate-300">
              You&apos;re on track for a{' '}
              <span className="font-semibold text-white">{baselineLabel}</span> payoff.
              <br />
              <span className="text-teal-300">What if advanced strategies changed that?</span>
            </p>
            <button
              type="button"
              onClick={handleApply}
              className="group mt-8 inline-flex items-center gap-3 rounded-2xl bg-refai-teal px-8 py-4 text-base font-bold text-white shadow-lg shadow-teal-900/40 transition hover:scale-[1.02] hover:bg-refai-teal-dark active:scale-[0.98]"
            >
              <span className="text-xl transition group-hover:rotate-12" aria-hidden>
                ⚡
              </span>
              Apply advanced strategies
            </button>
            <p className="mt-4 text-xs text-slate-500">Illustrative simulation · not financial advice</p>
          </div>
        )}

        {applying && (
          <div className="mt-8 flex flex-col items-center text-center">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-teal-900 border-t-teal-400" />
              <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-teal-300 [animation-direction:reverse] [animation-duration:1.2s]" />
            </div>
            <p className="mt-6 text-sm font-medium text-teal-200 transition-opacity duration-300">
              {APPLY_STEPS[applyStep]}
            </p>
            <div className="mt-4 flex gap-2">
              {APPLY_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                    i <= applyStep ? 'bg-teal-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {revealed && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TeaserStat
              label="Payoff with strategy"
              value={payoffLabel}
              isText
              highlight
              delayMs={0}
            />
            <TeaserStat
              label="Standard payoff (no strategy)"
              value={baselineLabel}
              isText
              delayMs={120}
            />
            <TeaserStat
              label="Time saved"
              value={savedLabel}
              isText
              delayMs={240}
            />
            <TeaserStat
              label="Interest saved"
              value={simulation.interestSaved}
              sublabel="vs standard schedule"
              delayMs={360}
            />
          </div>
        )}

        {revealed && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => setPhase('idle')}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-teal-100 transition hover:bg-white/10"
            >
              Run again
            </button>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25"
            >
              See If You Qualify (for advanced strategies) →
            </a>
          </div>
        )}
      </section>

      <div className="relative mt-8 min-h-[28rem] overflow-hidden rounded-2xl ring-1 ring-slate-200/80">
        <div className="select-none blur-[5px] saturate-50" aria-hidden>
          <section className="bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Investment property scenario</h2>
            <p className="mt-1 text-sm text-slate-500">Confidential strategy parameters</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Purchase price', value: formatAud(TEASER_INVESTMENT_PRICE) },
                { label: 'Annual growth', value: `${TEASER_GROWTH_PERCENT}%` },
                { label: 'Equity release', value: 'Year-end' },
                { label: 'Recycled to', value: 'Home loan' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-slate-50 px-4 py-5 ring-1 ring-slate-200/80">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-2 text-xl font-bold tabular-nums text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-slate-100 bg-white p-6">
            <h3 className="font-semibold text-slate-900">Year-by-year projection</h3>
            <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-slate-200/80">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Year</th>
                    <th className="px-4 py-3 font-medium">Property value</th>
                    <th className="px-4 py-3 font-medium">Equity released</th>
                    <th className="px-4 py-3 font-medium">Home loan balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {simulation.yearlySchedule.slice(0, 12).map((row) => (
                    <tr key={row.year} className="tabular-nums text-slate-700">
                      <td className="px-4 py-2.5 font-medium">{row.year}</td>
                      <td className="px-4 py-2.5">{formatAud(row.propertyValueEnd)}</td>
                      <td className="px-4 py-2.5 text-teal-700">{formatAud(row.equityApplied)}</td>
                      <td className="px-4 py-2.5">{formatAud(row.homeLoanBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border-t border-slate-100 bg-slate-50 p-6">
            <h3 className="font-semibold text-slate-900">How the strategy works</h3>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
              <p>
                Acquire an investment property and hold for capital growth. Each year, newly created
                equity is released and applied as a lump sum against your owner-occupier home loan.
              </p>
              <p>
                Compounding property growth accelerates equity availability while your home loan
                balance falls faster than standard repayments alone — reducing total interest and
                shortening the payoff timeline significantly.
              </p>
              <p>
                Total equity applied: {formatAud(simulation.totalEquityApplied)} · Final property
                value: {formatAud(simulation.finalPropertyValue)} · Payoff in{' '}
                {formatTimeDiff(simulation.monthsToPayoff)}.
              </p>
            </div>
          </section>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-white/15 to-white/25" />

        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="pointer-events-auto max-w-md rounded-2xl bg-white/95 p-8 text-center shadow-xl ring-1 ring-slate-200/80 backdrop-blur-sm">
            <span className="text-3xl" aria-hidden>
              🔐
            </span>
            <h3 className="mt-4 text-xl font-bold text-slate-900">Unlock the full strategy</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {revealed
                ? 'You’ve seen the headline numbers — the complete playbook stays confidential. Sit down with a qualified, experienced strategist to review the model tailored to your situation.'
                : 'This is a confidential approach we cannot share online. We are not licensed financial planners — sit down with a qualified, experienced strategist to review the complete model tailored to your situation.'}
            </p>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-refai-teal px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-refai-teal-dark"
            >
              See If You Qualify (for advanced strategies)
            </a>
            <p className="mt-4 text-xs text-slate-400">
              Illustrative preview only. Not financial advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
