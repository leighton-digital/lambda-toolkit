# Generate Auth Domain

Generate authentication subdomains for stage-specific authentication services and OAuth flows.

## Overview

The `generateAuthDomain` function creates stage-specific authentication subdomains for different deployment environments. It follows a consistent naming convention where production uses 'auth' directly, while other stages include the stage name in the subdomain for clear environment separation.

## Usage

```ts
import { generateAuthDomain } from '@leighton-digital/lambda-toolkit';

// Production auth domain
const prodAuth = generateAuthDomain({
  stageName: 'prod',
  domainName: 'example.com'
});
// Returns: { stage: 'www', subDomain: 'auth.example.com' }

// Development auth domain
const devAuth = generateAuthDomain({
  stageName: 'develop',
  domainName: 'example.com'
});
// Returns: { stage: 'develop', subDomain: 'auth-develop.example.com' }

// Staging auth domain
const stagingAuth = generateAuthDomain({
  stageName: 'staging',
  domainName: 'example.com'
});
// Returns: { stage: 'staging', subDomain: 'auth-staging.example.com' }

// Custom feature branch
const featureAuth = generateAuthDomain({
  stageName: 'feature-oauth',
  domainName: 'example.com'
});
// Returns: { stage: 'feature-oauth', subDomain: 'auth-feature-oauth.example.com' }
```

## Function Signature

```ts
function generateAuthDomain(params: GenerateAuthDomainParams): GenerateAuthDomain

interface GenerateAuthDomainParams {
  stageName: string;
  domainName: string;
}

interface GenerateAuthDomain {
  stage: string;
  subDomain: string;
}
```

## Parameters

- **`stageName`** (string): The deployment stage name (e.g., 'prod', 'develop', 'staging', 'test')
- **`domainName`** (string): The base domain name to generate the authentication subdomain for

## Return Value

Returns an object with:
- **`stage`** (string): Stage identifier used for configuration (useful for conditionals)
- **`subDomain`** (string): Complete authentication subdomain URL

## Naming Convention

| Stage Name | Stage Identifier | Generated Subdomain | Example |
|------------|------------------|-------------------|---------|
| `prod` | `www` | `auth.{domain}` | `auth.example.com` |
| `develop` | `develop` | `auth-develop.{domain}` | `auth-develop.example.com` |
| `staging` | `staging` | `auth-staging.{domain}` | `auth-staging.example.com` |
| `test` | `test` | `auth-test.{domain}` | `auth-test.example.com` |
| Custom | `{stage}` | `auth-{stage}.{domain}` | `auth-feature-oauth.example.com` |

## Use Cases

- **OAuth Callback URLs**: Set up stage-specific authentication callback endpoints
- **Identity Provider Configuration**: Configure SAML, OIDC, and OAuth providers
- **Authentication Service Endpoints**: Deploy authentication APIs with consistent naming
- **SSL Certificate Management**: Generate certificates for authentication endpoints
- **CORS Configuration**: Set up cross-origin policies for authentication flows

## Integration Example

```ts
import { generateAuthDomain } from '@leighton-digital/lambda-toolkit';
import { UserPool, UserPoolDomain } from 'aws-cdk-lib/aws-cognito';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

export class AuthStack extends Stack {
  constructor(scope: Construct, id: string, props: { stage: string }) {
    super(scope, id, props);

    const authConfig = generateAuthDomain({
      stageName: props.stage,
      domainName: 'mycompany.com'
    });

    const userPool = new UserPool(this, 'UserPool', {
      userPoolName: `MyApp-${authConfig.stage}`,
      // Stage-specific configuration
      ...(authConfig.stage === 'www' ? {
        // Production settings
        passwordPolicy: {
          minLength: 12,
          requireUppercase: true,
          requireDigits: true,
          requireSymbols: true,
        },
      } : {
        // Development settings
        passwordPolicy: {
          minLength: 8,
        },
      }),
    });

    // Custom domain for Cognito
    new UserPoolDomain(this, 'UserPoolDomain', {
      userPool,
      customDomain: {
        domainName: authConfig.subDomain,
        certificate: Certificate.fromCertificateArn(
          this,
          'AuthCertificate',
          'arn:aws:acm:...'
        ),
      },
    });

    // Output the auth URLs
    new CfnOutput(this, 'AuthDomain', {
      value: `https://${authConfig.subDomain}`,
      description: `${authConfig.stage} authentication domain`,
    });
  }
}
```

## OAuth Configuration Example

```ts
import { generateAuthDomain } from '@leighton-digital/lambda-toolkit';

const stage = process.env.STAGE || 'develop';
const authConfig = generateAuthDomain({
  stageName: stage,
  domainName: 'mycompany.com'
});

// OAuth provider configuration
const oauthConfig = {
  clientId: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  redirectUri: `https://${authConfig.subDomain}/oauth/callback`,
  scope: ['openid', 'profile', 'email'],

  // Stage-specific settings
  ...(authConfig.stage === 'www' ? {
    // Production OAuth settings
    issuer: 'https://accounts.google.com',
    audience: 'production-audience',
  } : {
    // Development OAuth settings
    issuer: 'https://accounts.google.com',
    audience: `${authConfig.stage}-audience`,
  }),
};

// CORS configuration for authentication endpoints
const corsConfig = {
  origin: authConfig.stage === 'www'
    ? ['https://mycompany.com', 'https://www.mycompany.com']
    : [`https://${authConfig.stage}.mycompany.com`],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

## Environment Variables Example

```ts
import { generateAuthDomain } from '@leighton-digital/lambda-toolkit';

// Generate environment-specific auth domain
const authConfig = generateAuthDomain({
  stageName: process.env.STAGE || 'develop',
  domainName: process.env.DOMAIN_NAME || 'localhost'
});

// Set environment variables for application
process.env.AUTH_DOMAIN = authConfig.subDomain;
process.env.AUTH_URL = `https://${authConfig.subDomain}`;
process.env.OAUTH_REDIRECT_URI = `https://${authConfig.subDomain}/oauth/callback`;
process.env.LOGOUT_URL = `https://${authConfig.subDomain}/logout`;

// Stage-specific configuration
if (authConfig.stage === 'www') {
  process.env.SESSION_COOKIE_DOMAIN = '.mycompany.com';
  process.env.RATE_LIMIT_ENABLED = 'true';
} else {
  process.env.SESSION_COOKIE_DOMAIN = `.${authConfig.stage}.mycompany.com`;
  process.env.RATE_LIMIT_ENABLED = 'false';
}
```

## Features

- **OAuth/OIDC Ready**: Perfect for authentication service endpoints
- **Stage-Aware Configuration**: Stage identifier enables environment-specific settings
- **Production Optimization**: Clean subdomain for production environments
- **DNS Sanitization**: Ensures generated domains are DNS-compliant
- **Consistent Output**: Lowercase, sanitized domain strings
- **Environment Separation**: Clear distinction between deployment stages
- **CORS Friendly**: Easy to configure cross-origin policies per environment
