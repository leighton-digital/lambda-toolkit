# Config Manager

Type-safe environment variable handling with validation for AWS Lambda functions and Node.js applications.

## Overview

The Config Manager module provides validated environment variable getters and converters with comprehensive type safety:

- **Environment Variable Getters**: Type-safe retrieval of environment variables with validation
- **Environment Variable Converters**: Validated conversion of values to environment variable strings
- **Zod Schema Validation**: Built-in validation for strings, numbers, and booleans
- **Error Handling**: Clear error messages for invalid environment variables

## Environment Variable Getters

Type-safe functions to retrieve and validate environment variables at runtime.

### String Variables

```ts
import { envVar } from '@leighton-digital/lambda-toolkit/config-manager';

// Get a validated string environment variable
const apiUrl = envVar.getString('API_URL');
// Returns: string (validated to be 2-100 characters)

const databaseName = envVar.getString('DATABASE_NAME');
// Throws error if DATABASE_NAME is undefined, empty, or invalid length
```

### Boolean Variables

```ts
import { envVar } from '@leighton-digital/lambda-toolkit/config-manager';

// Get a validated boolean environment variable
const enableDebug = envVar.getBoolean('ENABLE_DEBUG');
// Returns: boolean (from "true" or "false" string)

const enableCache = envVar.getBoolean('ENABLE_CACHE');
// Throws error if ENABLE_CACHE is not "true" or "false" (case-insensitive)
```

### Number Variables

```ts
import { envVar } from '@leighton-digital/lambda-toolkit/config-manager';

// Get a validated number environment variable
const port = envVar.getNumber('PORT');
// Returns: number (parsed from string)

const maxRetries = envVar.getNumber('MAX_RETRIES');
// Throws error if MAX_RETRIES is not a valid number or contains only whitespace
```

## Environment Variable Converters

Validated conversion functions to prepare values for setting as environment variables.

### String Conversion

```ts
import { envVar } from '@leighton-digital/lambda-toolkit/config-manager';

// Validate and prepare string for environment variable
const validatedString = envVar.fromString({
  variableName: 'API_ENDPOINT',
  value: 'https://api.example.com'
});
// Returns: 'https://api.example.com' (validated)

// Set environment variable
process.env.API_ENDPOINT = validatedString;
```

### Boolean Conversion

```ts
import { envVar } from '@leighton-digital/lambda-toolkit/config-manager';

// Convert boolean to environment variable string
const debugString = envVar.fromBoolean({
  variableName: 'DEBUG_MODE',
  value: true
});
// Returns: 'true'

const cacheString = envVar.fromBoolean({
  variableName: 'ENABLE_CACHE',
  value: false
});
// Returns: 'false'

// Set environment variables
process.env.DEBUG_MODE = debugString;
process.env.ENABLE_CACHE = cacheString;
```

### Number Conversion

```ts
import { envVar } from '@leighton-digital/lambda-toolkit/config-manager';

// Convert number to environment variable string
const portString = envVar.fromNumber({
  variableName: 'SERVER_PORT',
  value: 3000
});
// Returns: '3000'

const timeoutString = envVar.fromNumber({
  variableName: 'TIMEOUT_MS',
  value: 5000
});
// Returns: '5000'

// Set environment variables
process.env.SERVER_PORT = portString;
process.env.TIMEOUT_MS = timeoutString;
```

## Lambda Integration Examples

### Configuration Validation at Startup

```ts
import { envVar } from '@leighton-digital/lambda-toolkit/config-manager';
import { withHttpHandler } from '@leighton-digital/lambda-toolkit/lambda';

// Validate configuration at module load time
const config = {
  apiUrl: envVar.getString('API_URL'),
  enableDebug: envVar.getBoolean('ENABLE_DEBUG'),
  maxRetries: envVar.getNumber('MAX_RETRIES'),
  timeout: envVar.getNumber('TIMEOUT_MS'),
};

export const handler = withHttpHandler(async ({ event, metrics }) => {
  // Configuration is already validated and typed
  const response = await fetch(config.apiUrl, {
    timeout: config.timeout,
  });

  if (config.enableDebug) {
    metrics.addMetric('DebugRequest', 1);
  }

  return {
    statusCode: 200,
    body: { message: 'Success' },
  };
});
```

### Dynamic Configuration

```ts
import { envVar } from '@leighton-digital/lambda-toolkit/config-manager';

export const handler = withHttpHandler(async ({ event }) => {
  // Get stage-specific configuration
  const stage = envVar.getString('STAGE');
  const tableName = envVar.getString(`TABLE_NAME_${stage.toUpperCase()}`);

  // Use stage-specific settings
  const enableAdvancedFeatures = envVar.getBoolean(`ENABLE_ADVANCED_${stage.toUpperCase()}`);

  return {
    statusCode: 200,
    body: {
      stage,
      tableName,
      advancedFeaturesEnabled: enableAdvancedFeatures,
    },
  };
});
```

### Environment Variable Preparation for CDK

```ts
import { envVar } from '@leighton-digital/lambda-toolkit/config-manager';
import { Function } from 'aws-cdk-lib/aws-lambda';

export class MyLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Prepare environment variables with validation
    const environment = {
      API_URL: envVar.fromString({
        variableName: 'API_URL',
        value: 'https://api.production.com'
      }),
      ENABLE_CACHE: envVar.fromBoolean({
        variableName: 'ENABLE_CACHE',
        value: true
      }),
      MAX_CONNECTIONS: envVar.fromNumber({
        variableName: 'MAX_CONNECTIONS',
        value: 100
      }),
    };

    new Function(this, 'MyFunction', {
      // ... other props
      environment,
    });
  }
}
```

