/**
 * Sanitises a DNS string by trimming whitespace, removing internal spaces, and converting to lowercase.
 *
 * This function ensures that the input string is properly formatted for use in DNS contexts
 * by removing any extraneous whitespace and normalizing the case.
 *
 * @param dnsString - The DNS string to sanitise
 * @returns The sanitised DNS string with whitespace removed and converted to lowercase
 *
 * @example
 * ```typescript
 * sanitiseDnsString('  My Domain Name  ') // Returns 'mydomainname'
 * sanitiseDnsString('API Gateway') // Returns 'apigateway'
 * ```
 */
export function sanitiseDnsString(dnsString: string): string {
  return dnsString.trim().replace(/\s+/g, '').toLowerCase();
}
