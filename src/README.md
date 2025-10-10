# Core Utilities

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/leighton-digital/lambda-toolkit/blob/main/LICENSE)
![Maintained](https://img.shields.io/maintenance/yes/2025)

A comprehensive collection of utilities designed for **AWS Lambda functions** and **CDK infrastructure**, providing essential functionality for building robust serverless applications.

## Library Structure

This package is organized into focused modules that provide specific functionality:

### [Core Utilities](./core/README.md)
Essential building blocks for Lambda functions including logging, date utilities, and schema validation.

- **Logging**: Structured logging with AWS Lambda Powertools integration
- **Date Utils**: Consistent ISO 8601 timestamp generation
- **Schema Validation**: Zod-based schema validation with error handling

### [DNS Utilities](./dns/README.md)
Domain name generation utilities for consistent subdomain creation across different deployment stages.

- **API Subdomains**: Generate stage-specific API subdomains
- **Auth Domains**: Create authentication domain names
- **Cognito Domains**: Generate Cognito-specific domain names
- **Web Subdomains**: Create web application subdomains

### [DynamoDB Utilities](./dynamodb/README.md)
Helper functions for working with DynamoDB data and cleaning internal keys.

- **Strip Internal Keys**: Remove DynamoDB internal keys from items

### [Lambda Utilities](./lambda/README.md)
HTTP handling, error management, and middleware for Lambda functions.

- **HTTP Handler**: Complete wrapper with observability and error handling
- **Error Handler**: Standardized HTTP error responses
- **Headers**: Stage-specific security and CORS headers

## Quick Start

### Basic HTTP Handler
```ts
import { withHttpHandler } from '@leighton-digital/lambda-toolkit';

export const handler = withHttpHandler(async ({ event, metrics, stage }) => {
  metrics.addMetric('RequestCount', MetricUnits.Count, 1);

  return {
    statusCode: 200,
    body: { message: `Hello from ${stage}!` },
  };
});
```

### Schema Validation
```ts
import { validateSchema } from '@leighton-digital/lambda-toolkit';
import { z } from 'zod';

// Schema validation with Zod
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0),
});

const userData = { name: 'Alice', email: 'alice@example.com', age: 30 };
const validData = validateSchema(userSchema, userData); // Returns validated data
```

### DynamoDB Utilities
```ts
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';

const dynamoItem = {
  pk: 'USER#123',
  sk: 'PROFILE',
  name: 'Alice',
  email: 'alice@example.com',
  gsi1pk: 'EMAIL#alice@example.com',
};

const cleanItem = stripInternalKeys(dynamoItem);
// Result: { name: 'Alice', email: 'alice@example.com' }
```

### DNS Generation
```ts
import { generateApiSubDomain, generateWebSubDomain } from '@leighton-digital/lambda-toolkit';

const apiDomain = generateApiSubDomain({ stageName: 'prod', domainName: 'example.com' });
// Result: 'api.example.com'

const webDomain = generateWebSubDomain({ stageName: 'develop', domainName: 'example.com' });
// Result: { stage: 'develop', subDomain: 'develop.example.com' }
```

## Installation

```bash
npm install @leighton-digital/lambda-toolkit
```

## Dependencies

### Required
- `@middy/core` - Lambda middleware framework
- `zod` - Schema validation

### Peer Dependencies
- `@aws-lambda-powertools/logger` - Structured logging
- `@aws-lambda-powertools/metrics` - Custom metrics
- `@aws-lambda-powertools/tracer` - Distributed tracing

## Key Features

- **Type Safety**: Full TypeScript support with strict typing
- **Observability**: Built-in logging, metrics, and tracing
- **Error Handling**: Standardized HTTP error responses
- **Security**: Stage-specific headers and CORS policies
- **Validation**: Comprehensive input validation with helpful error messages
