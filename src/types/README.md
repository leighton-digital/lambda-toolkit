# Types

TypeScript type definitions and interfaces for AWS resources, environments, events, and naming conventions.

## Overview

The types module provides comprehensive TypeScript type definitions for common patterns in AWS Lambda and CDK development. These types ensure consistency, type safety, and standardization across your application.

## Available Types

### Environments
- **`Region`**: AWS region codes mapped to human-readable names
- **`Stage`**: Deployment stages for application environments

### Event Messaging
- **`EventMessage`**: Base interface for event-driven architecture

### Resource Naming
- **`ResourceNameParts`**: Components for generating AWS resource names
- **`ResourceName`**: Fully-qualified AWS resource name type

### Tagging
- **`TagKey`**: AWS resource tag key type
- **`TagValue`**: AWS resource tag value type
- **`Tag`**: Single key/value tag interface
- **`Tags`**: Key/value map for multiple tags
- **`RequiredTags`**: Array of required tag keys

## Usage

### Environments

```ts
import { Region, Stage } from '@leighton-digital/lambda-toolkit';

// AWS regions with human-readable names
const primaryRegion: Region = Region.virginia; // 'us-east-1'
const backupRegion: Region = Region.dublin;   // 'eu-west-1'

// Deployment stages
const currentStage: Stage = Stage.prod;     // 'prod'
const testStage: Stage = Stage.develop;     // 'develop'

// Use in CDK stacks
export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: {
    stage: Stage;
    region: Region;
  }) {
    super(scope, id, {
      env: {
        region: props.region,
        account: process.env.CDK_DEFAULT_ACCOUNT,
      },
    });
  }
}
```

### Event Messaging

```ts
import { EventMessage } from '@leighton-digital/lambda-toolkit';

// Define specific event types
interface UserCreatedEvent extends EventMessage {
  detail: {
    metadata: {
      version: number;
      created: string;
      correlationId: string;
      domain: 'users';
      source: 'user-service';
      tenant: string;
      type: 'UserCreated';
      id: string;
      storeId: string;
    };
    data: {
      userId: string;
      email: string;
      name: string;
      createdAt: string;
    };
  };
}

// Create event message
const userEvent: UserCreatedEvent = {
  detail: {
    metadata: {
      version: 1,
      created: '2025-01-01T00:00:00.000Z',
      correlationId: 'corr-123',
      domain: 'users',
      source: 'user-service',
      tenant: 'tenant-abc',
      type: 'UserCreated',
      id: 'event-456',
      storeId: 'store-789',
    },
    data: {
      userId: 'user-123',
      email: 'user@example.com',
      name: 'John Doe',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
  },
};
```

### Resource Naming

```ts
import { ResourceNameParts, ResourceName, Region } from '@leighton-digital/lambda-toolkit';

// Define resource name components
const nameParts: ResourceNameParts = {
  stage: 'prod',
  service: 'orders',
  resource: 'table',
  region: Region.virginia,
  suffix: 'v2',
};

// Generate resource name: 'prod-orders-table-v2'
const tableName: ResourceName = `${nameParts.stage}-${nameParts.service}-${nameParts.resource}${nameParts.suffix ? `-${nameParts.suffix}` : ''}`;

// Use in CDK constructs
const dynamoTable = new Table(this, 'OrdersTable', {
  tableName,
  partitionKey: { name: 'pk', type: AttributeType.STRING },
});
```

### Tagging

```ts
import { Tag, Tags, TagKey, TagValue, RequiredTags } from '@leighton-digital/lambda-toolkit';

// Individual tag
const environmentTag: Tag = {
  key: 'Environment',
  value: 'production',
};

// Multiple tags as map
const resourceTags: Tags = {
  Environment: 'production',
  Owner: 'team-backend',
  Project: 'ecommerce-platform',
  CostCenter: 'engineering',
};

// Required tags policy
const organizationRequiredTags: RequiredTags = [
  'Environment',
  'Owner',
  'Project',
  'CostCenter',
];

// Validate tags function
function validateTags(tags: Tags, required: RequiredTags): boolean {
  return required.every(requiredKey => requiredKey in tags);
}

// Use with CDK resources
const lambda = new Function(this, 'MyFunction', {
  // ... other props
  tags: resourceTags,
});
```

