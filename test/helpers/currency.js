/**
 * Currency utility helpers for price parsing and calculations in GBP.
 */

/**
 * Parses a currency string like "£48.00", "–£0.25", "−£12.00", or "£5.00" into a float.
 * Handles various hyphen/minus/en-dash representations used across the app.
 *
 * @param {string|number} raw - The formatted price string or number
 * @returns {number} The absolute parsed numeric amount rounded to 2 decimal places
 */
export function parseCurrency(raw) {
    if (typeof raw === 'number') {
        return round2(Math.abs(raw));
    }
    if (!raw || typeof raw !== 'string') {
        return 0;
    }

    // Strip minus symbols (hyphen, en-dash, em-dash, unicode minus) and whitespace
    const clean = raw.replace(/[–—−\-\s£$,]/g, '').trim();
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : round2(parsed);
}

/**
 * Standard 2-decimal place rounding to avoid JavaScript floating point errors.
 *
 * @param {number} num - The number to round
 * @returns {number} Number rounded to 2 decimal places
 */
export function round2(num) {
    return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a number back into standard GBP string representation (£0.00).
 *
 * @param {number} num - The number to format
 * @returns {string} Formatted string, e.g. "£48.00"
 */
export function formatGBP(num) {
    return `£${round2(num).toFixed(2)}`;
}
