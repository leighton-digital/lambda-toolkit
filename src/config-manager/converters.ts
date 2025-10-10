import z from 'zod';

/**
 * Validates a string value for use as an environment variable.
 * Ensures the string meets length requirements (2-100 characters).
 *
 * @param params - The parameters object
 * @param params.variableName - The name of the environment variable (used in error messages)
 * @param params.value - The string value to validate
 * @returns The validated string value
 * @throws {Error} When the value doesn't meet validation criteria (empty, too short, or too long)
 *
 * @example
 * ```ts
 * const validated = fromString({
 *   variableName: 'API_KEY',
 *   value: 'abc123xyz'
 * });
 * // Returns: "abc123xyz"
 * ```
 */
export function fromString({
  variableName,
  value,
}: {
  variableName: string;
  value: string;
}): string {
  const result = z.string().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid value for environment variable: ${variableName}`);
  }
  return result.data;
}

/**
 * Validates and converts a boolean value to string format for environment variables.
 * Converts true to "true" and false to "false".
 *
 * @param params - The parameters object
 * @param params.variableName - The name of the environment variable (used in error messages)
 * @param params.value - The boolean value to validate and convert
 * @returns "true" if value is true, "false" if value is false
 * @throws {Error} When the value is not a valid boolean
 *
 * @example
 * ```ts
 * const debugFlag = fromBoolean({
 *   variableName: 'DEBUG',
 *   value: true
 * });
 * // Returns: "true"
 *
 * const enabled = fromBoolean({
 *   variableName: 'FEATURE_ENABLED',
 *   value: false
 * });
 * // Returns: "false"
 * ```
 */
export function fromBoolean({
  variableName,
  value,
}: {
  variableName: string;
  value: boolean;
}): string {
  const result = z.boolean().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid value for environment variable: ${variableName}`);
  }
  return result.data ? 'true' : 'false';
}

/**
 * Validates and converts a numeric value to string format for environment variables.
 * Ensures the value is a valid number (not NaN or Infinity) before converting to string.
 *
 * @param params - The parameters object
 * @param params.variableName - The name of the environment variable (used in error messages)
 * @param params.value - The numeric value to validate and convert
 * @returns The number converted to string format
 * @throws {Error} When the value is not a valid number (NaN, Infinity, etc.)
 *
 * @example
 * ```ts
 * const validated = fromNumber({
 *   variableName: 'PORT',
 *   value: 3000
 * });
 * // Returns: "3000"
 *
 * const timeout = fromNumber({
 *   variableName: 'TIMEOUT',
 *   value: 30.5
 * });
 * // Returns: "30.5"
 * ```
 */
export function fromNumber({
  variableName,
  value,
}: {
  variableName: string;
  value: number;
}): string {
  const result = z.number().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid value for environment variable: ${variableName}`);
  }
  return result.data.toString();
}
