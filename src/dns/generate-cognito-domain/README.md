# Generate Cognito Domain

Generate proper Amazon Cognito User Pool domain URLs following AWS conventions for hosted UI and OAuth endpoints.

## Overview

The `generateCognitoDomain` function constructs fully qualified domain names for Amazon Cognito User Pools using the standard AWS Cognito domain format. These domains are used for Cognito's hosted UI, OAuth endpoints, and authentication flows.

## Usage

```ts
import { generateCognitoDomain } from '@leighton-digital/lambda-toolkit';

// Generate domain for US East region
const cognitoDomain = generateCognitoDomain({
  domainPrefix: 'my-app',
  region: 'us-east-1'
});
// Returns: 'my-app.auth.us-east-1.amazoncognito.com'

// Generate domain for EU region
const euCognito = generateCognitoDomain({
  domainPrefix: 'company-portal',
  region: 'eu-west-1'
});
// Returns: 'company-portal.auth.eu-west-1.amazoncognito.com'

// Stage-specific Cognito domains
const stagingCognito = generateCognitoDomain({
  domainPrefix: 'myapp-staging',
  region: 'us-east-1'
});
// Returns: 'myapp-staging.auth.us-east-1.amazoncognito.com'

// Development environment
const devCognito = generateCognitoDomain({
  domainPrefix: 'myapp-dev',
  region: 'us-west-2'
});
// Returns: 'myapp-dev.auth.us-west-2.amazoncognito.com'
```

## Function Signature

```ts
function generateCognitoDomain(params: GenerateCognitoDomainParams): string

interface GenerateCognitoDomainParams {
  domainPrefix: string;
  region: string;
}
```

## Parameters

- **`domainPrefix`** (string): The unique domain prefix for the Cognito User Pool (must be globally unique within the AWS region)
- **`region`** (string): The AWS region where the Cognito User Pool is deployed (e.g., 'us-east-1', 'eu-west-1')

## Return Value

Returns a string containing the complete Cognito domain URL in the format: `{domainPrefix}.auth.{region}.amazoncognito.com`

## Domain Prefix Requirements

- Must be **globally unique** within the AWS region
- Can contain **lowercase letters**, **numbers**, and **hyphens**
- Cannot start or end with a hyphen
- Must be between 3 and 63 characters long
- Cannot contain consecutive hyphens

## Common Usage Patterns

### Stage-Specific Domains

```ts
import { generateCognitoDomain } from '@leighton-digital/lambda-toolkit';

const generateStageSpecificCognitoDomain = (appName: string, stage: string, region: string) => {
  const domainPrefix = stage === 'prod' ? appName : `${appName}-${stage}`;

  return generateCognitoDomain({
    domainPrefix,
    region
  });
};

// Examples
const prodDomain = generateStageSpecificCognitoDomain('myapp', 'prod', 'us-east-1');
// Returns: 'myapp.auth.us-east-1.amazoncognito.com'

const devDomain = generateStageSpecificCognitoDomain('myapp', 'develop', 'us-east-1');
// Returns: 'myapp-develop.auth.us-east-1.amazoncognito.com'
```

## Integration Example

```ts
import { generateCognitoDomain } from '@leighton-digital/lambda-toolkit';
import {
  UserPool,
  UserPoolClient,
  UserPoolDomain
} from 'aws-cdk-lib/aws-cognito';

export class CognitoStack extends Stack {
  constructor(scope: Construct, id: string, props: {
    stage: string;
    appName: string;
  }) {
    super(scope, id, props);

    const { stage, appName } = props;

    // Generate Cognito domain
    const cognitoDomain = generateCognitoDomain({
      domainPrefix: stage === 'prod' ? appName : `${appName}-${stage}`,
      region: this.region
    });

    // Create User Pool
    const userPool = new UserPool(this, 'UserPool', {
      userPoolName: `${appName}-${stage}`,
      signInAliases: {
        email: true,
        username: true,
      },
      autoVerify: {
        email: true,
      },
    });

    // Create User Pool Client
    const userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
      userPool,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          'openid',
          'email',
          'profile',
        ],
        callbackUrls: [
          stage === 'prod'
            ? 'https://myapp.com/auth/callback'
            : `https://${stage}.myapp.com/auth/callback`
        ],
        logoutUrls: [
          stage === 'prod'
            ? 'https://myapp.com/auth/logout'
            : `https://${stage}.myapp.com/auth/logout`
        ],
      },
    });

    // Create Cognito Domain
    const domain = new UserPoolDomain(this, 'UserPoolDomain', {
      userPool,
      cognitoDomain: {
        domainPrefix: stage === 'prod' ? appName : `${appName}-${stage}`,
      },
    });

    // Output important URLs
    new CfnOutput(this, 'CognitoDomainUrl', {
      value: `https://${cognitoDomain}`,
      description: 'Cognito Hosted UI URL',
    });
  }
}
```

## OAuth URLs and Endpoints

```ts
import { generateCognitoDomain } from '@leighton-digital/lambda-toolkit';

