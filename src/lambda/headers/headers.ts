/**
 * A collection of HTTP headers with string or boolean values.
 * Used for configuring security headers and CORS settings.
 */
type StageHeaders = Record<string, string | boolean>;

/**
 * Returns a collection of secure HTTP headers with optional overrides.
 *
 * This function provides a comprehensive set of security headers including:
 * - Content Security Policy (CSP)
 * - Strict Transport Security (HSTS)
 * - Content type protection
 * - Clickjacking protection
 * - XSS protection
 * - Referrer policy
 * - Permissions policy
 * - CORS configuration
 *
 * @param overrides - Optional headers to override or add to the default set
 * @returns A collection of HTTP headers with security and CORS configurations
 *
 * @example
 * ```typescript
 * // Get default headers
 * const headers = getHeaders();
 *
 * // Override specific headers
 * const customHeaders = getHeaders({
 *   'Access-Control-Allow-Origin': 'https://example.com',
 *   'Custom-Header': 'custom-value'
 * });
 * ```
 */
export function getHeaders(overrides?: StageHeaders): StageHeaders {
  return {
    'Content-Type': 'application/json',
    'Content-Security-Policy': "default-src 'self'",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'geolocation=(), microphone=()',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': true,
    ...overrides,
  };
}
