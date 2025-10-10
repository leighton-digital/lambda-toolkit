# Logger

Structured logging with AWS Lambda Powertools integration.

## Overview

Provides a singleton AWS Lambda Powertools Logger instance with consistent configuration across your application. The logger leverages Node.js module caching to ensure the same instance is shared everywhere it's imported.

## Usage

```ts
import { logger } from '@leighton-digital/lambda-toolkit';

// Basic logging
logger.info('Processing request', { userId: 'user123' });
logger.error('Failed to process', { error: error.message });
logger.warn('Deprecated feature used', { feature: 'old-api' });
logger.debug('Debug information', { step: 'validation' });

// Within Lambda context
export const handler = withHttpHandler(async ({ event }) => {
  logger.info('Handler invoked', {
    path: event.path,
    method: event.httpMethod,
  });

  return { statusCode: 200, body: { success: true } };
});
```

## Features

- **Structured Logging**: JSON-formatted logs for better parsing and analysis
- **Contextual Information**: Add metadata to log entries
- **Multiple Log Levels**: Support for info, error, warn, debug levels
- **AWS Integration**: Optimized for CloudWatch Logs
- **Singleton Pattern**: Consistent configuration across modules
