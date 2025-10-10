<img width="50px" height="50px" align="right" alt="Lambda Toolkit Logo" src="https://raw.githubusercontent.com/leighton-digital/lambda-toolkit/refs/heads/main/images/lambda-toolkit-logo.png" title="Leighton Lambda Toolkit" sanitize="true" />

# Lambda Toolkit

**Lambda Toolkit** is an open-source collection of utility functions designed to help teams write production-ready application code, for deployment to AWS Lambda, faster.

Read more in the docs here: [Lambda Toolkit Docs](https://leighton-digital.github.io/lambda-toolkit/)

## Features

- **Core Utilities**: Logging, date utilities, schema validation, metrics, and tracing
- **Lambda HTTP Handler**: Complete wrapper with observability and error handling
- **DNS Utilities**: Domain name generation for consistent subdomain creation
- **DynamoDB Utilities**: Helper functions for cleaning internal keys from items
- **Config Manager**: Type-safe environment variable handling with validation
- **Error Classes**: Built-in error classes for consistent HTTP error responses

## Installation

```bash
npm install @leighton-digital/lambda-toolkit
```

## Usage

### Importing the Package

All utilities are available from the main package import:

```ts
import {
  // Core utilities
  logger,
  tracer,
  metrics,
  getISOString,
  validateSchema,

  // Lambda utilities
  withHttpHandler,

  // DNS utilities
  generateApiSubDomain,
  generateWebSubDomain,
  generateAuthDomain,
  generateCognitoDomain,
  sanitiseDnsString,

  // DynamoDB utilities
  stripInternalKeys,

  // Config manager
  envVar,

  // Error classes
  ValidationError,
  ResourceNotFoundError,
  UnauthorisedError,
  ForbiddenError,
  ConflictError,
  TooManyRequestsError
} from '@leighton-digital/lambda-toolkit';
```

### Basic HTTP Handler Example

Here's a complete example showing how to use the HTTP handler with validation and error handling:

```ts
import {
  withHttpHandler,
  validateSchema,
  ValidationError,
  ResourceNotFoundError,
  logger
} from '@leighton-digital/lambda-toolkit';
import { z } from 'zod';

// Define request schema
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(18).max(120),
});

export const handler = withHttpHandler(async ({ event }) => {
  const { userId } = event.pathParameters || {};

  if (event.httpMethod === 'POST') {
    // Create user
    const body = JSON.parse(event.body || '{}');
    const validatedUser = validateSchema(createUserSchema, body);

    logger.info('Creating user', { email: validatedUser.email });

    // Your business logic here...
    const newUser = { id: 'user123', ...validatedUser };

    return {
      statusCode: 201,
      body: { message: 'User created successfully', user: newUser },
    };
  }

  if (event.httpMethod === 'GET' && userId) {
    // Get user
    logger.info('Fetching user', { userId });

    // Your business logic here...
    const user = await getUserById(userId);
    if (!user) {
      throw new ResourceNotFoundError(`User ${userId} not found`);
    }

    return {
      statusCode: 200,
      body: { user },
    };
  }

  throw new ValidationError('Invalid request method or missing parameters');
});

async function getUserById(id: string) {
  // Mock implementation
  return id === 'user123' ? { id, name: 'Alice', email: 'alice@example.com' } : null;
}
```

### Config Manager Example

Use the config manager for type-safe environment variable handling:

```ts
import { envVar, withHttpHandler, logger } from '@leighton-digital/lambda-toolkit';

// Validate configuration at module load time
const config = {
  apiUrl: envVar.getString('API_URL'),
  enableDebug: envVar.getBoolean('ENABLE_DEBUG'),
  maxRetries: envVar.getNumber('MAX_RETRIES'),
  timeout: envVar.getNumber('TIMEOUT_MS'),
};

export const handler = withHttpHandler(async ({ event }) => {
  logger.info('Handler configuration', {
    apiUrl: config.apiUrl,
    enableDebug: config.enableDebug,
    maxRetries: config.maxRetries,
    timeout: config.timeout,
  });

  // Your business logic here...

  return {
    statusCode: 200,
    body: { message: 'Configuration loaded successfully', config },
  };
});
```

### DNS Utilities Example

Generate consistent domain names for different environments:

```ts
import {
  generateApiSubDomain,
  generateWebSubDomain,
  generateAuthDomain,
  generateCognitoDomain
} from '@leighton-digital/lambda-toolkit';

const stage = 'develop';
const domainName = 'example.com';

// API subdomain
const apiDomain = generateApiSubDomain({ stageName: stage, domainName });
// Returns: 'api-develop.example.com' (or 'api.example.com' for prod)

// Web subdomain
const webDomain = generateWebSubDomain({ stageName: stage, domainName });
// Returns: { stage: 'develop', subDomain: 'develop.example.com' }

// Auth domain
const authDomain = generateAuthDomain({ stageName: stage, domainName });
// Returns: { stage: 'develop', authDomain: 'auth-develop.example.com' }

// Cognito domain
const cognitoDomain = generateCognitoDomain({
  stageName: stage,
  domainName,
  serviceName: 'myapp'
});
// Returns: 'https://myapp-develop.auth.us-east-1.amazoncognito.com'
```

### DynamoDB Utilities Example

Clean internal keys from DynamoDB items before returning them:

```ts
import { stripInternalKeys, withHttpHandler } from '@leighton-digital/lambda-toolkit';

export const handler = withHttpHandler(async ({ event }) => {
  // Mock DynamoDB item with internal keys
  const dynamoItem = {
    pk: 'USER#123',
    sk: 'PROFILE',
    gsi1pk: 'EMAIL#alice@example.com',
    gsi1sk: 'USER#123',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 30,
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  // Strip internal DynamoDB keys
  const cleanItem = stripInternalKeys(dynamoItem);
  // Result: { name: 'Alice Johnson', email: 'alice@example.com', age: 30, createdAt: '...' }

  return {
    statusCode: 200,
    body: { user: cleanItem },
  };
});
```

## Running Tests

To run the tests:

```bash
pnpm test
```

## Development

To build the package:

```bash
pnpm build
```

To run linting:

```bash
pnpm lint
```

To format code:

```bash
pnpm format
```

## Dependencies

### Required
- `@middy/core` - Lambda middleware framework
- `@middy/http-error-handler` - HTTP error handling middleware
- `http-errors` - HTTP error utilities
- `zod` - Schema validation

### Peer Dependencies
- `@aws-lambda-powertools/logger` - Structured logging
- `@aws-lambda-powertools/metrics` - Custom metrics
- `@aws-lambda-powertools/tracer` - Distributed tracing
- `aws-cdk-lib` - AWS CDK library (for types)
- `aws-lambda` - AWS Lambda types
- `constructs` - CDK constructs (for types)

## Key Features

- **Type Safety**: Full TypeScript support with strict typing
- **Observability**: Built-in logging, metrics, and tracing with AWS Lambda Powertools
- **Error Handling**: Standardized HTTP error responses with proper status codes
- **Validation**: Comprehensive input validation with Zod schemas and helpful error messages
- **DNS Management**: Consistent domain name generation across environments
- **Environment Configuration**: Type-safe environment variable handling

## License

MIT License - see the [LICENSE](./LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

---

<img src="https://raw.githubusercontent.com/leighton-digital/lambda-toolkit/2578cda7dfd2a63e61912c1289d06f45f357616f/images/leighton-logo.svg" width="200" sanitize="true" />
