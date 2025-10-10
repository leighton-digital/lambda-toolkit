import { Stage } from '../../types';
import { sanitiseDnsString } from '../utils';
/**
 * Parameters for generating an API subdomain
 */
export interface GenerateApiSubDomainParams {
  stageName: string;
  domainName: string;
}

/**
 * Generates an API subdomain based on the stage name and domain name.
 *
 * This function creates stage-specific API subdomains for different deployment environments.
 * It follows a consistent naming convention where production uses 'api' directly,
 * while other stages include the stage name in the subdomain.
 *
 * @param params - The parameters object
 * @param params.stageName - The deployment stage name (e.g., 'prod', 'develop', 'staging', 'test')
 * @param params.domainName - The base domain name to append the API subdomain to
 *
 * @returns The generated API subdomain in lowercase format
 *
 * @example
 * ```typescript
 * // Production stage
 * generateApiSubDomain({ stageName: 'prod', domainName: 'example.com' })
 * // Returns: 'api.example.com'
 *
 * // Development stage
 * generateApiSubDomain({ stageName: 'develop', domainName: 'example.com' })
 * // Returns: 'api-develop.example.com'
 *
 * // Custom stage
 * generateApiSubDomain({ stageName: 'feature-123', domainName: 'example.com' })
 * // Returns: 'api-feature-123.example.com'
 * ```
 *
 * @remarks
 * - Production stage ('prod') gets the clean 'api.domain.com' format
 * - Known stages (develop, staging, test) get predictable 'api-{stage}.domain.com' format
 * - Unknown/custom stages follow the same pattern as known non-production stages
 * - All output is converted to lowercase for DNS compatibility
 *
 * @since 1.0.0
 */
export function generateApiSubDomain({
  stageName,
  domainName,
}: GenerateApiSubDomainParams): string {
  const sanitisedDomainName = sanitiseDnsString(domainName);
  const sanitisedStageName = sanitiseDnsString(stageName);
  const stageValue = stageName === Stage.prod ? '' : `-${sanitisedStageName}`;
  return `api${stageValue}.${sanitisedDomainName}`;
}
