/**
 * Removes specified internal keys from a DynamoDB item object.
 *
 * @template T - The type of the item object.
 * @param {T} item - The DynamoDB item object to strip keys from.
 * @param {(keyof T)[]} [keysToStrip] - The keys to remove from the object. Defaults to common internal keys.
 * @param {string[]} [extraKeysToStrip] - Additional keys to remove from the object.
 * @returns {Partial<T>} A shallow copy of the item without the specified keys.
 *
 * @example
 * const item = {
 *   pk: 'user#123',
 *   sk: 'profile',
 *   name: 'Alice',
 *   email: 'alice@example.com',
 *   customMeta: 'value'
 * };
 *
 * const cleaned = stripInternalKeys(item, undefined, ['customMeta']);
 * // Result: { name: 'Alice', email: 'alice@example.com' }
 */
export function stripInternalKeys<T extends object>(
  item: T,
  keysToStrip: (keyof T)[] = [
    'pk',
    'sk',
    'PK',
    'SK',
    'TTL',
    'ttl',
    'gsi1pk',
    'gsi1sk',
    'gsi2pk',
    'gsi2sk',
    'gsi3pk',
    'gsi3sk',
  ] as (keyof T)[],
  extraKeysToStrip: string[] = [],
): Partial<T> {
  const copy = { ...item };
  const allKeysToStrip = [
    ...keysToStrip,
    ...extraKeysToStrip.filter((k) => typeof k === 'string'),
  ];
  for (const key of allKeysToStrip) {
    if (key in copy) {
      delete copy[key as keyof T];
    }
  }
  return copy;
}
