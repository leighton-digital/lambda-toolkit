import { Stage } from '../../types';
import { sanitiseDnsString } from '../utils';

/**
 * Result object for web subdomain generation.
 *
 * @interface GenerateWebSubDomain
 */
export interface GenerateWebSubDomain {
  /** The stage identifier used for the subdomain configuration */
  stage: string;
  /** The complete subdomain including the base domain name */
  subDomain: string;
}

/**
 * Parameters for generating a web subdomain
 */
export interface GenerateWebSubDomainParams {
  stageName: string;
  domainName: string;
}

/**
 * Generates a web subdomain configuration based on the stage name and domain name.
 *
 * This function creates stage-specific web subdomains for different deployment environments.
 * Production uses the root domain (with 'www' as the stage identifier), while other stages
 * use stage-prefixed subdomains for clear environment separation.
 *
 * @param params - The parameters object
 * @param params.stageName - The deployment stage name (e.g., 'prod', 'develop', 'staging', 'test')
 * @param params.domainName - The base domain name to generate the subdomain for
 *
 * @returns An object containing both the stage identifier and the complete subdomain
 *
 * @example
 * ```typescript
 * // Production stage - uses root domain
 * generateWebSubDomain({ stageName: 'prod', domainName: 'example.com' })
 * // Returns: { stage: 'www', subDomain: 'example.com' }
 *
 * // Development stage
 * generateWebSubDomain({ stageName: 'develop', domainName: 'example.com' })
 * // Returns: { stage: 'develop', subDomain: 'develop.example.com' }
 *
 * // Staging stage
 * generateWebSubDomain({ stageName: 'staging', domainName: 'example.com' })
 * // Returns: { stage: 'staging', subDomain: 'staging.example.com' }
 *
 * // Custom stage
 * generateWebSubDomain({ stageName: 'feature-123', domainName: 'example.com' })
 * // Returns: { stage: 'feature-123', subDomain: 'feature-123.example.com' }
 * ```
 *
 * @remarks
 * - Production stage ('prod') returns the root domain without prefix
 * - Known stages (develop, staging) get predictable '{stage}.domain.com' format
 * - Unknown/custom stages follow the same pattern as known non-production stages
 * - Custom stage names are converted to lowercase for consistency
 * - The stage field can be used for configuration or identification purposes
 *
 * @since 1.0.0
 */
export function generateWebSubDomain({
  stageName,
  domainName,
}: GenerateWebSubDomainParams): GenerateWebSubDomain {
  const sanitisedDomainName = sanitiseDnsString(domainName);
  const sanitisedStageName = sanitiseDnsString(stageName);

  const stageValue = stageName === Stage.prod ? 'www' : sanitisedStageName;
  const subDomain =
    stageName === Stage.prod
      ? sanitisedDomainName
      : `${sanitisedStageName}.${sanitisedDomainName}`;

  return {
    stage: stageValue,
    subDomain,
  };
}
