# Core Utilities

Essential building blocks for Lambda functions providing logging, date utilities, schema validation, metrics, and tracing.

## Overview

The core utilities module provides foundational functionality that most Lambda functions need:

- **Logging**: Structured logging with AWS Lambda Powertools integration
- **Date Utilities**: Consistent ISO 8601 timestamp generation
- **Schema Validation**: Zod-based schema validation with comprehensive error handling
- **Metrics**: CloudWatch metrics collection with AWS Lambda Powertools integration
- **Tracing**: X-Ray tracing with AWS Lambda Powertools integration

## Logging

Provides a singleton AWS Lambda Powertools Logger instance with consistent configuration.

```ts
import { logger } from '@leighton-digital/lambda-toolkit';

// Basic logging
logger.info('Processing request', { userId: 'user123' });
logger.error('Failed to process', { error: error.message });

// Within Lambda context (with HTTP handler)
export const handler = withHttpHandler(async ({ event }) => {
  logger.info('Handler invoked', {
    path: event.path,
    method: event.httpMethod,
  });

  return { statusCode: 200, body: { success: true } };
});
```

## Date Utilities

Consistent UTC timestamp generation in ISO 8601 format.

```ts
import { getISOString } from '@leighton-digital/lambda-toolkit';

const timestamp = getISOString();
// Returns: "2025-10-02T14:30:45.123Z"

// Use in data objects
const userRecord = {
  id: 'user123',
  name: 'Alice Johnson',
  createdAt: getISOString(),
  updatedAt: getISOString(),
};
```

## Schema Validation

Zod-based schema validation with detailed error handling and type safety.

### Basic Validation

```ts
import { validateSchema } from '@leighton-digital/lambda-toolkit';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().min(0).max(120),
});

const userData = {
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
};

try {
  const validUser = validateSchema(userSchema, userData);
  // validUser is fully typed and validated
  console.log('Valid user:', validUser);
} catch (error) {
  // ValidationError with detailed Zod error information
  console.error('Validation failed:', error.message);
}
```

### Advanced Schema Example

```ts
import { validateSchema } from '@leighton-digital/lambda-toolkit';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(18).max(120),
  preferences: z.object({
    newsletter: z.boolean().default(false),
    language: z.enum(['en', 'es', 'fr']).default('en'),
  }).optional(),
  tags: z.array(z.string()).default([]),
});

// In Lambda handler
export const handler = withHttpHandler(async ({ event }) => {
  const body = JSON.parse(event.body || '{}');

  // Validates and returns typed data
  const validatedUser = validateSchema(createUserSchema, body);

  // validatedUser has proper TypeScript types
  const { name, email, age, preferences, tags } = validatedUser;

  return {
    statusCode: 201,
    body: {
      message: 'User created',
      user: validatedUser,
    },
  };
});
```

## Metrics

CloudWatch metrics collection with AWS Lambda Powertools integration.

```ts
import { metrics } from '@leighton-digital/lambda-toolkit';
import { MetricUnits } from '@aws-lambda-powertools/metrics';

// Add custom metrics
metrics.addMetric('UserCreated', MetricUnits.Count, 1);
metrics.addMetric('ProcessingTime', MetricUnits.Milliseconds, 150);

// Within Lambda context
export const handler = withHttpHandler(async ({ event }) => {
  metrics.addMetric('FunctionInvocation', MetricUnits.Count, 1);

  // Your business logic here

  return { statusCode: 200, body: { success: true } };
});
```

## Tracing

X-Ray distributed tracing with AWS Lambda Powertools integration.

```ts
import { tracer } from '@leighton-digital/lambda-toolkit';

// Add annotations and metadata
tracer.putAnnotation('userId', 'user123');
tracer.putMetadata('requestDetails', {
  source: 'api-gateway',
  version: '1.0.0'
});

// Create custom subsegments
const subsegment = tracer.getSegment()?.addNewSubsegment('database-call');
try {
  // Database operation
  subsegment?.close();
} catch (error) {
  subsegment?.addError(error as Error);
  subsegment?.close();
}
```

## Error Handling

All validation errors are thrown as `ValidationError` instances with detailed information:

```ts
import { ValidationError } from '@leighton-digital/lambda-toolkit/errors';

try {
  const result = validateSchema(schema, invalidData);
} catch (error) {
  if (error instanceof ValidationError) {
    // Contains detailed Zod validation errors
    console.error('Validation failed:', error.message);
    console.error('Details:', error.details);
  }
}
```

## Best Practices

- **Logging**: Include contextual information in log messages for better observability
- **Schema Validation**: Use descriptive schema constraints and provide meaningful error messages
- **Date Handling**: Always use `getISOString()` for consistent timestamp formatting across your application
- **Type Safety**: Leverage TypeScript types generated by Zod schemas for compile-time safety
- **Metrics**: Add meaningful business metrics to track application performance and usage
- **Tracing**: Use annotations and metadata to enhance observability and debugging capabilities
