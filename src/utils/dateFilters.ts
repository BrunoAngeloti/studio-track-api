import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

// 🔥 função chave: converte local → UTC corretamente
const toUTC = (date: Date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};

export const getDateRangeByPeriod = (period: string) => {
  const now = new Date();

  let startLocal: Date;
  let endLocal: Date;

  switch (period) {
    case 'daily':
      startLocal = startOfDay(now);
      endLocal = endOfDay(now);
      break;

    case 'weekly':
      startLocal = startOfWeek(now, { weekStartsOn: 1 });
      endLocal = endOfWeek(now, { weekStartsOn: 1 });
      break;

    case 'monthly':
      startLocal = startOfMonth(now);
      endLocal = endOfMonth(now);
      break;

    case 'yearly':
      startLocal = startOfYear(now);
      endLocal = endOfYear(now);
      break;

    default:
      startLocal = now;
      endLocal = now;
  }

  return {
    startDate: toUTC(startLocal),
    endDate: toUTC(endLocal),
  };
};