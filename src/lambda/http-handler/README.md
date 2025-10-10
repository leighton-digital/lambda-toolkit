# HTTP Handler

Comprehensive wrapper for AWS Lambda functions with built-in observability, error handling, and security middleware.

## Overview

The `withHttpHandler` function wraps Lambda handler functions with a complete middleware stack that includes AWS Lambda Powertools integration, error handling, security headers, and JSON response serialization.

## Usage

```ts
import { withHttpHandler } from '@leighton-digital/lambda-toolkit';
import { MetricUnits } from '@aws-lambda-powertools/metrics';

export const handler = withHttpHandler(async ({ event, metrics, stage }) => {
  // Add custom metrics
  metrics.addMetric('RequestCount', MetricUnits.Count, 1);

  // Your business logic
  const userId = event.pathParameters?.userId;

  return {
    statusCode: 200,
    body: {
      message: `Hello from ${stage}!`,
      userId
    },
  };
});
```

## Function Signature

```ts
function withHttpHandler(handlerFn: HandlerFn): LambdaHandler

type HandlerFn = (args: HandlerFnArgs) => Promise<{
  statusCode?: number;
  body: unknown;
}>

type HandlerFnArgs = {
  event: APIGatewayProxyEvent;
  metrics: Metrics;
  stage: string;
}
```

## Parameters

- **`handlerFn`**: Your Lambda handler function that receives the wrapped arguments

## Handler Function Arguments

Your wrapped handler receives an object with:

- **`event`**: Standard API Gateway proxy event
- **`metrics`**: AWS Lambda Powertools Metrics instance for custom metrics
- **`stage`**: Current deployment stage from environment variables

## Return Format

Your handler should return:

```ts
{
  statusCode?: number, // Defaults to 200 if not provided
  body: unknown        // Response body (automatically serialized to JSON)
}
```

## Middleware Stack

The HTTP handler automatically applies these middleware layers in order:

### 1. Context Injection
- Injects AWS Lambda Powertools Logger context
- Provides structured logging with request correlation IDs
- Adds trace context to all log messages

### 2. Distributed Tracing
- AWS Lambda Powertools Tracer integration
- Automatic trace capture and context propagation
- X-Ray segment management

### 3. Metrics Collection
- AWS Lambda Powertools Metrics integration
- Automatic metric flushing after function execution
- Dimensional metadata support

### 4. Error Handling
- HTTP error handling with proper status codes
- Standardized error responses
- Automatic error logging

### 5. Security Headers
- Stage-specific security headers
- CORS configuration per environment
- Content Security Policy and XSS protection

## Usage Examples

### Basic CRUD Handler

```ts
import { withHttpHandler, ValidationError } from '@leighton-digital/lambda-toolkit';

export const createUserHandler = withHttpHandler(async ({ event, metrics, stage }) => {
  const body = JSON.parse(event.body || '{}');

  if (!body.email) {
    throw new ValidationError('Email is required');
  }

  // Add business metric
  metrics.addMetric('UserCreated', MetricUnits.Count, 1, { stage });

  const user = await createUser(body);

  return {
    statusCode: 201,
    body: {
      message: 'User created successfully',
      user,
    },
  };
});
```

### Database Integration

```ts
import { withHttpHandler, ResourceNotFound } from '@leighton-digital/lambda-toolkit';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const getUserHandler = withHttpHandler(async ({ event, metrics }) => {
  const { userId } = event.pathParameters || {};

  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  // Track database operations
  metrics.addMetric('DatabaseQuery', MetricUnits.Count, 1);

  const result = await dynamodb.send(new GetCommand({
    TableName: process.env.USER_TABLE,
    Key: { pk: `USER#${userId}`, sk: 'PROFILE' },
  }));

  if (!result.Item) {
    throw new ResourceNotFound('User not found');
  }

  return {
    statusCode: 200,
    body: { user: result.Item },
  };
});
```

### File Processing Handler

```ts
import { withHttpHandler } from '@leighton-digital/lambda-toolkit';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({});

export const processFileHandler = withHttpHandler(async ({ event, metrics }) => {
  const { bucket, key } = JSON.parse(event.body || '{}');

  // Download file from S3
  const result = await s3Client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  }));

  const fileContent = await result.Body?.transformToString();
  const lines = fileContent?.split('\n').length || 0;

  // Record processing metrics
  metrics.addMetric('FileLinesProcessed', MetricUnits.Count, lines);
  metrics.addMetric('FileProcessed', MetricUnits.Count, 1);

  return {
    statusCode: 200,
    body: {
      message: 'File processed successfully',
      linesProcessed: lines,
    },
  };
});
```

### Authentication Handler

```ts
import { withHttpHandler, UnauthorisedError, ForbiddenError } from '@leighton-digital/lambda-toolkit';

export const protectedHandler = withHttpHandler(async ({ event, metrics }) => {
  // Extract user from JWT (from API Gateway authorizer)
  const user = event.requestContext.authorizer?.user;

  if (!user) {
    throw new UnauthorisedError('Authentication required');
  }

  if (user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }

  // Track admin actions
  metrics.addMetric('AdminAction', MetricUnits.Count, 1, {
    userId: user.id,
    action: event.httpMethod,
  });

  return {
    statusCode: 200,
    body: {
      message: 'Admin access granted',
      timestamp: new Date().toISOString(),
    },
  };
});
```

## Environment Variables

The handler automatically reads these environment variables:

- **`STAGE`**: Deployment stage (affects headers and CORS)
- **`_X_AMZN_TRACE_ID`**: AWS X-Ray trace ID (automatic)
- **`AWS_LAMBDA_FUNCTION_NAME`**: Function name (automatic)

## Response Processing

### Automatic JSON Serialization

```ts
// Input
return {
  statusCode: 200,
  body: { users: [{ id: 1, name: 'Alice' }] }
};

// Output
{
  statusCode: 200,
  headers: { /* security headers */ },
  body: '{"users":[{"id":1,"name":"Alice"}]}'
}
```

### Error Response Format

```ts
// Error thrown
throw new ValidationError('Invalid email format');

// Automatic response
{
  statusCode: 400,
  headers: { /* security headers */ },
  body: '{"error":"Invalid email format","statusCode":400}'
}
```

## Observability Features

### Automatic Logging
- Request correlation IDs
- Structured JSON logs
- Error stack traces
- Request/response logging

### Metrics Collection
- Function invocation count
- Error rates
- Custom business metrics
- Dimensional metadata

### Distributed Tracing
- X-Ray integration
- Service dependency mapping
- Performance profiling
- Error trace capture

## Best Practices

### Error Handling
- Use specific error types (`ValidationError`, `ResourceNotFound`, etc.)
- Let the middleware handle HTTP status codes
- Include meaningful error messages

### Metrics
- Add business-relevant metrics with dimensions
- Use consistent metric names across functions
- Include stage information in metric metadata

### Performance
- Keep handler logic focused on business logic
- Use middleware for cross-cutting concerns
- Leverage automatic JSON serialization

## Features

- **Complete Middleware Stack**: Observability, security, and error handling
- **AWS Integration**: Full Lambda Powertools integration
- **Type Safety**: Complete TypeScript support
- **Automatic Headers**: Stage-specific security and CORS headers
- **JSON Serialization**: Automatic request/response processing
- **Error Mapping**: Custom errors to HTTP status codes
- **Observability**: Logging, metrics, and tracing out of the box
