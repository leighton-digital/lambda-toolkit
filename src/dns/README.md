# DNS Utilities

Domain name generation utilities for consistent subdomain creation across different deployment stages and AWS services.

## Overview

The DNS utilities module provides functions for generating consistent domain names and subdomains for different deployment environments and AWS services:

- **API Subdomains**: Generate stage-specific API subdomains with consistent naming
- **Web Subdomains**: Create web application subdomains with stage separation
- **Auth Domains**: Generate authentication subdomains for stage-specific auth services
- **Cognito Domains**: Create proper Amazon Cognito User Pool domain URLs

## API Subdomains

Generate stage-specific API subdomains with consistent naming conventions.

```ts
import { generateApiSubDomain } from '@leighton-digital/lambda-toolkit';

// Production uses clean 'api' subdomain
const prodApi = generateApiSubDomain({ stageName: 'prod', domainName: 'example.com' });
// Returns: 'api.example.com'

// Other stages include stage name
const devApi = generateApiSubDomain({ stageName: 'develop', domainName: 'example.com' });
// Returns: 'api-develop.example.com'

const stagingApi = generateApiSubDomain({ stageName: 'staging', domainName: 'example.com' });
// Returns: 'api-staging.example.com'

// Custom stages follow the same pattern
const featureApi = generateApiSubDomain({ stageName: 'feature-auth', domainName: 'example.com' });
// Returns: 'api-feature-auth.example.com'
```

### Supported Stages
- **Production (`prod`)**: `api.domain.com`
- **Development (`develop`)**: `api-develop.domain.com`
- **Staging (`staging`)**: `api-staging.domain.com`
- **Test (`test`)**: `api-test.domain.com`
- **Custom stages**: `api-{stage}.domain.com`

## Web Subdomains

Generate web application subdomains with proper stage separation.

```ts
import { generateWebSubDomain } from '@leighton-digital/lambda-toolkit';

// Production uses root domain
const prodWeb = generateWebSubDomain({ stageName: 'prod', domainName: 'example.com' });
// Returns: { stage: 'www', subDomain: 'example.com' }

// Development environment
const devWeb = generateWebSubDomain({ stageName: 'develop', domainName: 'example.com' });
// Returns: { stage: 'develop', subDomain: 'develop.example.com' }

// Staging environment
const stagingWeb = generateWebSubDomain({ stageName: 'staging', domainName: 'example.com' });
// Returns: { stage: 'staging', subDomain: 'staging.example.com' }

// Custom stages
const featureWeb = generateWebSubDomain({ stageName: 'feature-ui', domainName: 'example.com' });
// Returns: { stage: 'feature-ui', subDomain: 'feature-ui.example.com' }
```

### Return Object
The function returns an object with:
- **stage**: Stage identifier (useful for configuration)
- **subDomain**: Complete subdomain URL

### Naming Convention
- **Production (`prod`)**: Uses root domain with `www` as stage identifier
- **Other stages**: Uses `{stage}.domain.com` format

## Authentication Domains

Generate authentication subdomains for stage-specific authentication services.

```ts
import { generateAuthDomain } from '@leighton-digital/lambda-toolkit';

// Production auth domain
const prodAuth = generateAuthDomain({ stageName: 'prod', domainName: 'example.com' });
// Returns: { stage: 'www', subDomain: 'auth.example.com' }

// Development auth domain
const devAuth = generateAuthDomain({ stageName: 'develop', domainName: 'example.com' });
// Returns: { stage: 'develop', subDomain: 'auth-develop.example.com' }

// Custom stage auth domain
const featureAuth = generateAuthDomain({ stageName: 'feature-oauth', domainName: 'example.com' });
// Returns: { stage: 'feature-oauth', subDomain: 'auth-feature-oauth.example.com' }
```

### Use Cases
- Authentication service endpoints
- OAuth callback URLs
- Stage-specific authentication configurations
- Identity provider configurations

## Cognito Domains

Generate proper Amazon Cognito User Pool domain URLs following AWS conventions.

```ts
import { generateCognitoDomain } from '@leighton-digital/lambda-toolkit';

// Generate Cognito domain for US East
const cognitoDomain = generateCognitoDomain({ domainPrefix: 'my-app', region: 'us-east-1' });
// Returns: 'my-app.auth.us-east-1.amazoncognito.com'

// Generate for EU region
const euCognito = generateCognitoDomain({ domainPrefix: 'company-portal', region: 'eu-west-1' });
// Returns: 'company-portal.auth.eu-west-1.amazoncognito.com'

// Stage-specific Cognito domains
const stagingCognito = generateCognitoDomain({ domainPrefix: 'myapp-staging', region: 'us-east-1' });
// Returns: 'myapp-staging.auth.us-east-1.amazoncognito.com'
```

### Requirements
- **Domain prefix**: Must be globally unique within the AWS region
- **Region**: Valid AWS region identifier
- **Naming**: Can contain lowercase letters, numbers, and hyphens

## Complete Example

```ts
import {
  generateApiSubDomain,
  generateWebSubDomain,
  generateAuthDomain,
  generateCognitoDomain,
} from '@leighton-digital/lambda-toolkit';

const stage = 'develop';
const baseDomain = 'mycompany.com';
const region = 'us-east-1';

// Generate all domain types for a stage
const domains = {
  api: generateApiSubDomain({ stageName: stage, domainName: baseDomain }),
  // 'api-develop.mycompany.com'

  web: generateWebSubDomain({ stageName: stage, domainName: baseDomain }),
  // { stage: 'develop', subDomain: 'develop.mycompany.com' }

  auth: generateAuthDomain({ stageName: stage, domainName: baseDomain }),
  // { stage: 'develop', subDomain: 'auth-develop.mycompany.com' }

  cognito: generateCognitoDomain({ domainPrefix: `myapp-${stage}`, region }),
  // 'myapp-develop.auth.us-east-1.amazoncognito.com'
};

console.log('Stage domains:', domains);
```

## CDK Integration Example

```ts
import { Stack, StackProps } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  generateApiSubDomain,
  generateWebSubDomain,
  generateCognitoDomain,
} from '@leighton-digital/lambda-toolkit';

export class MyAppStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps & {
    stage: string;
    baseDomain: string;
  }) {
    super(scope, id, props);

    const { stage, baseDomain } = props;

    // Generate consistent domain names
    const apiDomain = generateApiSubDomain({ stageName: stage, domainName: baseDomain });
    const webConfig = generateWebSubDomain({ stageName: stage, domainName: baseDomain });
    const cognitoDomain = generateCognitoDomain({ domainPrefix: `myapp-${stage}`, region: this.region });

    // Use in CDK constructs
    const certificate = Certificate.fromCertificateArn(
      this,
      'Certificate',
      `arn:aws:acm:${this.region}:${this.account}:certificate/...`
    );

    // API Gateway custom domain
    const api = new RestApi(this, 'Api', {
      domainName: {
        domainName: apiDomain,
        certificate,
      },
    });

    // CloudFront distribution for web app
    const distribution = new Distribution(this, 'WebApp', {
      domainNames: [webConfig.subDomain],
      certificate,
    });
  }
}
```

## Best Practices

- **Consistency**: Use the same stage names across all domain generation functions
- **Uniqueness**: Ensure Cognito domain prefixes are unique within your AWS region
- **DNS Validation**: Validate generated domains against your DNS requirements
- **Certificate Management**: Ensure SSL certificates cover all generated subdomains
- **Stage Naming**: Use consistent, lowercase stage names for DNS compatibility
