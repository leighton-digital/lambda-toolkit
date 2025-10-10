/**
 * Parameters for generating a Cognito domain
 */
export interface GenerateCognitoDomainParams {
  domainPrefix: string;
  region: string;
}

/**
 * Generates an Amazon Cognito User Pool domain URL.
 *
 * This function constructs the fully qualified domain name for an Amazon Cognito User Pool
 * using the standard AWS Cognito domain format. The generated domain is used for
 * Cognito's hosted UI, OAuth endpoints, and authentication flows.
 *
 * @param params - The parameters object
 * @param params.domainPrefix - The unique domain prefix for the Cognito User Pool (must be globally unique within the region)
 * @param params.region - The AWS region where the Cognito User Pool is deployed (e.g., 'us-east-1', 'eu-west-1')
 *
 * @returns The complete Cognito domain URL in the format: `{domainPrefix}.auth.{region}.amazoncognito.com`
 *
 * @example
 * ```typescript
 * // Generate domain for US East region
 * generateCognitoDomain({ domainPrefix: 'my-app', region: 'us-east-1' })
 * // Returns: 'my-app.auth.us-east-1.amazoncognito.com'
 *
 * // Generate domain for EU West region
 * generateCognitoDomain({ domainPrefix: 'company-portal', region: 'eu-west-1' })
 * // Returns: 'company-portal.auth.eu-west-1.amazoncognito.com'
 *
 * // Generate domain for Asia Pacific region
 * generateCognitoDomain({ domainPrefix: 'staging-env', region: 'ap-southeast-2' })
 * // Returns: 'staging-env.auth.ap-southeast-2.amazoncognito.com'
 * ```
 *
 * @remarks
 * - The domain prefix must be globally unique within the AWS region
 * - Domain prefix can contain lowercase letters, numbers, and hyphens
 * - Domain prefix must be between 1-63 characters long
 * - The generated domain follows AWS Cognito's standard format
 * - This domain is used for OAuth flows, hosted UI, and SAML/OIDC endpoints
 *
 * @see {@link https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-assign-domain.html | AWS Cognito Custom Domains Documentation}
 *
 * @since 1.0.0
 */
export function generateCognitoDomain({
  domainPrefix,
  region,
}: GenerateCognitoDomainParams): string {
  return `${domainPrefix}.auth.${region}.amazoncognito.com`;
}
