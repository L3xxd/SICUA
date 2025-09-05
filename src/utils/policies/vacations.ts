import { User } from '../../types';
import { vacationPolicyConfig, VacationPolicyConfig } from '../../config/policies';

// Safe date parser (expects YYYY-MM-DD)
function parseISO(d?: string): Date | null {
  if (!d) return null;
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function getSeniorityYears(user: User, asOf: Date = new Date()): number {
  const hire = parseISO(user.hireDate);
  if (!hire) return user.seniorityYears ?? 0;
  const y = asOf.getFullYear() - hire.getFullYear();
  const annivThisYear = new Date(asOf.getFullYear(), hire.getMonth(), hire.getDate());
  return asOf >= annivThisYear ? y : y - 1;
}

export function getServiceYearBounds(user: User, asOf: Date = new Date()): { start: Date; end: Date } | null {
  const hire = parseISO(user.hireDate);
  if (!hire) return null;
  const years = getSeniorityYears(user, asOf);
  const start = new Date(hire);
  start.setFullYear(hire.getFullYear() + years);
  const end = new Date(start);
  end.setFullYear(start.getFullYear() + 1);
  return { start, end };
}

// Fixed (fijo) contract entitlement by seniority
export function getEntitlementFijo(
  user: User,
  asOf: Date = new Date(),
  cfg: VacationPolicyConfig = vacationPolicyConfig
): number {
  const years = getSeniorityYears(user, asOf);
  const base = cfg.baseDaysFijo;
  if (years <= 0) return base;
  if (years <= 5) {
    return base + years * cfg.incrementPerYearUntilFive;
  }
  const afterFiveYears = years - 5;
  const blocks = Math.floor(afterFiveYears / cfg.incrementAfterFiveBlockYears);
  return base + 5 * cfg.incrementPerYearUntilFive + blocks * cfg.incrementAfterFivePerBlock;
}

function monthsBetweenInclusive(a: Date, b: Date): number {
  // Count full months from date a (inclusive) to b (exclusive of partial month)
  const ay = a.getFullYear();
  const am = a.getMonth();
  const by = b.getFullYear();
  const bm = b.getMonth();
  let months = (by - ay) * 12 + (bm - am);
  // If b's day is before a's day, last month not complete
  if (b.getDate() < a.getDate()) months -= 1;
  return Math.max(0, months);
}

// Temporal contract entitlement: proportional to months worked in current service year
export function getEntitlementTemporal(
  user: User,
  asOf: Date = new Date(),
  cfg: VacationPolicyConfig = vacationPolicyConfig
): number {
  const bounds = getServiceYearBounds(user, asOf);
  if (!bounds) return Math.floor((user.vacationDays ?? 0));
  const workedMonths = monthsBetweenInclusive(bounds.start, asOf);
  const days = Math.floor(workedMonths * cfg.temporalMonthToDayRatio);
  return Math.max(0, days);
}

export function getVacationEntitlement(
  user: User,
  asOf: Date = new Date(),
  cfg: VacationPolicyConfig = vacationPolicyConfig
): number {
  const type = user.contractType || 'fijo';
  if (type === 'temporal') return getEntitlementTemporal(user, asOf, cfg);
  return getEntitlementFijo(user, asOf, cfg);
}

export type EntitlementBreakdown = {
  contractType: NonNullable<User['contractType']> | 'fijo';
  seniorityYears: number;
  serviceWindow?: { start: string; end: string };
  entitlementDays: number;
};

export function getEntitlementSummary(user: User, asOf: Date = new Date()) : EntitlementBreakdown {
  const seniorityYears = getSeniorityYears(user, asOf);
  const entitlementDays = getVacationEntitlement(user, asOf);
  const bounds = getServiceYearBounds(user, asOf);
  return {
    contractType: user.contractType || 'fijo',
    seniorityYears,
    serviceWindow: bounds ? { start: bounds.start.toISOString().slice(0,10), end: bounds.end.toISOString().slice(0,10) } : undefined,
    entitlementDays,
  };
}
