# Error Handler

Standardized error handling for AWS Lambda functions that maps custom errors to appropriate HTTP status codes.

## Overview

The `errorHandler` function provides centralized error handling for Lambda functions, automatically logging errors and throwing standardized HTTP errors using the `http-errors` package. It recognizes custom error types and maps them to appropriate HTTP status codes.

## Usage

```ts
import { errorHandler } from '@leighton-digital/lambda-toolkit';

try {
  // Your business logic that might throw errors
  await riskyOperation();
} catch (error) {
  errorHandler(error); // Logs and throws appropriate HTTP error
}
```

## Function Signature

```ts
function errorHandler(error: Error | unknown): APIGatewayProxyResult
```

## Parameters

- **`error`** (Error | unknown): The error object to handle. Can be a standard Error or any unknown value.

## Return Value

This function always throws and never returns. The return type `APIGatewayProxyResult` is for compatibility purposes.

## Error Mapping

The function automatically maps custom error types to HTTP status codes:

| Error Type | HTTP Status | Description |
|------------|-------------|-------------|
| `ValidationError` | 400 | Bad Request - Invalid input data |
| `ResourceNotFound` | 404 | Not Found - Requested resource doesn't exist |
| `UnauthorisedError` | 401 | Unauthorized - Authentication required |
| `ForbiddenError` | 403 | Forbidden - Access denied |
| `ConflictError` | 409 | Conflict - Resource conflict |
| `TooManyRequestsError` | 429 | Too Many Requests - Rate limit exceeded |
| `Error` (generic) | 500 | Internal Server Error - Unexpected error |

## Error Response Format

All errors return a consistent JSON format:

```json
{
  "error": "Error message",
  "statusCode": 400
}
```

## Usage Examples

### Basic Error Handling

```ts
import { errorHandler, ValidationError } from '@leighton-digital/lambda-toolkit';

export const validateUserHandler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    if (!email || !email.includes('@')) {
      throw new ValidationError('Valid email is required');
    }

    return { statusCode: 200, body: { valid: true } };
  } catch (error) {
    errorHandler(error); // → 400 Bad Request
  }
};
```

### Resource Not Found

```ts
import { errorHandler, ResourceNotFound } from '@leighton-digital/lambda-toolkit';

export const getUserHandler = async (event) => {
  try {
    const { userId } = event.pathParameters;
    const user = await getUserById(userId);

    if (!user) {
      throw new ResourceNotFound(`User ${userId} not found`);
    }

    return { statusCode: 200, body: { user } };
  } catch (error) {
    errorHandler(error); // → 404 Not Found
  }
};
```

### Generic Error Handling

```ts
import { errorHandler } from '@leighton-digital/lambda-toolkit';

export const processDataHandler = async (event) => {
  try {
    await databaseOperation();
    return { statusCode: 200, body: { success: true } };
  } catch (error) {
    errorHandler(error); // → 500 Internal Server Error
  }
};
```

## Integration with HTTP Handler

When used with `withHttpHandler`, error handling is automatic:

```ts
import { withHttpHandler, ValidationError } from '@leighton-digital/lambda-toolkit';

export const handler = withHttpHandler(async ({ event }) => {
  const { email } = JSON.parse(event.body || '{}');

  if (!email) {
    throw new ValidationError('Email is required'); // Automatically handled
  }

  return {
    statusCode: 200,
    body: { message: 'Email valid' },
  };
});
```

## Logging Behavior

The error handler automatically logs errors with appropriate log levels:

- **Custom errors** (ValidationError, etc.): Logged as warnings with error details
- **Generic errors**: Logged as errors with full stack traces
- **All errors**: Include request correlation IDs when used with AWS Lambda Powertools

## Features

- **Automatic HTTP Status Mapping**: Converts custom errors to appropriate HTTP codes
- **Consistent Response Format**: Standardized error response structure
- **Comprehensive Logging**: Automatic error logging with context
- **Type Safety**: Full TypeScript support for error types
- **Framework Integration**: Works seamlessly with `withHttpHandler`
- **Extensible**: Easy to add new custom error types
