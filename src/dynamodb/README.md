# DynamoDB Utilities

Helper functions for working with DynamoDB data, focusing on cleaning internal keys from items before returning them to clients.

## Overview

The DynamoDB utilities module provides functions for post-processing DynamoDB items to remove internal implementation details:

- **Strip Internal Keys**: Remove DynamoDB internal keys and GSI keys from items
- **Flexible Configuration**: Specify which keys to remove or preserve
- **Type Safety**: Maintains TypeScript type safety while cleaning data

## Strip Internal Keys

Remove DynamoDB internal keys from items before returning them to clients or external APIs.

### Basic Usage

```ts
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';

const dynamoItem = {
  pk: 'USER#123',
  sk: 'PROFILE',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  gsi1pk: 'EMAIL#alice@example.com',
  createdAt: '2025-01-01T00:00:00.000Z',
};

// Remove default internal keys
const cleanItem = stripInternalKeys(dynamoItem);
// Result: { name: 'Alice Johnson', email: 'alice@example.com', createdAt: '2025-01-01T00:00:00.000Z' }
```

### Default Keys Removed

The function removes these keys by default:
- `pk`, `PK` - Primary partition key
- `sk`, `SK` - Primary sort key
- `ttl`, `TTL` - Time-to-live attributes
- `gsi1pk`, `gsi1sk` - Global Secondary Index 1 keys
- `gsi2pk`, `gsi2sk` - Global Secondary Index 2 keys
- `gsi3pk`, `gsi3sk` - Global Secondary Index 3 keys

### Custom Key Removal

```ts
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';

const item = {
  pk: 'USER#123',
  sk: 'PROFILE',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  internalFlag: 'secret',
  metadata: 'internal-use-only',
};

// Remove additional custom keys
const publicItem = stripInternalKeys(item, undefined, ['internalFlag', 'metadata']);
// Result: { name: 'Alice Johnson', email: 'alice@example.com' }
```

### Override Default Keys

```ts
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';

const item = {
  pk: 'USER#123',
  sk: 'PROFILE',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  gsi1pk: 'EMAIL#alice@example.com',
};

// Only remove specific keys (override defaults)
const customClean = stripInternalKeys(item, ['pk', 'sk']);
// Result: { name: 'Alice Johnson', email: 'alice@example.com', gsi1pk: 'EMAIL#alice@example.com' }
```

## Lambda Integration Examples

### API Gateway Response

```ts
import { withHttpHandler } from '@leighton-digital/lambda-toolkit/lambda';
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const getUserHandler = withHttpHandler(async ({ event }) => {
  const { userId } = event.pathParameters;

  // Get item from DynamoDB
  const result = await dynamodb.send(new GetCommand({
    TableName: process.env.USER_TABLE,
    Key: { pk: `USER#${userId}`, sk: 'PROFILE' },
  }));

  if (!result.Item) {
    return {
      statusCode: 404,
      body: { error: 'User not found' },
    };
  }

  // Clean internal keys before returning
  const publicUser = stripInternalKeys(result.Item);

  return {
    statusCode: 200,
    body: { user: publicUser },
  };
});
```

### List Items Response

```ts
import { withHttpHandler } from '@leighton-digital/lambda-toolkit/lambda';
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

export const listUsersHandler = withHttpHandler(async ({ event }) => {
  // Query items from DynamoDB
  const result = await dynamodb.send(new QueryCommand({
    TableName: process.env.USER_TABLE,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': 'USERS',
    },
  }));

  // Clean all items
  const publicUsers = result.Items?.map(item =>
    stripInternalKeys(item, undefined, ['internalNotes'])
  ) || [];

  return {
    statusCode: 200,
    body: {
      users: publicUsers,
      count: publicUsers.length,
    },
  };
});
```

### Conditional Key Removal

```ts
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';

interface UserItem {
  pk: string;
  sk: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  internalNotes?: string;
  adminMetadata?: string;
}

export const getUserHandler = withHttpHandler(async ({ event }) => {
  const user: UserItem = await getUserFromDB(event.pathParameters.userId);
  const requestingUserRole = event.requestContext.authorizer?.role;

  // Admin users see more data
  const extraKeysToStrip = requestingUserRole === 'admin'
    ? []
    : ['internalNotes', 'adminMetadata'];

  const cleanUser = stripInternalKeys(user, undefined, extraKeysToStrip);

  return {
    statusCode: 200,
    body: { user: cleanUser },
  };
});
```

## Type Safety

The function maintains TypeScript type safety:

```ts
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';

interface UserRecord {
  pk: string;
  sk: string;
  name: string;
  email: string;
  age: number;
}

const user: UserRecord = {
  pk: 'USER#123',
  sk: 'PROFILE',
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
};

// Result type is Partial<UserRecord>
const cleanUser = stripInternalKeys(user);
// TypeScript knows cleanUser has: name?, email?, age? (optional because keys were removed)

// Type assertion if you know what keys remain
const publicUser = cleanUser as Pick<UserRecord, 'name' | 'email' | 'age'>;
```

## Best Practices

- **Security**: Always strip internal keys before returning data to clients
- **Consistency**: Use consistent key naming conventions in your DynamoDB design
- **Performance**: Strip keys as late as possible in your processing pipeline
- **Validation**: Consider validating the cleaned data structure matches expected API schemas
- **Documentation**: Document which keys are internal vs. public in your data models

## Common Patterns

### Repository Pattern

```ts
class UserRepository {
  async getUser(userId: string) {
    const result = await this.dynamodb.send(new GetCommand({
      TableName: this.tableName,
      Key: { pk: `USER#${userId}`, sk: 'PROFILE' },
    }));

    return result.Item ? stripInternalKeys(result.Item) : null;
  }

  async listUsers(adminView: boolean = false) {
    const result = await this.dynamodb.send(new QueryCommand({
      // ... query parameters
    }));

    const extraKeysToStrip = adminView ? [] : ['internalNotes', 'metadata'];

    return result.Items?.map(item =>
      stripInternalKeys(item, undefined, extraKeysToStrip)
    ) || [];
  }
}
```

### API Response Transformation

```ts
// Transform DynamoDB items to API response format
const transformUserForAPI = (dynamoItem: any) => {
  const cleanItem = stripInternalKeys(dynamoItem, undefined, ['version', 'lastSync']);

  return {
    id: cleanItem.userId,
    name: cleanItem.name,
    email: cleanItem.email,
    createdAt: cleanItem.createdAt,
    // ... other public fields
  };
};
```
