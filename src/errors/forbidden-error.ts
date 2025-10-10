/**
 * Represents an HTTP 403 Forbidden error.
 *
 * **Meaning:**
 * The server understood the request but refuses to authorize it.
 * This is typically used when the client is authenticated but does not have
 * permission to access the requested resource or perform the requested action.
 *
 * **Status Code:** 403
 */
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}
