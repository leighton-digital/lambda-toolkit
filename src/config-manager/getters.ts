import z from 'zod';

/**
 * Retrieves and validates multiple string environment variables.
 * Each variable is validated using the same criteria as getString.
 *
 * @param variableNames - The names of the environment variables to retrieve
 * @returns An array of validated string values from the environment variables
 * @throws {Error} When any environment variable is missing, empty, or doesn't meet validation criteria (1-1000 characters)
 *
 * @example
 * ```ts
 * // Environment: API_URL=https://api.example.com, DB_HOST=localhost
 * const [apiUrl, dbHost] = getStrings('API_URL', 'DB_HOST');
 * // Returns: ["https://api.example.com", "localhost"]
 * ```
 */
export function getStrings(...variableNames: string[]): string[] {
  return variableNames.map((varName) => getString(varName));
}

/**
 * Retrieves and validates multiple boolean environment variables.
 * Each variable is validated using the same criteria as getBoolean.
 * Accepts "true" or "false" values (case-insensitive) and converts them to boolean.
 *
 * @param variableNames - The names of the environment variables to retrieve
 * @returns An array of boolean values parsed from the environment variables
 * @throws {Error} When any environment variable is missing or not a valid boolean string
 *
 * @example
 * ```ts
 * // Environment: DEBUG=true, VERBOSE=FALSE, ENABLED=True
 * const [debug, verbose, enabled] = getBooleans('DEBUG', 'VERBOSE', 'ENABLED');
 * // Returns: [true, false, true]
 * ```
 */
export function getBooleans(...variableNames: string[]): boolean[] {
  return variableNames.map((varName) => getBoolean(varName));
}

/**
 * Retrieves and validates multiple numeric environment variables.
 * Each variable is validated using the same criteria as getNumber.
 * Parses string values to numbers and validates they're not NaN.
 *
 * @param variableNames - The names of the environment variables to retrieve
 * @returns An array of numeric values parsed from the environment variables
 * @throws {Error} When any environment variable is missing, not a valid number, or contains only whitespace
 *
 * @example
 * ```ts
 * // Environment: PORT=3000, TIMEOUT=30.5, MAX_CONNECTIONS=100
 * const [port, timeout, maxConnections] = getNumbers('PORT', 'TIMEOUT', 'MAX_CONNECTIONS');
 * // Returns: [3000, 30.5, 100]
 * ```
 */
export function getNumbers(...variableNames: string[]): number[] {
  return variableNames.map((varName) => getNumber(varName));
}

/**
 * Retrieves and validates multiple environment variables with automatic type detection.
 * Analyzes each environment variable value and returns the appropriate type (string, number, or boolean).
 * Reuses existing validation functions for consistency.
 *
 * Type detection rules:
 * - "true"/"false" (case-insensitive) → boolean
 * - Valid numeric strings → number
 * - Everything else → string
 *
 * @param variableNames - The names of the environment variables to retrieve
 * @returns An array of values with their automatically detected types
 * @throws {Error} When any environment variable is missing or empty
 *
 * @example
 * ```ts
 * // Environment: PORT=3000, DEBUG=true, API_URL=https://api.example.com
 * const [port, debug, apiUrl] = get('PORT', 'DEBUG', 'API_URL');
 * // Returns: [3000, true, "https://api.example.com"]
 * // Types: [number, boolean, string]
 * ```
 */
export function get(...variableNames: string[]): (string | number | boolean)[] {
  return variableNames.map((varName) => {
    // Try boolean first (most specific)
    try {
      return getBoolean(varName);
    } catch {
      // Not a boolean, continue to number
    }

    // Try number
    try {
      return getNumber(varName);
    } catch {
      // Not a number, continue to string
    }

    // Default to string (will throw if invalid)
    return getString(varName);
  });
}

/**
 * Retrieves and validates a string environment variable.
 *
 * @param variableName - The name of the environment variable to retrieve
 * @returns The validated string value from the environment variable
 * @throws {Error} When the environment variable is missing, empty, or doesn't meet validation criteria (1-1000 characters)
 *
 * @example
 * ```ts
 * // Environment: API_URL=https://api.example.com
 * const apiUrl = getString('API_URL');
 * // Returns: "https://api.example.com"
 * ```
 */
export function getString(variableName: string): string {
  const schema = z.string().min(1).max(1000);
  const result = schema.safeParse(process.env[variableName]);
  if (!result.success) {
    throw new Error(
      `Invalid environment variable: ${variableName}: ${result.error}`,
    );
  }
  return result.data;
}

/**
 * Retrieves and validates a boolean environment variable.
 * Accepts "true" or "false" values (case-insensitive) and converts them to boolean.
 *
 * @param variableName - The name of the environment variable to retrieve
 * @returns The boolean value parsed from the environment variable
 * @throws {Error} When the environment variable is missing or not a valid boolean string
 *
 * @example
 * ```ts
 * // Environment: DEBUG=true
 * const debug = getBoolean('DEBUG');
 * // Returns: true
 *
 * // Environment: ENABLED=FALSE
 * const enabled = getBoolean('ENABLED');
 * // Returns: false
 * ```
 */
export function getBoolean(variableName: string): boolean {
  const schema = z
    .string()
    .min(4)
    .max(5)
    .transform((val) => val.toLowerCase())
    .refine((val) => val === 'true' || val === 'false', {
      message: 'Must be "true" or "false"',
    })
    .transform((val) => val === 'true');

  const result = schema.safeParse(process.env[variableName]);
  if (!result.success) {
    throw new Error(
      `Invalid environment variable: ${variableName}: ${result.error}`,
    );
  }
  return result.data;
}

/**
 * Retrieves and validates a numeric environment variable.
 * Parses the string value to a number and validates it's not NaN.
 *
 * @param variableName - The name of the environment variable to retrieve
 * @returns The numeric value parsed from the environment variable
 * @throws {Error} When the environment variable is missing, not a valid number, or contains only whitespace
 *
 * @example
 * ```ts
 * // Environment: PORT=3000
 * const port = getNumber('PORT');
 * // Returns: 3000
 *
 * // Environment: TIMEOUT=30.5
 * const timeout = getNumber('TIMEOUT');
 * // Returns: 30.5
 * ```
 */
export function getNumber(variableName: string): number {
  const schema = z
    .string()
    .min(1)
    .max(10)
    .refine((val) => val.trim().length > 0, 'Must not be only whitespace')
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), {
      message: 'Must be a valid number',
    });

  const result = schema.safeParse(process.env[variableName]);
  if (!result.success) {
    throw new Error(
      `Invalid environment variable: ${variableName}: ${result.error}`,
    );
  }
  return result.data;
}