const cognitoDomain = generateCognitoDomain({
  domainPrefix: 'myapp-prod',
  region: 'us-east-1'
});

// Common Cognito endpoints
const cognitoEndpoints = {
  hostedUI: `https://${cognitoDomain}`,
  login: `https://${cognitoDomain}/login`,
  logout: `https://${cognitoDomain}/logout`,
  oauth2Token: `https://${cognitoDomain}/oauth2/token`,
  oauth2Authorize: `https://${cognitoDomain}/oauth2/authorize`,
  oauth2UserInfo: `https://${cognitoDomain}/oauth2/userInfo`,
  jwks: `https://${cognitoDomain}/.well-known/jwks.json`,
  openidConfig: `https://${cognitoDomain}/.well-known/openid_configuration`,
};

// Use in OAuth configuration
const oauthConfig = {
  clientId: 'your-client-id',
  redirectUri: 'https://myapp.com/auth/callback',
  responseType: 'code',
  scope: 'openid email profile',

  // Cognito endpoints
  authUrl: cognitoEndpoints.oauth2Authorize,
  tokenUrl: cognitoEndpoints.oauth2Token,
  userInfoUrl: cognitoEndpoints.oauth2UserInfo,
  logoutUrl: cognitoEndpoints.logout,
};
```

## Environment Configuration

```ts
import { generateCognitoDomain } from '@leighton-digital/lambda-toolkit';

// Environment-based configuration
const config = {
  development: {
    domainPrefix: 'myapp-dev',
    region: 'us-east-1',
    callbackUrl: 'http://localhost:3000/auth/callback',
  },
  staging: {
    domainPrefix: 'myapp-staging',
    region: 'us-east-1',
    callbackUrl: 'https://staging.myapp.com/auth/callback',
  },
  production: {
    domainPrefix: 'myapp',
    region: 'us-east-1',
    callbackUrl: 'https://myapp.com/auth/callback',
  },
};

const currentStage = process.env.STAGE || 'development';
const stageConfig = config[currentStage];

const cognitoDomain = generateCognitoDomain({
  domainPrefix: stageConfig.domainPrefix,
  region: stageConfig.region
});

// Set environment variables
process.env.COGNITO_DOMAIN = cognitoDomain;
process.env.COGNITO_LOGIN_URL = `https://${cognitoDomain}/login`;
process.env.COGNITO_LOGOUT_URL = `https://${cognitoDomain}/logout`;
process.env.OAUTH_CALLBACK_URL = stageConfig.callbackUrl;
```

## Use Cases

- **Cognito Hosted UI**: Direct users to Cognito's built-in authentication interface
- **OAuth 2.0 Flows**: Implement OAuth authorization code grant flows
- **Single Sign-On (SSO)**: Configure enterprise SSO with SAML or OIDC
- **Social Identity Providers**: Set up Google, Facebook, Amazon login integration
- **JWT Token Validation**: Access JWKS endpoints for token verification
- **Multi-Environment Setup**: Maintain separate Cognito instances per deployment stage

## Features

- **AWS Standard Format**: Follows official AWS Cognito domain naming conventions
- **Global Uniqueness**: Ensures domain prefix uniqueness requirements are met
- **Multi-Region Support**: Works with any valid AWS region
- **Environment Separation**: Easy to create stage-specific domains
- **OAuth Ready**: Generated domains work immediately with OAuth 2.0 flows
- **Hosted UI Compatible**: Perfect for Cognito's built-in authentication interface
