// Utility helpers for the API

// Helper to safely extract a route/query param as a single string.
// Express params/query values can be string | string[]; we take the first.
export function getParam(param: unknown): string {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && typeof param[0] === 'string') return param[0];
  return '';
}

// Helper to format currency values
export function formatCurrency(amount: number, currency = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });
  return formatter.format(amount);
}

// Helper to calculate percentage change
export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

// Parse pagination params from query
export function parsePagination(query: Record<string, unknown>): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = parseInt(String(query.page ?? ''), 10) || 1;
  const limit = parseInt(String(query.limit ?? ''), 10) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper to build filter object from allowed query params
export const buildFilters = (
  query: Record<string, unknown>,
  allowedFields: string[],
): Record<string, unknown> => {
  const filters: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (query[field] !== undefined) {
      filters[field] = query[field];
    }
  }

  return filters;
};

// Clamp a value to the [min, max] range
export function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Format a date as a locale date string, guarding against invalid input
export function formatDate(date: string | number | Date): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString();
}
