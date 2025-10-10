# Tracer

X-Ray distributed tracing with AWS Lambda Powertools integration.

## Overview

Provides a singleton AWS Lambda Powertools Tracer instance for adding distributed tracing capabilities to your Lambda functions. The tracer leverages Node.js module caching to ensure consistent configuration across your application.

## Usage

```ts
import { tracer } from '@leighton-digital/lambda-toolkit';

// Add annotations (indexed for filtering)
tracer.putAnnotation('userId', 'user123');
tracer.putAnnotation('operation', 'createUser');

// Add metadata (detailed information)
tracer.putMetadata('requestDetails', {
  source: 'api-gateway',
  version: '1.0.0',
  userAgent: 'Mozilla/5.0...'
});

// Within Lambda context
export const handler = withHttpHandler(async ({ event }) => {
  tracer.putAnnotation('httpMethod', event.httpMethod);
  tracer.putAnnotation('path', event.path);

  // Your business logic here

  return { statusCode: 200, body: { success: true } };
});
```

## Advanced Usage with Subsegments

```ts
import { tracer } from '@leighton-digital/lambda-toolkit';

export const handler = withHttpHandler(async ({ event }) => {
  // Create a subsegment for database operations
  const dbSubsegment = tracer.getSegment()?.addNewSubsegment('database-call');

  try {
    dbSubsegment?.addAnnotation('table', 'users');

    // Perform database operation
    const result = await databaseCall();

    dbSubsegment?.addMetadata('result', { recordCount: result.length });
    dbSubsegment?.close();

    return { statusCode: 200, body: result };
  } catch (error) {
    dbSubsegment?.addError(error as Error);
    dbSubsegment?.close();
    throw error;
  }
});
```

## Key Concepts

### Annotations
- **Purpose**: Indexed fields for filtering and searching traces
- **Best for**: User IDs, operation types, status codes
- **Searchable**: Can be used in X-Ray console filters

### Metadata
- **Purpose**: Detailed information about the trace
- **Best for**: Request/response payloads, configuration details
- **Not indexed**: Cannot be used for filtering

### Subsegments
- **Purpose**: Track specific operations within a trace
- **Best for**: Database calls, external API calls, file operations
- **Provides**: Detailed timing and error information

## Features

- **Distributed Tracing**: Track requests across multiple services
- **Performance Monitoring**: Detailed timing information
- **Error Tracking**: Automatic error capture and reporting
- **Service Map**: Visual representation of service dependencies
- **Singleton Pattern**: Consistent configuration across modules
