const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

/**
 * Format a number as Indian currency (INR) without decimal fractions.
 */
export function formatCurrency(value) {
  return currencyFormatter.format(value);
}

/**
 * Format a number with thousand separators (Indian locale), no decimal fractions.
 */
export function formatNumber(value) {
  return numberFormatter.format(value);
}