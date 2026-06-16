export type FormatCurrencyOptions = {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
  // show sign for negative/positive values
  signDisplay?: "auto" | "never" | "always" | "exceptZero";
};

/**
 * Format a number as a localized currency string.
 *
 * Defaults are tuned for Indonesian Rupiah (`id-ID`, `IDR`) with 0 fraction digits.
 * Use `compact: true` to enable compact notation (e.g. "Rp12K").
 */
export function formatCurrency(
  amount: number,
  options: FormatCurrencyOptions = {},
): string {
  const {
    locale = "id-ID",
    currency = "IDR",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    compact = false,
    signDisplay = "auto",
  } = options;

  const nf = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact
      ? Math.abs(amount) >= 1000
        ? "compact"
        : "standard"
      : "standard",
    compactDisplay: compact ? "short" : undefined,
    signDisplay,
  } as Intl.NumberFormatOptions);

  return nf.format(amount);
}

export default formatCurrency;
