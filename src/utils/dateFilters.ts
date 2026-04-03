export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

const TIME_ZONE = 'America/Sao_Paulo';

const getZonedParts = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date);

  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';

  const year = Number(get('year'));
  const month = Number(get('month'));
  const day = Number(get('day'));
  const weekdayShort = get('weekday');

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year,
    month,
    day,
    weekday: weekdayMap[weekdayShort],
  };
};

export const getDateRangeByPeriod = (period: string) => {
  const now = new Date();
  const { year, month, day, weekday } = getZonedParts(now, TIME_ZONE);

  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'daily': {
      startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      break;
    }

    case 'weekly': {
      const diffToMonday = weekday === 0 ? 6 : weekday - 1;

      const baseUtc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

      startDate = new Date(baseUtc);
      startDate.setUTCDate(startDate.getUTCDate() - diffToMonday);
      startDate.setUTCHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setUTCDate(endDate.getUTCDate() + 6);
      endDate.setUTCHours(23, 59, 59, 999);
      break;
    }

    case 'monthly': {
      startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      break;
    }

    case 'yearly': {
      startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
      break;
    }

    default: {
      startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    }
  }

  return { startDate, endDate };
};