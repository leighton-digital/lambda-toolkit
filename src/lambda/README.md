# Lambda Utilities

HTTP handling, error management, and middleware for AWS Lambda functions with built-in observability and security.

## Overview

The Lambda utilities module provides comprehensive HTTP handling for Lambda functions with integrated observability, error handling, and security:

- **HTTP Handler**: Complete wrapper with observability and middleware
- **Error Handler**: Standardized HTTP error responses with proper logging
- **Headers**: Stage-specific security and CORS headers

## HTTP Handler

A comprehensive wrapper that applies observability middleware and standardizes Lambda HTTP responses.

### Basic Usage

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

### Handler Function Arguments

The wrapped handler receives an object with:
- **event**: Standard API Gateway proxy event
- **metrics**: AWS Lambda Powertools Metrics instance
- **stage**: Current deployment stage

### Return Format

Your handler should return:
```ts
{
  statusCode?: number, // Defaults to 200
  body: unknown        // Response body (auto-serialized to JSON)
}
```

### Complete Example

```ts
import { withHttpHandler } from '@leighton-digital/lambda-toolkit';
import { validateSchema } from '@leighton-digital/lambda-toolkit';
import { MetricUnits } from '@aws-lambda-powertools/metrics';
import { z } from 'zod';

const requestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const createUserHandler = withHttpHandler(async ({ event, metrics, stage }) => {
  // Parse and validate request
  const body = JSON.parse(event.body || '{}');
  const validatedData = validateSchema(requestSchema, body);

  // Add metrics
  metrics.addMetric('UserCreated', MetricUnits.Count, 1, {
    stage,
  });

  // Business logic
  const user = await createUser(validatedData);

  return {
    statusCode: 201,
    body: {
      message: 'User created successfully',
      user,
    },
  };
});
```

## Middleware Stack

The HTTP handler automatically applies these middleware layers:

### 1. Context Injection
- Injects AWS Lambda Powertools Logger context
- Provides structured logging with request correlation

### 2. Distributed Tracing
- AWS Lambda Powertools Tracer integration
- Automatic trace capture and context propagation

### 3. Metrics Collection
- AWS Lambda Powertools Metrics integration
- Automatic metric flushing and dimensional metadata

### 4. Error Handling
- HTTP error handling with proper status codes
- Standardized error responses

### 5. Security Headers
- Stage-specific security headers
- CORS configuration per environment

## Error Handler

Standardized error handling that maps custom errors to appropriate HTTP status codes.

### Automatic Error Mapping

```ts
import { ValidationError, ResourceNotFound } from '@leighton-digital/lambda-toolkit/errors';

// These errors are automatically mapped:
throw new ValidationError('Invalid email format');           // → 400 Bad Request
throw new ResourceNotFound('User not found');               // → 404 Not Found
throw new UnauthorisedError('Invalid token');               // → 401 Unauthorized
throw new ForbiddenError('Access denied');                  // → 403 Forbidden
throw new ConflictError('Email already exists');            // → 409 Conflict
throw new TooManyRequestsError('Rate limit exceeded');      // → 429 Too Many Requests
throw new Error('Database connection failed');              // → 500 Internal Server Error
```

### Error Response Format

All errors return a consistent format:
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

### Custom Error Example

```ts
import { withHttpHandler } from '@leighton-digital/lambda-toolkit';
import { ValidationError } from '@leighton-digital/lambda-toolkit/errors';

export const handler = withHttpHandler(async ({ event }) => {
  const { userId } = event.pathParameters;

  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new ResourceNotFound(`User ${userId} not found`);
  }

  return {
    statusCode: 200,
    body: { user },
  };
});
```

## Headers

Stage-specific security and CORS headers with environment-aware configurations.

### Get Headers by Stage

