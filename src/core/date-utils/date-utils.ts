/**
 * Returns the current date and time in ISO 8601 format.
 *
 * **Example output:** `"2025-08-09T12:34:56.789Z"`
 *
 * This is useful for creating consistent, timezone-independent timestamps
 * for logging, database records, or API payloads.
 *
 * @returns {string} The current UTC date and time as an ISO 8601 string.
 */
export const getISOString = (): string => {
  return new Date().toISOString();
};
