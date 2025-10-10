/**
 * Represents an HTTP 404 Not Found error.
 *
 * **Meaning:**
 * The requested resource could not be found on the server.
 * This is typically used when a resource with the specified identifier does not exist,
 * or when the endpoint itself is not valid.
 *
 * **Status Code:** 404
 */
export class ResourceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceNotFound';
  }
}
