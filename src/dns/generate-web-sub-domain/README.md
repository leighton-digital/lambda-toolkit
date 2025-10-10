# Generate Web Sub Domain

Generate web application subdomains with proper stage separation for different deployment environments.

## Overview

The `generateWebSubDomain` function creates stage-specific web subdomains for different deployment environments. Production uses the root domain with 'www' as the stage identifier, while other stages use stage-prefixed subdomains for clear environment separation.

## Usage

```ts
import { generateWebSubDomain } from '@leighton-digital/lambda-toolkit';

// Production uses root domain
const prodWeb = generateWebSubDomain({
  stageName: 'prod',
  domainName: 'example.com'
});
// Returns: { stage: 'www', subDomain: 'example.com' }

// Development environment
const devWeb = generateWebSubDomain({
  stageName: 'develop',
  domainName: 'example.com'
});
// Returns: { stage: 'develop', subDomain: 'develop.example.com' }

// Staging environment
const stagingWeb = generateWebSubDomain({
  stageName: 'staging',
  domainName: 'example.com'
});
// Returns: { stage: 'staging', subDomain: 'staging.example.com' }

// Custom feature branch
const featureWeb = generateWebSubDomain({
  stageName: 'feature-ui',
  domainName: 'example.com'
});
// Returns: { stage: 'feature-ui', subDomain: 'feature-ui.example.com' }
```

## Function Signature

```ts
function generateWebSubDomain(params: GenerateWebSubDomainParams): GenerateWebSubDomain

interface GenerateWebSubDomainParams {
  stageName: string;
  domainName: string;
}

interface GenerateWebSubDomain {
  stage: string;
  subDomain: string;
}
```

## Parameters

- **`stageName`** (string): The deployment stage name (e.g., 'prod', 'develop', 'staging', 'test')
- **`domainName`** (string): The base domain name to generate the web subdomain for

## Return Value

Returns an object with:
- **`stage`** (string): Stage identifier used for configuration (useful for conditionals)
- **`subDomain`** (string): Complete subdomain URL for the web application

## Naming Convention

| Stage Name | Stage Identifier | Generated Subdomain | Example |
|------------|------------------|-------------------|---------|
| `prod` | `www` | `{domain}` | `example.com` |
| `develop` | `develop` | `develop.{domain}` | `develop.example.com` |
| `staging` | `staging` | `staging.{domain}` | `staging.example.com` |
| `test` | `test` | `test.{domain}` | `test.example.com` |
| Custom | `{stage}` | `{stage}.{domain}` | `feature-ui.example.com` |

## Use Cases

- **CloudFront Distributions**: Set up stage-specific web application endpoints
- **Static Website Hosting**: Configure S3 bucket websites with custom domains
- **CDN Configuration**: Route traffic to appropriate web application instances
- **SSL Certificate Management**: Generate certificates for web application endpoints
- **Environment-Specific Builds**: Configure build processes with correct domain URLs

## Integration Example

```ts
import { generateWebSubDomain } from '@leighton-digital/lambda-toolkit';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

export class WebAppStack extends Stack {
  constructor(scope: Construct, id: string, props: { stage: string }) {
    super(scope, id, props);

    const webConfig = generateWebSubDomain({
      stageName: props.stage,
      domainName: 'mycompany.com'
    });

    const distribution = new Distribution(this, 'WebApp', {
      domainNames: [webConfig.subDomain],
      certificate: Certificate.fromCertificateArn(
        this,
        'Certificate',
        'arn:aws:acm:...'
      ),
      // Use stage identifier for conditional configuration
      ...(webConfig.stage === 'www' ? {
        // Production-specific configuration
        priceClass: PriceClass.PRICE_CLASS_ALL,
      } : {
        // Non-production configuration
        priceClass: PriceClass.PRICE_CLASS_100,
      }),
    });

    // Output the web URL
    new CfnOutput(this, 'WebUrl', {
      value: `https://${webConfig.subDomain}`,
      description: `${webConfig.stage} web application URL`,
    });
  }
}
```

## Environment Configuration Example

```ts
import { generateWebSubDomain } from '@leighton-digital/lambda-toolkit';

const stage = process.env.STAGE || 'develop';
const webConfig = generateWebSubDomain({
  stageName: stage,
  domainName: 'mycompany.com'
});

// Use in React/Vue/Angular build configuration
const buildConfig = {
  publicUrl: `https://${webConfig.subDomain}`,
  apiUrl: webConfig.stage === 'www'
    ? 'https://api.mycompany.com'
    : `https://api-${webConfig.stage}.mycompany.com`,
  environment: webConfig.stage === 'www' ? 'production' : webConfig.stage,
};
```

## Features

- **Production Optimization**: Uses root domain for production environments
- **Stage Identification**: Returns stage identifier for conditional logic
- **DNS Sanitization**: Ensures generated domains are DNS-compliant
- **Consistent Output**: Lowercase, sanitized domain strings
- **Environment Separation**: Clear distinction between deployment stages
- **Flexible Configuration**: Stage identifier enables environment-specific settings
