export enum Currency {
  VND = 'VND',
  USD = 'USD',
}

/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency The currency code
 * @returns The formatted currency string
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: Currency | string = Currency.VND
): string {
  // Handle null, undefined or empty values
  if (amount === null || amount === undefined || amount === '') return '-';

  // Convert string to number if needed
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Check if the conversion resulted in a valid number
  if (isNaN(numericAmount)) return '-';

  // Use a default currency if provided value is not valid
  const currencyCode = currency || Currency.VND;

  // Format with appropriate locale and currency
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true, // Ensure commas are used for thousands
    }).format(numericAmount);
  } catch (error) {
    // Fallback to basic formatting if Intl formatter fails
    return `${numericAmount.toLocaleString('vi-VN')} ${currencyCode}`;
  }
}
