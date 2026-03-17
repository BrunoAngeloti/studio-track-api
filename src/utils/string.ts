const getQueryString = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) return String(value[0]);
  if (typeof value === 'string') return value;
  return undefined;
};

export const parseDate = (value?: unknown): Date | undefined => {
  const str = getQueryString(value);
  if (!str) return undefined;

  const date = new Date(str);
  return isNaN(date.getTime()) ? undefined : date;
};