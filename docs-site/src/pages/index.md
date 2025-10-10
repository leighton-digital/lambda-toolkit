<img width="50px" height="50px" align="right" alt="Lambda Toolkit Logo" src="https://raw.githubusercontent.com/leighton-digital/lambda-toolkit/refs/heads/main/images/lambda-toolkit-logo.png" title="Leighton Lambda Toolkit" sanitize="true" />

# Lambda Toolkit

**Lambda Toolkit** is an open-source collection of utility functions designed to help teams write production-ready application code, for deployment to AWS Lambda, faster.

Read more in the docs here: [Lambda Toolkit Docs](https://leighton-digital.github.io/lambda-toolkit/)

## Features

- Environment-aware configuration utilities for region, stage, and removal policies
- Built-in error classes for consistent API error responses
- JSON Schema validation utility
- Reusable date and time manipulation helpers
- HTTPS handler wrappers with standardised logging and error handling
- Strip internal or sensitive keys from API responses
- Jest and TypeScript base configurations for consistent project setup
- CDK Aspects for enforcing tags, security, and compliance across stacks

## Installation

```bash
npm install @leighton-digital/lambda-toolkit
```

## Usage

### Importing the Package

The package provides several modules that can be imported individually or together:

```ts
// Import specific modules
import {
  generateResourceName,
  generateS3BucketName,
  getRemovalPolicyFromStage
} from '@leighton-digital/lambda-toolkit/infra';

import {
  withHttpHandler,
  createConfig,
  logger,
  validateSchema
} from '@leighton-digital/lambda-toolkit/app-utils';

import {
  RequiredTagsChecker,
  addTagsToStack
} from '@leighton-digital/lambda-toolkit/aspects';

import {
  ValidationError,
  ResourceNotFoundError,
  ConflictError
} from '@leighton-digital/lambda-toolkit/errors';

import {
  Tags,
  Stage,
  Region
} from '@leighton-digital/lambda-toolkit/types';
```

### Basic Example

Here's a complete example showing how to use the major features together in a CDK stack:

```ts
import { App, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Aspects } from 'aws-cdk-lib';
import {
  // Infrastructure utilities
  generateResourceName,
  generateS3BucketName,
  getRemovalPolicyFromStage,
  getStage,
  // Tagging utilities
  RequiredTagsChecker,
  addTagsToStack,
  // Types
  Tags,
  Stage
} from '@leighton-digital/lambda-toolkit';

interface MyStackProps extends StackProps {
  stage: string;
  service: string;
}

class MyApplicationStack extends Stack {
  constructor(scope: App, id: string, props: MyStackProps) {
    super(scope, id, props);

    const { stage, service } = props;
    const normalizedStage = getStage(stage);
    const removalPolicy = getRemovalPolicyFromStage(normalizedStage);

    // Apply standard tags to the stack
    const stackTags: Tags = {
      Environment: normalizedStage,
      Service: service,
      Owner: 'platform-team',
      Project: 'customer-portal',
      ManagedBy: 'cdk',
    };
    addTagsToStack(this, stackTags);

    // Create resources with standardized naming
    const table = new Table(this, 'UsersTable', {
      tableName: generateResourceName(normalizedStage, service, 'table'),
      partitionKey: { name: 'id', type: AttributeType.STRING },
      removalPolicy,
    });

    const bucket = new Bucket(this, 'AssetsBucket', {
      bucketName: generateS3BucketName(normalizedStage, service, 'assets'),
      removalPolicy,
    });

    const lambdaFunction = new Function(this, 'ApiFunction', {
      functionName: generateResourceName(normalizedStage, service, 'function', 'api'),
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: table.tableName,
        BUCKET_NAME: bucket.bucketName,
        STAGE: normalizedStage,
      },
    });

    // Grant permissions
    table.grantReadWriteData(lambdaFunction);
    bucket.grantReadWrite(lambdaFunction);
  }
}

const app = new App();
const stage = process.env.STAGE || 'dev';
const service = 'customer-portal';

// Create the stack
new MyApplicationStack(app, `CustomerPortalStack-${getStage(stage)}`, {
  stage,
  service,
});

// Enforce required tags across all stacks
const requiredTags = ['Environment', 'Service', 'Owner', 'Project'];
Aspects.of(app).add(new RequiredTagsChecker(requiredTags));

app.synth();
```

#### Lambda Function Example

For Lambda functions, use the app-utils for consistent error handling and observability:

```ts
// lambda/index.ts
import {
  withHttpHandler,
  createConfig,
  validateSchema,
  logger
} from '@leighton-digital/lambda-toolkit/app-utils';
import { ValidationError } from '@leighton-digital/lambda-toolkit/errors';

// Configure environment-specific settings
const config = createConfig({
  tableName: {
    doc: 'DynamoDB table name',
    format: String,
    default: '',
    env: 'TABLE_NAME',
  },
  bucketName: {
    doc: 'S3 bucket name',
    format: String,
    default: '',
    env: 'BUCKET_NAME',
  },
});

// Define request schema
const requestSchema = {
  type: 'object',
  properties: {
    userId: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
  },
  required: ['userId', 'name', 'email'],
  additionalProperties: false,
};

export const handler = withHttpHandler(async ({ event, metrics, stage }) => {
  // Parse and validate request
  const body = JSON.parse(event.body || '{}');
  validateSchema(requestSchema, body);

  // Add custom metrics
  metrics.addMetric('UserCreated', 'Count', 1);

  // Log with context
  logger.info('Creating user', {
    userId: body.userId,
    stage,
    tableName: config.get('tableName'),
  });

  // Your business logic here...

  return {
    statusCode: 201,
    body: {
      message: 'User created successfully',
      userId: body.userId,
      stage,
    },
  };
});
```

## Running Tests

To run the tests:

```bash
npm run test
```
or in watch mode

```bash
npm run test:watch
```

## License

MIT License - see the [LICENSE](./LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

---

<img src="https://raw.githubusercontent.com/leighton-digital/lambda-toolkit/2578cda7dfd2a63e61912c1289d06f45f357616f/images/leighton-logo.svg" width="200" sanitize="true" />
