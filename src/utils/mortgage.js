/**
 * Simulates a P&I loan with an offset account receiving monthly deposits.
 * Returns interest saved, time saved, and projected offset balances.
 */
export function calculateOffset(monthlyRedirect, loanBalance, annualRate, termYears) {
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

/**
 * Calculates monthly P&I repayment for a given loan.
 */
export function monthlyRepayment(loanBalance, annualRate, termYears) {
  if (loanBalance <= 0 || annualRate <= 0 || termYears <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return (loanBalance * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Simulates a loan amortisation at a given payment frequency with optional
 * offset deposits. Returns total interest, total paid, and months to payoff.
 *
 * frequency: 'monthly' | 'fortnightly' | 'weekly'
 *
 * The fortnightly/weekly trick: take the monthly repayment, divide by 2 (or 4),
 * and pay that amount 26 (or 52) times per year. This results in the equivalent
 * of 13 monthly payments per year instead of 12, accelerating principal paydown.
 */
export function simulateFrequency({
  loanBalance,
  annualRate,
  termYears,
  frequency,
  monthlyOffsetDeposit = 0,
}) {
  if (loanBalance <= 0 || annualRate <= 0 || termYears <= 0) {
    return { totalInterest: 0, totalPaid: 0, monthsToPayoff: 0, paymentAmount: 0 };
  }

  const monthlyR = annualRate / 100 / 12;
  const totalMonths = termYears * 12;
  const baseMonthlyRepayment = monthlyRepayment(loanBalance, annualRate, termYears);

  if (frequency === 'monthly') {
    let balance = loanBalance;
    let offsetBalance = 0;
    let totalInterest = 0;
    let months = 0;

    for (let m = 1; m <= totalMonths + 120; m++) {
      if (balance <= 0) break;
      offsetBalance += monthlyOffsetDeposit;
      const effective = Math.max(0, balance - offsetBalance);
      const interest = effective * monthlyR;
      totalInterest += interest;
      const principal = baseMonthlyRepayment - interest;
      balance -= Math.max(0, principal);
      months = m;
      if (balance <= 0) break;
    }

    return {
      totalInterest,
      totalPaid: baseMonthlyRepayment * months,
      monthsToPayoff: months,
      paymentAmount: baseMonthlyRepayment,
      paymentsPerYear: 12,
    };
  }

  const periodsPerYear = frequency === 'fortnightly' ? 26 : 52;
  const divisor = frequency === 'fortnightly' ? 2 : 4;
  const periodPayment = baseMonthlyRepayment / divisor;
  const dailyRate = annualRate / 100 / 365;
  const daysPerPeriod = frequency === 'fortnightly' ? 14 : 7;

  const maxPeriods = periodsPerYear * (termYears + 10);

  let balance = loanBalance;
  let offsetBalance = 0;
  let totalInterest = 0;
  let periods = 0;

  const offsetPerPeriod = monthlyOffsetDeposit / (periodsPerYear / 12);

  for (let p = 1; p <= maxPeriods; p++) {
    if (balance <= 0) break;
    offsetBalance += offsetPerPeriod;
    const effective = Math.max(0, balance - offsetBalance);
    const interest = effective * dailyRate * daysPerPeriod;
    totalInterest += interest;
    const principal = periodPayment - interest;
    balance -= Math.max(0, principal);
    periods = p;
    if (balance <= 0) break;
  }

  const monthsEquivalent = Math.round((periods * daysPerPeriod) / 30.44);

  return {
    totalInterest,
    totalPaid: periodPayment * periods,
    monthsToPayoff: monthsEquivalent,
    paymentAmount: periodPayment,
    paymentsPerYear: periodsPerYear,
  };
}

/**
 * Builds month-index → deposit amount for lump sums (1-based month from loan start).
 */
export function buildLumpSumSchedule(lumpSums, maxMonths) {
  const schedule = new Map();
  for (const lump of lumpSums) {
    if (!lump?.amount || lump.amount <= 0) continue;
    const month = Math.min(12, Math.max(1, lump.month || 1));
    const years = lump.recurring ? Math.ceil(maxMonths / 12) : 1;
    for (let year = 0; year < years; year++) {
      const monthIndex = year * 12 + month;
      if (monthIndex > maxMonths) break;
      schedule.set(monthIndex, (schedule.get(monthIndex) || 0) + lump.amount);
    }
  }
  return schedule;
}

/**
 * Monthly P&I simulation with offset deposits and optional yearly / one-off lump sums.
 */
export function simulateOffsetWithLumpSums({
  loanBalance,
  annualRate,
  termYears,
  monthlyOffsetDeposit = 0,
  lumpSums = [],
}) {
  if (loanBalance <= 0 || annualRate <= 0 || termYears <= 0) {
    return {
      totalInterest: 0,
      monthsToPayoff: 0,
      offsetBalanceYear1: 0,
      offsetBalanceYear5: 0,
      totalLumpSumsDeposited: 0,
      offsetAtMonths: {},
    };
  }

  const monthlyR = annualRate / 100 / 12;
  const totalMonths = termYears * 12;
  const repayment = monthlyRepayment(loanBalance, annualRate, termYears);
  const maxMonths = totalMonths + 120;
  const lumpSchedule = buildLumpSumSchedule(lumpSums, maxMonths);

  let balance = loanBalance;
  let offsetBalance = 0;
  let totalInterest = 0;
  let months = 0;
  let totalLumpSumsDeposited = 0;
  const offsetAtMonths = {};

  for (let m = 1; m <= maxMonths; m++) {
    if (balance <= 0) break;

    offsetBalance += monthlyOffsetDeposit;
    const lumpThisMonth = lumpSchedule.get(m) || 0;
    if (lumpThisMonth > 0) {
      offsetBalance += lumpThisMonth;
      totalLumpSumsDeposited += lumpThisMonth;
    }

    const effective = Math.max(0, balance - offsetBalance);
    const interest = effective * monthlyR;
    totalInterest += interest;
    const principal = repayment - interest;
    balance -= Math.max(0, principal);
    months = m;

    if (m === 12) offsetAtMonths.year1 = offsetBalance;
    if (m === 60) offsetAtMonths.year5 = offsetBalance;
    if (m === 120) offsetAtMonths.year10 = offsetBalance;

    if (balance <= 0) break;
  }

  return {
    totalInterest,
    monthsToPayoff: months,
    offsetBalanceYear1: offsetAtMonths.year1 ?? offsetBalance,
    offsetBalanceYear5: offsetAtMonths.year5 ?? offsetBalance,
    offsetBalanceYear10: offsetAtMonths.year10 ?? offsetBalance,
    totalLumpSumsDeposited,
    offsetAtMonths,
  };
}

/**
 * Simulates monthly P&I repayments with optional lump sums at each year-end.
 * yearEndLumpSums: array where index 0 = lump after year 1, etc.
 */
export function simulateHomeLoanWithYearlyLumps({
  loanBalance,
  annualRate,
  termYears,
  yearEndLumpSums = [],
}) {
  if (loanBalance <= 0 || annualRate <= 0 || termYears <= 0) {
    return {
      monthsToPayoff: 0,
      totalInterest: 0,
      yearlySnapshots: [],
    };
  }

  const monthlyR = annualRate / 100 / 12;
  const repayment = monthlyRepayment(loanBalance, annualRate, termYears);
  const maxMonths = termYears * 12 + 120;

  let balance = loanBalance;
  let totalInterest = 0;
  let months = 0;
  let monthInYear = 0;
  let year = 1;
  const yearlySnapshots = [];

  for (let m = 1; m <= maxMonths; m++) {
    if (balance <= 0) break;

    totalInterest += balance * monthlyR;
    balance -= Math.max(0, repayment - balance * monthlyR);
    months = m;
    monthInYear++;

    if (monthInYear === 12) {
      const lump = yearEndLumpSums[year - 1] || 0;
      const applied = Math.min(lump, balance);
      balance -= applied;

      yearlySnapshots.push({
        year,
        lumpApplied: applied,
        homeLoanBalance: balance,
      });

      year++;
      monthInYear = 0;
      if (balance <= 0) break;
    }
  }

  return { monthsToPayoff: months, totalInterest, yearlySnapshots };
}

/**
 * Models recycling investment-property equity growth (annual % on current value)
 * into the home loan at each year-end. Illustrative only — not financial advice.
 */
export function simulateEquityRecyclingStrategy({
  loanBalance,
  annualRate,
  termYears,
  investmentPurchasePrice,
  annualGrowthPercent = 4,
}) {
  if (
    loanBalance <= 0 ||
    annualRate <= 0 ||
    termYears <= 0 ||
    investmentPurchasePrice <= 0 ||
    annualGrowthPercent <= 0
  ) {
    return {
      monthsToPayoff: 0,
      totalInterest: 0,
      totalEquityApplied: 0,
      baselineMonths: 0,
      timeSavedMonths: 0,
      interestSaved: 0,
      yearlySchedule: [],
      finalPropertyValue: investmentPurchasePrice,
      totalEquityGrowth: 0,
    };
  }

  const growthRate = annualGrowthPercent / 100;
  let propertyValue = investmentPurchasePrice;
  const yearEndLumpSums = [];
  const yearlySchedule = [];

  for (let y = 1; y <= 50; y++) {
    const equityGain = propertyValue * growthRate;
    propertyValue += equityGain;
    yearEndLumpSums.push(equityGain);
    yearlySchedule.push({
      year: y,
      propertyValueStart: propertyValue - equityGain,
      equityGain,
      propertyValueEnd: propertyValue,
      equityAvailable: equityGain,
    });
    if (yearEndLumpSums.length >= 50) break;
  }

  const withStrategy = simulateHomeLoanWithYearlyLumps({
    loanBalance,
    annualRate,
    termYears,
    yearEndLumpSums,
  });

  const baseline = simulateHomeLoanWithYearlyLumps({
    loanBalance,
    annualRate,
    termYears,
    yearEndLumpSums: [],
  });

  const payoffYear = Math.ceil(withStrategy.monthsToPayoff / 12);
  const schedule = yearlySchedule
    .slice(0, payoffYear)
    .map((row, i) => ({
      ...row,
      equityApplied: Math.min(
        row.equityGain,
        withStrategy.yearlySnapshots[i]?.lumpApplied ?? row.equityGain,
      ),
      homeLoanBalance: withStrategy.yearlySnapshots[i]?.homeLoanBalance ?? 0,
    }));

  return {
    monthsToPayoff: withStrategy.monthsToPayoff,
    totalInterest: withStrategy.totalInterest,
    totalEquityApplied: schedule.reduce((s, r) => s + r.equityApplied, 0),
    baselineMonths: baseline.monthsToPayoff,
    baselineInterest: baseline.totalInterest,
    timeSavedMonths: Math.max(0, baseline.monthsToPayoff - withStrategy.monthsToPayoff),
    interestSaved: Math.max(0, baseline.totalInterest - withStrategy.totalInterest),
    yearlySchedule: schedule,
    finalPropertyValue: yearlySchedule[payoffYear - 1]?.propertyValueEnd ?? propertyValue,
    totalEquityGrowth: propertyValue - investmentPurchasePrice,
  };
}

const DAYS_PER_MONTH = 30;

/**
 * Simulates salary crediting / wage flushing: weekly net pay is deposited into
 * the offset account, stays there until month-end when it is withdrawn, then
 * the cycle repeats. Optional permanent monthly offset deposits accumulate and
 * are never withdrawn.
 */
export function simulateWageFlush({
  loanBalance,
  annualRate,
  termYears,
  weeklyWage = 0,
  monthlyOffsetDeposit = 0,
}) {
  if (loanBalance <= 0 || annualRate <= 0 || termYears <= 0) {
    return {
      totalInterest: 0,
      monthsToPayoff: 0,
      peakWageOffset: 0,
      avgWageOffsetInMonth: 0,
      monthlyWageDeposited: 0,
    };
  }

  const dailyRate = annualRate / 100 / 365;
  const totalMonths = termYears * 12;
  const repayment = monthlyRepayment(loanBalance, annualRate, termYears);
  const maxMonths = totalMonths + 120;

  let balance = loanBalance;
  let permanentOffset = 0;
  let wageOffset = 0;
  let totalInterest = 0;
  let months = 0;
  let peakWageOffset = 0;
  let wageOffsetDaySum = 0;
  let wageOffsetDays = 0;
  let monthlyWageDeposited = 0;

  for (let m = 1; m <= maxMonths; m++) {
    if (balance <= 0) break;

    permanentOffset += monthlyOffsetDeposit;
    let monthInterest = 0;
    let monthWageDeposited = 0;

    for (let d = 1; d <= DAYS_PER_MONTH; d++) {
      const globalDay = (m - 1) * DAYS_PER_MONTH + d;
      if (weeklyWage > 0 && globalDay % 7 === 0) {
        wageOffset += weeklyWage;
        monthWageDeposited += weeklyWage;
      }

      peakWageOffset = Math.max(peakWageOffset, wageOffset);
      wageOffsetDaySum += wageOffset;
      wageOffsetDays += 1;

      const effective = Math.max(0, balance - permanentOffset - wageOffset);
      monthInterest += effective * dailyRate;
    }

    monthlyWageDeposited = monthWageDeposited;
    wageOffset = 0;

    totalInterest += monthInterest;
    const principal = repayment - monthInterest;
    balance -= Math.max(0, principal);
    months = m;

    if (balance <= 0) break;
  }

  return {
    totalInterest,
    monthsToPayoff: months,
    peakWageOffset,
    avgWageOffsetInMonth: wageOffsetDays > 0 ? wageOffsetDaySum / wageOffsetDays : 0,
    monthlyWageDeposited,
  };
}
