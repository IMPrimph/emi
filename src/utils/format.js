/**
 * Format a number as Indian currency (INR) without decimal fractions.
 * @param {number} value - The value to be formatted.
 * @param {string} [locale='en-IN'] - The locale to be used for formatting.
 * @param {string} [currency='INR'] - The currency code to be used for formatting.
 * @returns {string} - The formatted currency string.
 */
export function formatCurrency(value, locale = 'en-IN', currency = 'INR') {
  if (!value) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number with thousand separators (Indian locale), no decimal fractions.
 * @param {number} value - The value to be formatted.
 * @param {string} [locale='en-IN'] - The locale to be used for formatting.
 * @returns {string} - The formatted number string.
 */
export function formatNumber(value, locale = 'en-IN') {
  if (!value) return '';
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value);
}