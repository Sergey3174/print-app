/**
 * Parses a custom page range format and returns an array of page numbers
 *
 * Supported formats:
 * - "1-5" - range from 1 to 5
 * - "1,3,5" - individual pages
 * - "1-5,8,10-12" - mixed format
 *
 * @param input - User input string (e.g., "1-5,8,10-12")
 * @param maxPage - Maximum valid page number (document total pages)
 * @returns Array of unique sorted page numbers, or null if invalid input
 *
 * @example
 * parsePages("1-3,5,8-10", 12) // [1, 2, 3, 5, 8, 9, 10]
 * parsePages("15-20", 12) // null (out of range)
 * parsePages("invalid", 12) // null
 */
export function parsePages(input: string, maxPage: number): number[] | null {
  if (!input.trim()) return null;

  const pages = new Set<number>();
  const parts = input.split(",");

  for (const part of parts) {
    const trimmed = part.trim();

    if (!trimmed) continue;

    // Handle range format (e.g., "1-5")
    if (trimmed.includes("-")) {
      const [start, end] = trimmed.split("-").map((s) => parseInt(s.trim()));

      // Validate: both values must be valid numbers
      if (isNaN(start) || isNaN(end)) return null;

      // Validate: start must be >= 1 and start <= end
      if (start > end || start < 1) return null;

      // Add all pages in range (ignore pages beyond maxPage)
      for (let i = start; i <= end; i++) {
        if (i <= maxPage) pages.add(i);
      }
    } else {
      // Handle single page number
      const num = parseInt(trimmed);

      // Validate: must be valid number within range
      if (isNaN(num) || num < 1 || num > maxPage) return null;

      pages.add(num);
    }
  }

  // Return sorted array of unique pages
  return Array.from(pages).sort((a, b) => a - b);
}
