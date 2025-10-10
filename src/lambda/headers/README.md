# Headers

Stage-specific security and CORS headers with environment-aware configurations for AWS Lambda functions.

## Overview

The `getHeaders` function provides a comprehensive set of security headers and CORS configurations that adapt based on the deployment stage. It includes Content Security Policy, HSTS, XSS protection, and stage-specific CORS settings.

## Usage

```ts
import { getHeaders } from '@leighton-digital/lambda-toolkit';

// Get headers for specific stage
const devHeaders = getHeaders('develop');
const prodHeaders = getHeaders('prod');

// Manual header application (usually not needed with withHttpHandler)
return {
  statusCode: 200,
  headers: getHeaders('develop'),
  body: { message: 'Success' },
};
```

## Function Signature

```ts
function getHeaders(stage: string): Record<string, string | boolean>
function getHeaders(overrides?: Record<string, string | boolean>): Record<string, string | boolean>
```

## Parameters

- **`stage`** (string, optional): Deployment stage name for stage-specific configurations
- **`overrides`** (object, optional): Custom headers to override or add to the default set

## Return Value

Returns an object containing HTTP headers with security and CORS configurations.

## Default Security Headers

All stages include these security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Type` | `application/json` | Response content type |
| `Content-Security-Policy` | `default-src 'self'` | Prevent XSS attacks |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS protection |
| `Referrer-Policy` | `no-referrer` | Hide referrer information |
| `Permissions-Policy` | `geolocation=(), microphone=()` | Disable sensitive APIs |

## Stage-Specific CORS Headers

### Development Stage (`develop`)

```json
{
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
}
```

### Production Stages (`prod`, `staging`)

```json
{
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": true
}
```

Note: Production stages **do not** include `Access-Control-Allow-Origin: "*"` for enhanced security.

## Usage Examples

### Stage-Specific Headers

```ts
import { getHeaders } from '@leighton-digital/lambda-toolkit';

export const apiHandler = async (event) => {
  const stage = process.env.STAGE || 'develop';

  // Process request...

  return {
    statusCode: 200,
    headers: getHeaders(stage),
    body: JSON.stringify({ success: true }),
  };
};
```

### Custom Header Overrides

```ts
import { getHeaders } from '@leighton-digital/lambda-toolkit';

const customHeaders = getHeaders({
  'Access-Control-Allow-Origin': 'https://myapp.com',
  'Cache-Control': 'max-age=3600',
  'X-Custom-Header': 'my-value',
});

return {
  statusCode: 200,
  headers: customHeaders,
  body: { data: 'response' },
};
```

### Environment-Specific Configuration

```ts
import { getHeaders } from '@leighton-digital/lambda-toolkit';

export const configureHeaders = (stage: string, customOrigin?: string) => {
  const baseHeaders = getHeaders(stage);

  // Override CORS origin for specific environments
  if (customOrigin && stage !== 'develop') {
    return {
      ...baseHeaders,
      'Access-Control-Allow-Origin': customOrigin,
    };
  }

  return baseHeaders;
};

// Usage
const headers = configureHeaders('prod', 'https://myapp.com');
```

## Integration with HTTP Handler

When using `withHttpHandler`, headers are automatically applied:

```ts
import { withHttpHandler } from '@leighton-digital/lambda-toolkit';

export const handler = withHttpHandler(async ({ event }) => {
  // Headers are automatically applied based on STAGE environment variable
  return {
    statusCode: 200,
    body: { message: 'Headers applied automatically' },
  };
});
```

## Supported Stages

| Stage | CORS Origin | Security Level |
|-------|-------------|----------------|
| `develop` | `*` (wildcard) | Development-friendly |
| `staging` | Not set | Production-like |
| `prod` | Not set | Production |
| Others | `*` (wildcard) | Defaults to development |

## Best Practices

### Security Considerations

- **Production environments** should specify exact origins instead of wildcards
- **HTTPS-only** headers are enforced in all environments
- **Content Security Policy** prevents most XSS attacks
- **Frame protection** prevents clickjacking attacks

### CORS Configuration

- **Development**: Permissive CORS for local testing
- **Production**: Restrict origins to specific domains
- **Credentials**: Always handle credentials securely

### Custom Headers

```ts
// Example: API key validation header
const headers = getHeaders({
  'X-API-Version': 'v1',
  'X-Rate-Limit-Remaining': '100',
  'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining',
});
```

## Features

- **Stage-Aware Configuration**: Automatic CORS settings based on environment
- **Comprehensive Security**: Full suite of security headers included
- **Flexible Overrides**: Easy customization for specific needs
- **Production-Ready**: Secure defaults for production environments
- **Development-Friendly**: Permissive settings for local development
- **Type Safety**: Full TypeScript support for header configurations
