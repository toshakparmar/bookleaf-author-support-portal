export interface ComputedRoyaltyFacts {
  currentQuarter: string; // e.g. "Q1 2026"
  quarterEndDate: string; // YYYY-MM-DD
  payoutDeadline: string; // 45 days post quarter end
  nextPayoutDate: string; // Expected payout date
  isBelowMinimumThreshold: boolean; // pending < ₹1000
  minimumThresholdAmount: number; // ₹1000
  isPayoutOverdue: boolean; // Quarter ended >45 days ago, pending >0, last payout before window
  daysSinceLastPayout: number | null;
  monthsSincePublication: number | null;
}

export function computeRoyaltyCycle(
  pendingRoyalty: number,
  lastPayoutDate: Date | null,
  publicationDate: Date | null,
  referenceDate: Date = new Date(),
): ComputedRoyaltyFacts {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth(); // 0-indexed: 0 = Jan, 11 = Dec

  // Determine current quarter and quarter end
  let qNum: number;
  let qEndMonth: number;
  let qEndDay: number;
  let qEndYear = year;

  if (month >= 0 && month <= 2) {
    qNum = 1;
    qEndMonth = 2; // March (0-indexed)
    qEndDay = 31;
  } else if (month >= 3 && month <= 5) {
    qNum = 2;
    qEndMonth = 5; // June
    qEndDay = 30;
  } else if (month >= 6 && month <= 8) {
    qNum = 3;
    qEndMonth = 8; // September
    qEndDay = 30;
  } else {
    qNum = 4;
    qEndMonth = 11; // December
    qEndDay = 31;
  }

  const quarterEndDate = new Date(qEndYear, qEndMonth, qEndDay);

  // Payout deadline: 45 days post quarter end
  const payoutDeadlineDate = new Date(quarterEndDate.getTime() + 45 * 24 * 60 * 60 * 1000);

  // Previous quarter details (to check overdue status)
  let prevQEndYear = year;
  let prevQEndMonth = qEndMonth - 3;
  let prevQEndDay = 30;

  if (prevQEndMonth < 0) {
    prevQEndYear = year - 1;
    prevQEndMonth = 11;
    prevQEndDay = 31;
  } else if (prevQEndMonth === 2) {
    prevQEndDay = 31;
  }

  const prevQuarterEndDate = new Date(prevQEndYear, prevQEndMonth, prevQEndDay);
  const prevQuarterDeadline = new Date(prevQuarterEndDate.getTime() + 45 * 24 * 60 * 60 * 1000);

  // Check if overdue:
  // If previous quarter deadline has passed and pending > 0 and (lastPayout is null or before prevQuarterEndDate)
  const isBelowMinimumThreshold = pendingRoyalty > 0 && pendingRoyalty < 1000;
  const isPayoutOverdue =
    referenceDate.getTime() > prevQuarterDeadline.getTime() &&
    pendingRoyalty >= 1000 &&
    (!lastPayoutDate || lastPayoutDate.getTime() < prevQuarterEndDate.getTime());

  // Days since last payout
  const daysSinceLastPayout = lastPayoutDate
    ? Math.floor((referenceDate.getTime() - lastPayoutDate.getTime()) / (24 * 60 * 60 * 1000))
    : null;

  // Months since publication
  const monthsSincePublication = publicationDate
    ? Math.max(
        0,
        (referenceDate.getFullYear() - publicationDate.getFullYear()) * 12 +
          (referenceDate.getMonth() - publicationDate.getMonth()),
      )
    : null;

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return {
    currentQuarter: `Q${qNum} ${year}`,
    quarterEndDate: formatDate(quarterEndDate),
    payoutDeadline: formatDate(payoutDeadlineDate),
    nextPayoutDate: formatDate(payoutDeadlineDate),
    isBelowMinimumThreshold,
    minimumThresholdAmount: 1000,
    isPayoutOverdue,
    daysSinceLastPayout,
    monthsSincePublication,
  };
}
