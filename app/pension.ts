export type Sex = "mujer" | "hombre";

export type PensionProfile = {
  name: string;
  sex: Sex;
  birthDate: string;
};

export type Countdown = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  reached: boolean;
};

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function addCalendarMonths(date: Date, months: number) {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  const targetYear = result.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const day = Math.min(result.getDate(), daysInMonth(targetYear, normalizedMonth));
  result.setDate(1);
  result.setFullYear(targetYear, normalizedMonth, day);
  return result;
}

export function getRetirementDate(birthDate: string, sex: Sex) {
  const [year, month, day] = birthDate.split("-").map(Number);
  const retirementAge = sex === "mujer" ? 57 : 62;
  const targetYear = year + retirementAge;
  const targetDay = Math.min(day, daysInMonth(targetYear, month - 1));
  return new Date(targetYear, month - 1, targetDay, 0, 0, 0, 0);
}

export function calculateCountdown(now: Date, target: Date): Countdown {
  if (now >= target) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      reached: true,
    };
  }

  let months =
    (target.getFullYear() - now.getFullYear()) * 12 +
    target.getMonth() -
    now.getMonth();
  let cursor = addCalendarMonths(now, months);
  if (cursor > target) {
    months -= 1;
    cursor = addCalendarMonths(now, months);
  }

  let remaining = target.getTime() - cursor.getTime();
  const days = Math.floor(remaining / 86_400_000);
  remaining -= days * 86_400_000;
  const hours = Math.floor(remaining / 3_600_000);
  remaining -= hours * 3_600_000;
  const minutes = Math.floor(remaining / 60_000);
  remaining -= minutes * 60_000;
  const seconds = Math.floor(remaining / 1000);

  return {
    years: Math.floor(months / 12),
    months: months % 12,
    days,
    hours,
    minutes,
    seconds,
    reached: false,
  };
}