## Type Definitions

### Region Enum

```ts
enum Region {
  // North America
  virginia = 'us-east-1',
  ohio = 'us-east-2',
  oregon = 'us-west-2',
  california = 'us-west-1',
  canada = 'ca-central-1',

  // Europe
  dublin = 'eu-west-1',
  london = 'eu-west-2',
  frankfurt = 'eu-central-1',
  paris = 'eu-west-3',
  stockholm = 'eu-north-1',
  milan = 'eu-south-1',
  zurich = 'eu-central-2',
  spain = 'eu-south-2',

  // Asia Pacific
  singapore = 'ap-southeast-1',
  sydney = 'ap-southeast-2',
  tokyo = 'ap-northeast-1',
  seoul = 'ap-northeast-2',
  mumbai = 'ap-south-1',

  // Other regions...
}
```

### Stage Enum

```ts
enum Stage {
  develop = 'develop',
  staging = 'staging',
  prod = 'prod',
  test = 'test',
}
```

### EventMessage Interface

```ts
interface EventMessage {
  detail: {
    metadata: {
      version: number;
      created: string;
      correlationId: string;
      domain: string;
      source: string;
      tenant: string;
      type: string;
      id: string;
      storeId: string;
    };
    data: Record<string, any>;
  };
}
```

## Best Practices

### Environment Management
- Use `Region` enum for consistent region naming
- Use `Stage` enum for deployment stage standardization
- Combine with CDK for environment-specific deployments

### Event-Driven Architecture
- Extend `EventMessage` for specific event types
- Include proper correlation IDs for tracing
- Use consistent domain and source naming

### Resource Naming
- Follow the `stage-service-resource` pattern
- Include region for global resource uniqueness
- Use suffixes for versioning or variants

### Tagging Strategy
- Define organizational `RequiredTags`
- Use consistent tag keys across resources
- Implement tag validation in deployment pipelines

## Integration Examples

### Multi-Region Deployment

```ts
import { Region, Stage } from '@leighton-digital/lambda-toolkit';

const deploymentConfig = {
  [Stage.prod]: [Region.virginia, Region.dublin],
  [Stage.staging]: [Region.virginia],
  [Stage.develop]: [Region.virginia],
};

// Deploy to multiple regions based on stage
deploymentConfig[currentStage].forEach(region => {
  new MyStack(app, `MyStack-${currentStage}-${region}`, {
    stage: currentStage,
    region,
  });
});
```

### Event Processing Pipeline

```ts
import { EventMessage } from '@leighton-digital/lambda-toolkit';

export const eventHandler = withHttpHandler(async ({ event }) => {
  const eventMessage: EventMessage = JSON.parse(event.body || '{}');

  // Process based on event type
  switch (eventMessage.detail.metadata.type) {
    case 'UserCreated':
      await handleUserCreated(eventMessage);
      break;
    case 'OrderPlaced':
      await handleOrderPlaced(eventMessage);
      break;
    default:
      throw new ValidationError(`Unknown event type: ${eventMessage.detail.metadata.type}`);
  }

  return { statusCode: 200, body: { processed: true } };
});
```

## Features

- **Type Safety**: Full TypeScript support for AWS resources and patterns
- **Consistency**: Standardized naming and tagging conventions
- **Event-Driven**: Structured event messaging interfaces
- **Multi-Region**: Comprehensive AWS region definitions
- **Extensible**: Base types that can be extended for specific use cases
- **CDK Integration**: Designed to work seamlessly with AWS CDK constructs