```ts
import { getHeaders } from '@leighton-digital/lambda-toolkit';

// Development headers (permissive CORS)
const devHeaders = getHeaders('develop');

// Production headers (restrictive CORS)
const prodHeaders = getHeaders('prod');

// Manual header application (usually not needed with withHttpHandler)
return {
  statusCode: 200,
  headers: getHeaders(stage),
  body: { message: 'Success' },
};
```

### Development Stage Headers

```json
{
  "Content-Type": "application/json",
  "Content-Security-Policy": "default-src 'self'",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=(), microphone=()",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
}
```

### Production Stage Headers

Same as development, but **without** `Access-Control-Allow-Origin: "*"` for enhanced security.

### Supported Stages

- **develop**: Permissive CORS for local development
- **staging**: Production-like security (no wildcard CORS)
- **prod**: Production security (no wildcard CORS)
- **others**: Defaults to development headers

## Advanced Examples

### Database Integration

```ts
import { withHttpHandler } from '@leighton-digital/lambda-toolkit';
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const getUserHandler = withHttpHandler(async ({ event, metrics }) => {
  const { userId } = event.pathParameters;

  // Track database operations
  metrics.addMetric('DatabaseQuery', MetricUnits.Count, 1);

  const result = await dynamodb.send(new GetCommand({
    TableName: process.env.USER_TABLE,
    Key: { pk: `USER#${userId}`, sk: 'PROFILE' },
  }));

  if (!result.Item) {
    throw new ResourceNotFound('User not found');
  }

  // Clean internal DynamoDB keys
  const publicUser = stripInternalKeys(result.Item);

  return {
    statusCode: 200,
    body: { user: publicUser },
  };
});
```

### File Upload Handler

```ts
import { withHttpHandler } from '@leighton-digital/lambda-toolkit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({});

export const getUploadUrlHandler = withHttpHandler(async ({ event, metrics }) => {
  const { fileName, contentType } = JSON.parse(event.body || '{}');

  if (!fileName || !contentType) {
    throw new ValidationError('fileName and contentType are required');
  }

  const key = `uploads/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.UPLOAD_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  metrics.addMetric('UploadUrlGenerated', MetricUnits.Count, 1, {
    contentType,
  });

  return {
    statusCode: 200,
    body: {
      uploadUrl,
      key,
      expiresIn: 3600,
    },
  };
});
```

### Authenticated Handler

```ts
import { withHttpHandler } from '@leighton-digital/lambda-toolkit';
import { UnauthorisedError, ForbiddenError } from '@leighton-digital/lambda-toolkit/errors';

export const protectedHandler = withHttpHandler(async ({ event, metrics }) => {
  // Extract user from JWT token (from API Gateway authorizer)
  const user = event.requestContext.authorizer?.user;

  if (!user) {
    throw new UnauthorisedError('Authentication required');
  }

  if (user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }

  metrics.addMetric('AdminAction', MetricUnits.Count, 1, {
    userId: user.id,
  });

  return {
    statusCode: 200,
    body: {
      message: 'Admin access granted',
      user: user.id,
    },
  };
});
```

## Best Practices

- **Error Handling**: Use specific error types for better HTTP status code mapping
- **Metrics**: Add meaningful metrics with dimensional metadata for observability
- **Validation**: Validate input data early in your handler using schema validation
- **Security**: Let the framework handle headers automatically for consistent security
- **Logging**: Use the injected logger context for structured logging with correlation IDs
- **Performance**: Keep business logic separate from HTTP concerns for better testability

## Dependencies

### Required
- `@middy/core` - Lambda middleware framework
- `@middy/http-error-handler` - HTTP error handling middleware
- `http-errors` - Standardized HTTP error creation

### Peer Dependencies
- `@aws-lambda-powertools/logger` - Structured logging
- `@aws-lambda-powertools/metrics` - Custom metrics
- `@aws-lambda-powertools/tracer` - Distributed tracing

## IAM Permissions

Ensure your Lambda execution role has:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "xray:PutTraceSegments",
        "xray:PutTelemetryRecords"
      ],
      "Resource": "*"
    }
  ]
}
```
