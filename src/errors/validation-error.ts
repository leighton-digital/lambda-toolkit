/**
 * Represents an HTTP 400 Bad Request validation error.
 *
 * **Meaning:**
 * The server cannot process the request because one or more fields failed validation.
 * This is typically used when required parameters are missing, data formats are invalid,
 * or constraints (such as length or range) are not met.
 *
 * **Status Code:** 400
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