## Validation Rules

### String Validation
- **Minimum length**: 2 characters
- **Maximum length**: 100 characters
- **Throws error**: If undefined, empty, or outside length bounds

### Boolean Validation
- **Valid values**: "true" or "false" (case-insensitive)
- **Conversion**: Transforms to actual boolean type
- **Throws error**: If not exactly "true" or "false"

### Number Validation
- **Format**: Must be a valid numeric string
- **Whitespace**: Cannot be only whitespace
- **Maximum length**: 10 characters
- **Conversion**: Transforms to actual number type
- **Throws error**: If not a valid number or NaN

## Error Handling

All validation errors provide clear, actionable error messages:

```ts
import { envVar } from '@leighton-digital/lambda-toolkit/config-manager';

try {
  const invalidString = envVar.getString('MISSING_VAR');
} catch (error) {
  console.error(error.message);
  // "Invalid environment variable: MISSING_VAR: [ZodError details]"
}

try {
  const invalidBoolean = envVar.getBoolean('INVALID_BOOL');
} catch (error) {
  console.error(error.message);
  // "Invalid environment variable: INVALID_BOOL: [ZodError details]"
}

try {
  const invalidNumber = envVar.getNumber('INVALID_NUM');
} catch (error) {
  console.error(error.message);
  // "Invalid environment variable: INVALID_NUM: [ZodError details]"
}
```

## Advanced Examples

### Configuration Factory

```ts
import { envVar } from '@leighton-digital/lambda-toolkit/config-manager';

interface AppConfig {
  database: {
    host: string;
    port: number;
    ssl: boolean;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    enableCache: boolean;
    enableMetrics: boolean;
  };
}

function loadConfig(): AppConfig {
  return {
    database: {
      host: envVar.getString('DB_HOST'),
      port: envVar.getNumber('DB_PORT'),
      ssl: envVar.getBoolean('DB_SSL'),
    },
    api: {
      baseUrl: envVar.getString('API_BASE_URL'),
      timeout: envVar.getNumber('API_TIMEOUT_MS'),
      retries: envVar.getNumber('API_MAX_RETRIES'),
    },
    features: {
      enableCache: envVar.getBoolean('ENABLE_CACHE'),
      enableMetrics: envVar.getBoolean('ENABLE_METRICS'),
    },
  };
}

// Load and validate all configuration at startup
const config = loadConfig();
```

### Testing with Environment Variables

```ts
import { envVar } from '@leighton-digital/lambda-toolkit/config-manager';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should load valid configuration', () => {
    // Set test environment variables
    process.env.API_URL = envVar.fromString({
      variableName: 'API_URL',
      value: 'https://test-api.example.com'
    });

    process.env.ENABLE_DEBUG = envVar.fromBoolean({
      variableName: 'ENABLE_DEBUG',
      value: true
    });

    process.env.PORT = envVar.fromNumber({
      variableName: 'PORT',
      value: 3000
    });

    // Test getters
    expect(envVar.getString('API_URL'))
      .toBe('https://test-api.example.com');
    expect(envVar.getBoolean('ENABLE_DEBUG'))
      .toBe(true);
    expect(envVar.getNumber('PORT'))
      .toBe(3000);
  });
});
```

### Environment-Specific Configuration

```ts
import { envVar } from '@leighton-digital/lambda-toolkit/config-manager';

function getEnvironmentConfig(stage: string) {
  const configs = {
    development: {
      apiUrl: 'https://dev-api.example.com',
      enableDebug: true,
      maxConnections: 10,
    },
    staging: {
      apiUrl: 'https://staging-api.example.com',
      enableDebug: false,
      maxConnections: 50,
    },
    production: {
      apiUrl: 'https://api.example.com',
      enableDebug: false,
      maxConnections: 100,
    },
  };

  const stageConfig = configs[stage] || configs.development;

  return {
    API_URL: envVar.fromString({
      variableName: 'API_URL',
      value: stageConfig.apiUrl
    }),
    ENABLE_DEBUG: envVar.fromBoolean({
      variableName: 'ENABLE_DEBUG',
      value: stageConfig.enableDebug
    }),
    MAX_CONNECTIONS: envVar.fromNumber({
      variableName: 'MAX_CONNECTIONS',
      value: stageConfig.maxConnections
    }),
  };
}
```

## Best Practices

- **Early Validation**: Load and validate environment variables at module initialization to fail fast
- **Type Safety**: Use the typed getters to ensure runtime type safety
- **Error Handling**: Wrap configuration loading in try-catch blocks for graceful error handling
- **Testing**: Use converters to prepare test environment variables with proper validation
- **Documentation**: Document required environment variables and their validation rules
- **Defaults**: Consider using fallback patterns for optional configuration values
- **Security**: Never log environment variable values, especially sensitive data like API keys

## Dependencies

### Required
- `zod` - Schema validation library for runtime type checking

### Peer Dependencies
None - this module works standalone with any Node.js environment.

## Environment Variable Naming

Follow these conventions for consistency:
- Use `UPPER_SNAKE_CASE` for environment variable names
- Use descriptive names that indicate purpose (e.g., `DATABASE_URL`, `ENABLE_FEATURE_X`)
- Include units in names when relevant (e.g., `TIMEOUT_MS`, `MAX_SIZE_MB`)
- Use prefixes for grouped variables (e.g., `DB_HOST`, `DB_PORT`, `DB_NAME`)
