# Errors

Custom error classes for standardized HTTP error responses in AWS Lambda functions.

## Overview

The errors module provides custom error classes that extend the standard JavaScript `Error` class. Each error class corresponds to a specific HTTP status code and is automatically handled by the Lambda error handler to return appropriate HTTP responses.

## Available Error Types

| Error Class | HTTP Status | Use Case |
|-------------|-------------|----------|
| `ValidationError` | 400 Bad Request | Invalid input data, missing required fields |
| `UnauthorisedError` | 401 Unauthorized | Missing or invalid authentication credentials |
| `ForbiddenError` | 403 Forbidden | Valid authentication but insufficient permissions |
| `ResourceNotFoundError` | 404 Not Found | Requested resource does not exist |
| `ConflictError` | 409 Conflict | Resource conflicts, duplicate entries |
| `TooManyRequestsError` | 429 Too Many Requests | Rate limiting, quota exceeded |

## Usage

```ts
import {
  ValidationError,
  UnauthorisedError,
  ForbiddenError,
  ResourceNotFoundError,
  ConflictError,
  TooManyRequestsError
} from '@leighton-digital/lambda-toolkit';

// Validation errors
throw new ValidationError('Email is required');
throw new ValidationError('Invalid email format');

// Authentication errors
throw new UnauthorisedError('Invalid token');
throw new UnauthorisedError('Token expired');

// Authorization errors
throw new ForbiddenError('Admin access required');
throw new ForbiddenError('Insufficient permissions');

// Resource errors
throw new ResourceNotFoundError('User not found');
throw new ResourceNotFoundError('Product does not exist');

// Conflict errors
throw new ConflictError('Email already exists');
throw new ConflictError('Version conflict');

// Rate limiting errors
throw new TooManyRequestsError('Rate limit exceeded');
throw new TooManyRequestsError('Daily quota reached');
```

## Integration with Lambda Handler

When used with `withHttpHandler`, these errors are automatically converted to appropriate HTTP responses:

```ts
import { withHttpHandler, ValidationError, ResourceNotFoundError } from '@leighton-digital/lambda-toolkit';

export const handler = withHttpHandler(async ({ event }) => {
  const { userId } = event.pathParameters || {};

  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new ResourceNotFoundError(`User ${userId} not found`);
  }

  return {
    statusCode: 200,
    body: { user },
  };
});

// Automatic error responses:
// ValidationError → { "error": "User ID is required", "statusCode": 400 }
// ResourceNotFoundError → { "error": "User 123 not found", "statusCode": 404 }
```

## Error Response Format

All errors produce consistent JSON responses:

```json
{
  "error": "Error message describing what went wrong",
  "statusCode": 400
}
```

## Best Practices

### Validation Errors
- Use for input validation failures
- Provide specific, actionable error messages
- Include field names when possible

```ts
throw new ValidationError('Email field is required');
throw new ValidationError('Age must be between 18 and 120');
```

### Authentication vs Authorization
- **UnauthorisedError**: Missing or invalid credentials
- **ForbiddenError**: Valid credentials but insufficient permissions

```ts
// No token provided
throw new UnauthorisedError('Authentication token required');

// Valid token but wrong role
throw new ForbiddenError('Admin role required for this operation');
```

### Resource Handling
- Use descriptive messages that help with debugging
- Include resource identifiers when helpful

```ts
throw new ResourceNotFoundError(`Order ${orderId} not found`);
throw new ResourceNotFoundError('Endpoint /api/v2/users does not exist');
```

### Conflict Resolution
- Explain the nature of the conflict
- Suggest possible resolutions when appropriate

```ts
throw new ConflictError('Email address already registered');
throw new ConflictError('Cannot delete user with active orders');
```

### Rate Limiting
- Inform users about the limitation
- Provide guidance on retry timing

```ts
throw new TooManyRequestsError('Rate limit: 100 requests per minute');
throw new TooManyRequestsError('Daily API quota exceeded, resets at midnight UTC');
```

## Features

- **HTTP Status Mapping**: Automatic conversion to appropriate HTTP status codes
- **Consistent Responses**: Standardized error response format across all endpoints
- **Type Safety**: Full TypeScript support with proper error inheritance
- **Lambda Integration**: Seamless integration with `withHttpHandler` middleware
- **Descriptive Messages**: Clear error messages for better debugging and user experience
- **Standard Compliance**: Follows HTTP status code conventions and best practices
