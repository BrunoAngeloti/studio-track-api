export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const getDateRangeByPeriod = (period: string) => {
  const now = new Date();

  let startDate = new Date(now);
  let endDate = new Date(now);

  if (period === 'daily') {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  }

  if (period === 'weekly') {
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;

    startDate.setDate(now.getDate() - diffToMonday);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  }

  if (period === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  if (period === 'yearly') {
    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  }

  return { startDate, endDate };
};