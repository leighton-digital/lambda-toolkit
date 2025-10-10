/**
 * Represents an HTTP 401 Unauthorized error.
 *
 * **Meaning:**
 * The request requires valid authentication credentials.
 * The client either did not provide credentials or the provided credentials are invalid.
 *
 * **Status Code:** 401
 */
export class UnauthorisedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorisedError';
  }
}
