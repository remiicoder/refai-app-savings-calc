import { useMemo } from 'react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { formatAud } from '../utils/format';
import { simulateFrequency } from '../utils/mortgage';

const FREQUENCIES = [
  { key: 'monthly', label: 'Monthly', icon: '📅', periods: '12 payments / yr' },
  { key: 'fortnightly', label: 'Fortnightly', icon: '🗓️', periods: '26 payments / yr' },
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

function AnimatedAud({ value, className = '' }) {
  const animated = useAnimatedNumber(value, 700);
  return <span className={className}>{formatAud(animated)}</span>;
}

function FrequencyCard({ freq, result, monthlyResult, isBaseline, isSelected, onSelect }) {
  const interestSaved = Math.max(0, monthlyResult.totalInterest - result.totalInterest);
  const timeSavedMonths = Math.max(0, monthlyResult.monthsToPayoff - result.monthsToPayoff);

  return (
    <div
      className={`relative rounded-2xl p-5 shadow-sm transition ${
        isSelected
          ? 'bg-gradient-to-br from-teal-50 to-emerald-50 ring-2 ring-teal-400'
          : isBaseline
            ? 'bg-white ring-1 ring-slate-200'
            : 'bg-gradient-to-br from-teal-50 to-emerald-50 ring-1 ring-teal-200'
      }`}
    >
      {!isBaseline && interestSaved > 0 && (
        <span className="absolute -top-3 right-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow">
          Save {formatAud(interestSaved)}
        </span>
      )}

      <div className="flex items-center gap-3">
        <span className="text-2xl">{freq.icon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-slate-900">{freq.label}</h3>
          <p className="text-xs text-slate-500">{freq.periods}</p>
        </div>
        {isSelected && (
          <span className="rounded-full bg-teal-500 px-2.5 py-0.5 text-xs font-bold text-white">
            Active
          </span>
        )}
      </div>

      <div className="mt-5 space-y-3">
        <Row label="Payment amount" bold>
          <AnimatedAud value={result.paymentAmount} className="text-lg font-bold tabular-nums text-slate-900" />
        </Row>
        <Divider />
        <Row label="Total interest">
          <AnimatedAud value={result.totalInterest} className="tabular-nums text-slate-700" />
        </Row>
        <Row label="Total repaid">
          <AnimatedAud value={result.totalPaid} className="tabular-nums text-slate-700" />
        </Row>
        <Divider />
        <Row label="Loan paid off in">
          <span className="font-semibold tabular-nums text-slate-900">
            {formatTimeDiff(result.monthsToPayoff)}
          </span>
        </Row>

        {!isBaseline && (
          <>
            <Divider />
            <Row label="Interest saved vs monthly" highlight>
              <AnimatedAud
                value={interestSaved}
                className="font-bold tabular-nums text-emerald-600"
              />
            </Row>
            <Row label="Time saved vs monthly" highlight>
              <span className="font-bold text-emerald-600">
                {timeSavedMonths > 0 ? formatTimeDiff(timeSavedMonths) : '—'}
              </span>
            </Row>
          </>
        )}
      </div>

      {/* Selection button */}
      <div className="mt-5">
        {isSelected ? (
          <button
            type="button"
            onClick={() => onSelect('monthly')}
            className="w-full rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-300"
          >
            Switch back to monthly
          </button>
        ) : !isBaseline ? (
          <button
            type="button"
            onClick={() => onSelect(freq.key)}
            className="w-full rounded-xl bg-refai-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-refai-teal-dark"
          >
            Select fortnightly
          </button>
        ) : (
          <button
            type="button"
            disabled={!isSelected && freq.key === 'monthly'}
            className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-400 cursor-default"
          >
            {isSelected ? 'Currently selected' : 'Default schedule'}
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, children, bold, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <p
        className={`text-sm ${
          highlight ? 'font-medium text-emerald-700' : 'text-slate-500'
        }`}
      >
        {label}
      </p>
      <div className={bold ? 'text-lg' : 'text-sm'}>{children}</div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-slate-100" />;
}

export default function PaymentFrequencyPage({
  loanBalance,
  interestRate,
  loanTermYears,
  combinedMonthlySavings,
  paymentFrequency,
  setPaymentFrequency,
}) {
  const results = useMemo(() => {
    const map = {};
    for (const freq of FREQUENCIES) {
      map[freq.key] = simulateFrequency({
        loanBalance,
        annualRate: interestRate,
        termYears: loanTermYears,
        frequency: freq.key,
        monthlyOffsetDeposit: combinedMonthlySavings,
      });
    }
    return map;
  }, [loanBalance, interestRate, loanTermYears, combinedMonthlySavings]);

  return (
    <>
      {/* Frequency cards */}
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Side-by-side comparison</h2>
            <p className="mt-1 text-sm text-slate-500">
              All scenarios use your current mortgage settings
              {combinedMonthlySavings > 0
                ? ` plus ${formatAud(combinedMonthlySavings)}/mo offset deposits`
                : ''}
            </p>
          </div>
          {paymentFrequency === 'fortnightly' && (
            <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              Fortnightly applied to offset calculator
            </span>
          )}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {FREQUENCIES.map((freq) => (
            <FrequencyCard
              key={freq.key}
              freq={freq}
              result={results[freq.key]}
              monthlyResult={results.monthly}
              isBaseline={freq.key === 'monthly'}
              isSelected={paymentFrequency === freq.key && freq.key !== 'monthly'}
              onSelect={setPaymentFrequency}
            />
          ))}
        </div>
      </div>

      {/* Explainer */}
      <section className="mt-8 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200/60">
        <h3 className="font-semibold text-slate-900">How does this work?</h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <ExplainerCard
            step="1"
            title="Monthly (standard)"
            desc="12 payments per year. This is the default repayment schedule most lenders set up."
          />
          <ExplainerCard
            step="2"
            title="Fortnightly"
            desc="Your monthly payment ÷ 2, paid every two weeks. 26 fortnightly payments = 13 monthly equivalents per year — one extra payment goes straight to principal."
          />
        </div>
        <p className="mt-5 text-xs text-slate-500">
          The extra equivalent monthly payment each year goes straight to principal, reducing
          interest over the loan&apos;s life. Combined with offset savings, this can
          dramatically shorten your loan term. Select fortnightly above to see the combined
          effect in the Mortgage Offset Calculator at the top of every page.
        </p>
      </section>
    </>
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
