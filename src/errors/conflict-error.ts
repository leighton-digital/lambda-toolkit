/**
 * Represents an HTTP 409 Conflict error.
 *
 * **Meaning:**
 * The request could not be completed due to a conflict with the current state of the resource.
 * This is typically used when attempting to create or modify a resource that already exists or
 * when concurrent updates cause version conflicts.
 *
 * **Status Code:** 409
 */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
