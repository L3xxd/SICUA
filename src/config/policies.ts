// Basic, overridable policy config for vacations
export const vacationPolicyConfig = {
  // Base days for fixed contracts at 0–1 years of service
  baseDaysFijo: 10,
  // Increment +2 days per year until 5 years
  incrementPerYearUntilFive: 2,
  // After 5 years, +2 days every 5 years
  incrementAfterFivePerBlock: 2,
  incrementAfterFiveBlockYears: 5,
  // Temporal: months worked -> days (ratio)
  temporalMonthToDayRatio: 1,
} as const;

export type VacationPolicyConfig = typeof vacationPolicyConfig;

