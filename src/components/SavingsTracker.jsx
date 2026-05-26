import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { formatAud } from '../utils/format';

export default function SavingsTracker({
  monthlySavings,
  annualSavings,
  lifetimeSavings,
}) {
  const animatedMonthly = useAnimatedNumber(monthlySavings);
  const animatedAnnual = useAnimatedNumber(annualSavings);
  const animatedLifetime = useAnimatedNumber(lifetimeSavings, 800);

  return (
    <section className="rounded-2xl bg-gradient-to-br from-refai-teal to-refai-teal-dark p-6 text-white shadow-lg">
      <h2 className="text-sm font-medium uppercase tracking-wider text-teal-100">
        Savings tracker
      </h2>
      <div className="mt-5 grid gap-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-teal-100">Monthly savings</p>
          <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">
            {formatAud(animatedMonthly)}
          </p>
          <p className="mt-1 text-xs text-teal-200">From paused & cancelled</p>
        </div>
        <div>
          <p className="text-sm text-teal-100">Projected annual</p>
          <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">
            {formatAud(animatedAnnual)}
          </p>
          <p className="mt-1 text-xs text-teal-200">At current rates</p>
        </div>
        <div className="rounded-xl bg-white/10 p-4 backdrop-blur sm:col-span-1">
          <p className="text-sm text-teal-100">Lifetime savings</p>
          <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">
            {formatAud(animatedLifetime)}
          </p>
          <p className="mt-1 text-xs text-teal-200">Since you started using this</p>
        </div>
      </div>
    </section>
  );
}
