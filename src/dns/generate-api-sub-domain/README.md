# Generate API Sub Domain

Generate stage-specific API subdomains with consistent naming conventions for different deployment environments.

## Overview

The `generateApiSubDomain` function creates consistent API subdomains across different deployment stages. It follows a specific naming convention where production uses a clean 'api' subdomain, while other stages include the stage name for environment separation.

## Usage

```ts
import { generateApiSubDomain } from '@leighton-digital/lambda-toolkit';

// Production uses clean 'api' subdomain
const prodApi = generateApiSubDomain({
  stageName: 'prod',
  domainName: 'example.com'
});
// Returns: 'api.example.com'

// Development environment
const devApi = generateApiSubDomain({
  stageName: 'develop',
  domainName: 'example.com'
});
// Returns: 'api-develop.example.com'

// Staging environment
const stagingApi = generateApiSubDomain({
  stageName: 'staging',
  domainName: 'example.com'
});
// Returns: 'api-staging.example.com'

// Custom feature branch
const featureApi = generateApiSubDomain({
  stageName: 'feature-auth',
  domainName: 'example.com'
});
// Returns: 'api-feature-auth.example.com'
```

## Function Signature

```ts
function generateApiSubDomain(params: GenerateApiSubDomainParams): string

interface GenerateApiSubDomainParams {
  stageName: string;
  domainName: string;
}
```

## Parameters

- **`stageName`** (string): The deployment stage name (e.g., 'prod', 'develop', 'staging', 'test')
- **`domainName`** (string): The base domain name to append the API subdomain to

## Return Value

Returns a string containing the complete API subdomain in lowercase format.

## Naming Convention

| Stage Name | Generated Subdomain | Example |
|------------|-------------------|---------|
| `prod` | `api.{domain}` | `api.example.com` |
| `develop` | `api-develop.{domain}` | `api-develop.example.com` |
| `staging` | `api-staging.{domain}` | `api-staging.example.com` |
| `test` | `api-test.{domain}` | `api-test.example.com` |
| Custom | `api-{stage}.{domain}` | `api-feature-auth.example.com` |

## Use Cases

- **API Gateway Custom Domains**: Set up stage-specific API endpoints
- **Load Balancer Configuration**: Route traffic to appropriate API instances
- **DNS Management**: Automate DNS record creation for different environments
- **SSL Certificate Management**: Generate certificates for API endpoints
- **CDK/CloudFormation**: Programmatically create infrastructure with consistent naming

## Integration Example

```ts
import { generateApiSubDomain } from '@leighton-digital/lambda-toolkit';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: { stage: string }) {
    super(scope, id, props);

    const apiDomain = generateApiSubDomain({
      stageName: props.stage,
      domainName: 'mycompany.com'
    });

    const api = new RestApi(this, 'MyApi', {
      domainName: {
        domainName: apiDomain,
        certificate: Certificate.fromCertificateArn(
          this,
          'Certificate',
          'arn:aws:acm:...'
        ),
      },
    });
  }
}
```

## Features

- **Stage-Aware Naming**: Automatically handles different stage naming conventions
- **DNS Sanitization**: Ensures generated domains are DNS-compliant
- **Consistent Output**: Lowercase, sanitized domain strings
- **Production Optimization**: Clean subdomain for production environments
- **Environment Separation**: Clear distinction between deployment stages
