import type { z } from 'zod';
import { ValidationError } from '../../errors/validation-error';

/**
 * Validates a given object against a Zod schema.
 *
 * This function uses Zod to validate the provided `data` against the given `schema`.
 * If validation fails, a `ValidationError` is thrown containing detailed error information.
 * If validation succeeds, the parsed and validated data is returned with proper typing.
 *
 * @template T - The type of the data that the schema validates
 * @param {z.ZodSchema<T>} schema - The Zod schema to validate against.
 * @param {unknown} data - The object to validate.
 * @returns {T} The validated and parsed data.
 * @throws {ValidationError} If the object does not conform to the schema.
 *
 * @example
 * const userSchema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 * });
 *
 * const payload = {
 *   name: 'Alice',
 *   age: 30,
 * };
 *
 * const validatedUser = validateSchema(userSchema, payload);
 * console.log('Payload is valid!', validatedUser);
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
      return `${path}: ${issue.message}`;
    });

    const errorMessage = `Validation failed: ${errorMessages.join('; ')}`;
    throw new ValidationError(errorMessage);
  }

  return result.data;
}
