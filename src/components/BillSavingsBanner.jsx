import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { formatAud } from '../utils/format';

export default function BillSavingsBanner({
  totalOriginal,
  totalNegotiated,
  totalMonthlySaving,
  totalAnnualSaving,
}) {
  const animOriginal = useAnimatedNumber(totalOriginal);
  const animNegotiated = useAnimatedNumber(totalNegotiated);
  const animMonthly = useAnimatedNumber(totalMonthlySaving);
  const animAnnual = useAnimatedNumber(totalAnnualSaving, 700);

  return (
    <section className="rounded-2xl bg-gradient-to-br from-refai-teal to-refai-teal-dark p-6 text-white shadow-lg">
      <h2 className="text-sm font-medium uppercase tracking-wider text-teal-100">
        Negotiation savings summary
      </h2>
      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm text-teal-100">Original monthly spend</p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
            {formatAud(animOriginal)}
          </p>
        </div>
        <div>
          <p className="text-sm text-teal-100">After negotiation</p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
            {formatAud(animNegotiated)}
          </p>
        </div>
        <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
          <p className="text-sm text-teal-100">Monthly saving</p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
            {formatAud(animMonthly)}
          </p>
        </div>
        <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
          <p className="text-sm text-teal-100">Annual saving</p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
            {formatAud(animAnnual)}
          </p>
          <p className="mt-1 text-xs text-teal-200">At current negotiated rates</p>
        </div>
      </div>
    </section>
  );
}
