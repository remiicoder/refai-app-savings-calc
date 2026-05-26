import { useMemo } from 'react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { formatAud } from '../utils/format';
import { simulateFrequency, monthlyRepayment } from '../utils/mortgage';

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

function RateCard({ title, rate, repayment, totalInterest, totalPaid, monthsToPayoff, badge, accent }) {
  return (
    <div className={`relative rounded-2xl p-5 shadow-sm ring-1 ${accent ? 'bg-gradient-to-br from-teal-50 to-emerald-50 ring-teal-200' : 'bg-white ring-slate-200'}`}>
      {badge && (
        <span className="absolute -top-3 right-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{accent ? '✨' : '📊'}</span>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{rate.toFixed(2)}% p.a.</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <Row label="Monthly repayment" bold>
          <AnimatedAud value={repayment} className="text-lg font-bold tabular-nums text-slate-900" />
        </Row>
        <Divider />
        <Row label="Total interest">
          <AnimatedAud value={totalInterest} className="tabular-nums text-slate-700" />
        </Row>
        <Row label="Total repaid">
          <AnimatedAud value={totalPaid} className="tabular-nums text-slate-700" />
        </Row>
        <Divider />
        <Row label="Loan paid off in">
          <span className="font-semibold tabular-nums text-slate-900">
            {formatTimeDiff(monthsToPayoff)}
          </span>
        </Row>
      </div>
    </div>
  );
}

export default function InterestRatePage({
  loanBalance,
  interestRate,
  loanTermYears,
  paymentFrequency,
  combinedMonthlySavings,
  comparisonRate,
  setComparisonRate,
  rateSavingsApplied,
  setRateSavingsApplied,
}) {
  const currentRepayment = monthlyRepayment(loanBalance, interestRate, loanTermYears);
  const newRepayment = monthlyRepayment(loanBalance, comparisonRate, loanTermYears);
  const repaymentDiff = Math.max(0, currentRepayment - newRepayment);

  const currentResult = useMemo(
    () =>
      simulateFrequency({
        loanBalance,
        annualRate: interestRate,
        termYears: loanTermYears,
        frequency: paymentFrequency,
        monthlyOffsetDeposit: combinedMonthlySavings,
      }),
    [loanBalance, interestRate, loanTermYears, paymentFrequency, combinedMonthlySavings],
  );

  const newRateOffsetDeposit = combinedMonthlySavings + (rateSavingsApplied ? repaymentDiff : 0);
  const newResult = useMemo(
    () =>
      simulateFrequency({
        loanBalance,
        annualRate: comparisonRate,
        termYears: loanTermYears,
        frequency: paymentFrequency,
        monthlyOffsetDeposit: newRateOffsetDeposit,
      }),
    [loanBalance, comparisonRate, loanTermYears, paymentFrequency, newRateOffsetDeposit],
  );

  const interestSaved = Math.max(0, currentResult.totalInterest - newResult.totalInterest);
  const timeSavedMonths = Math.max(0, currentResult.monthsToPayoff - newResult.monthsToPayoff);

  const presetRates = [
    { label: '-0.25%', value: Math.max(0.25, interestRate - 0.25) },
    { label: '-0.50%', value: Math.max(0.25, interestRate - 0.5) },
    { label: '-0.75%', value: Math.max(0.25, interestRate - 0.75) },
    { label: '-1.00%', value: Math.max(0.25, interestRate - 1.0) },
  ];

  return (
    <>
      {/* Rate input */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Compare interest rates</h2>
        <p className="mt-1 text-sm text-slate-500">
          See how refinancing to a lower rate could save you — and redirect the
          repayment difference into your offset account.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-slate-400">Your current rate</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
              {interestRate.toFixed(2)}%
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Set in the mortgage calculator above
            </p>
          </div>
          <div>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">
                Comparison rate (%)
              </span>
              <input
                type="number"
                min="0.25"
                max={interestRate}
                step="0.05"
                value={comparisonRate}
                onChange={(e) => setComparisonRate(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-lg font-semibold tabular-nums text-slate-900 shadow-sm focus:border-refai-teal focus:outline-none focus:ring-2 focus:ring-refai-teal/20"
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {presetRates.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setComparisonRate(p.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    Math.abs(comparisonRate - p.value) < 0.001
                      ? 'bg-refai-teal text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Repayment difference */}
        {repaymentDiff > 0 && (
          <div className="mt-6 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-800">
                  Monthly repayment saving
                </p>
                <p className="mt-0.5 text-2xl font-bold tabular-nums text-emerald-600">
                  <AnimatedAud value={repaymentDiff} className="" />
                  <span className="text-base font-medium text-emerald-500">/mo</span>
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  Keep paying {formatAud(currentRepayment)}/mo and redirect the
                  difference to your offset account
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRateSavingsApplied((v) => !v)}
                className={`shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition ${
                  rateSavingsApplied
                    ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    : 'bg-refai-teal text-white hover:bg-refai-teal-dark'
                }`}
              >
                {rateSavingsApplied ? 'Remove from offset' : 'Add to offset account'}
              </button>
            </div>
          </div>
        )}

        {rateSavingsApplied && repaymentDiff > 0 && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            Rate savings applied to offset calculator
          </p>
        )}
      </section>

      {/* Side-by-side comparison */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Side-by-side comparison</h2>
        <p className="mt-1 text-sm text-slate-500">
          Includes {paymentFrequency === 'fortnightly' ? 'fortnightly' : 'monthly'} payments
          {combinedMonthlySavings > 0 || (rateSavingsApplied && repaymentDiff > 0)
            ? ' + offset deposits'
            : ''}
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <RateCard
            title="Current rate"
            rate={interestRate}
            repayment={currentResult.paymentAmount}
            totalInterest={currentResult.totalInterest}
            totalPaid={currentResult.totalPaid}
            monthsToPayoff={currentResult.monthsToPayoff}
          />
          <RateCard
            title="New rate"
            rate={comparisonRate}
            repayment={newResult.paymentAmount}
            totalInterest={newResult.totalInterest}
            totalPaid={newResult.totalPaid}
            monthsToPayoff={newResult.monthsToPayoff}
            badge={interestSaved > 0 ? `Save ${formatAud(interestSaved)}` : null}
            accent
          />
        </div>
      </div>

      {/* Summary delta */}
      {interestSaved > 0 && (
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Interest saved"
            value={interestSaved}
            color="text-emerald-600"
          />
          <SummaryCard
            label="Time saved"
            text={formatTimeDiff(timeSavedMonths)}
            color="text-emerald-600"
          />
          <SummaryCard
            label="Repayment redirect"
            value={rateSavingsApplied ? repaymentDiff : 0}
            suffix="/mo to offset"
            color="text-teal-600"
          />
        </section>
      )}

      {/* Explainer */}
      <section className="mt-8 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200/60">
        <h3 className="font-semibold text-slate-900">How does this work?</h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <ExplainerCard
            step="1"
            title="Refinance to a lower rate"
            desc="Switching lenders or negotiating a lower rate reduces your minimum monthly repayment."
          />
          <ExplainerCard
            step="2"
            title="Keep paying the same amount"
            desc="Instead of pocketing the saving, keep paying your old repayment amount. The difference goes into your offset account, reducing interest further."
          />
        </div>
        <p className="mt-5 text-xs text-slate-500">
          Combined with paused subscriptions, negotiated bills, and fortnightly payments,
          the rate saving compounds in your offset — dramatically cutting your loan term
          and total interest paid.
        </p>
      </section>
    </>
  );
}

function SummaryCard({ label, value, text, suffix, color }) {
  const animated = useAnimatedNumber(typeof value === 'number' ? value : 0, 700);
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>
        {text ?? formatAud(animated)}
        {suffix && <span className="text-sm font-medium">{suffix}</span>}
      </p>
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
