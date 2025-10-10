import { Stage } from '../../types';
import { sanitiseDnsString } from '../utils';

/**
 * Result object for authentication domain generation.
 *
 * @interface GenerateAuthDomain
 */
export interface GenerateAuthDomain {
  /** The stage identifier used for the authentication domain configuration */
  stage: string;
  /** The complete authentication subdomain including the base domain name */
  subDomain: string;
}

/**
 * Parameters for generating an authentication domain
 */
export interface GenerateAuthDomainParams {
  stageName: string;
  domainName: string;
}

/**
 * Generates an authentication subdomain configuration based on the stage name and domain name.
 *
 * This function creates stage-specific authentication subdomains for different deployment environments.
 * It follows a consistent naming convention where production uses 'auth' directly,
 * while other stages include the stage name in the subdomain for clear environment separation.
 *
 * @param params - The parameters object
 * @param params.stageName - The deployment stage name (e.g., 'prod', 'develop', 'staging', 'test')
 * @param params.domainName - The base domain name to generate the authentication subdomain for
 *
 * @returns An object containing both the stage identifier and the complete authentication subdomain
 *
 * @example
 * ```typescript
 * // Production stage
 * generateAuthDomain({ stageName: 'prod', domainName: 'example.com' })
 * // Returns: { stage: 'www', subDomain: 'auth.example.com' }
 *
 * // Development stage
 * generateAuthDomain({ stageName: 'develop', domainName: 'example.com' })
 * // Returns: { stage: 'develop', subDomain: 'auth-develop.example.com' }
 *
 * // Staging stage
 * generateAuthDomain({ stageName: 'staging', domainName: 'example.com' })
 * // Returns: { stage: 'staging', subDomain: 'auth-staging.example.com' }
 *
 * // Custom stage
 * generateAuthDomain({ stageName: 'feature-123', domainName: 'example.com' })
 * // Returns: { stage: 'feature-123', subDomain: 'auth-feature-123.example.com' }
 * ```
 *
 * @remarks
 * - Production stage ('prod') gets the clean 'auth.domain.com' format but returns 'www' as stage
 * - Known stages (develop, staging) get predictable 'auth-{stage}.domain.com' format
 * - Unknown/custom stages follow the same pattern as known non-production stages
 * - Custom stage names and subdomains are converted to lowercase for DNS compatibility
 * - The stage field can be used for configuration or identification purposes
 * - These domains are typically used for authentication services, OAuth endpoints, or login pages
 *
 * @since 1.0.0
 */
export function generateAuthDomain({
  stageName,
  domainName,
}: GenerateAuthDomainParams): GenerateAuthDomain {
  const sanitisedDomainName = sanitiseDnsString(domainName);
  const sanitisedStageName = sanitiseDnsString(stageName);

  const subValue = stageName === Stage.prod ? '' : `-${sanitisedStageName}`;
  const stageValue = stageName === Stage.prod ? 'www' : sanitisedStageName;

  return {
    subDomain: `auth${subValue}.${sanitisedDomainName}`,
    stage: stageValue,
  };
}
