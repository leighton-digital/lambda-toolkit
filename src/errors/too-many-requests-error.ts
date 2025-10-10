/**
 * Represents an HTTP 429 Too Many Requests error.
 *
 * **Meaning:**
 * The client has sent too many requests in a given amount of time ("rate limiting").
 * This is typically used when an API enforces a request quota or throttling policy.
 *
 * **Status Code:** 429
 */
export class TooManyRequestsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TooManyRequestsError';
  }
}
