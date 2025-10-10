# Strip Internal Keys

Remove DynamoDB internal keys and GSI keys from items before returning them to clients or external APIs.

## Overview

The `stripInternalKeys` function removes specified internal keys from DynamoDB item objects, helping to clean data before sending it to clients. It's designed to strip common DynamoDB implementation details like partition keys, sort keys, and Global Secondary Index (GSI) keys while preserving the actual business data.

## Usage

```ts
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';

// Basic usage with default key removal
const dynamoItem = {
  pk: 'USER#123',
  sk: 'PROFILE',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  gsi1pk: 'EMAIL#alice@example.com',
  createdAt: '2025-01-01T00:00:00.000Z',
};

const cleanItem = stripInternalKeys(dynamoItem);
// Result: {
//   name: 'Alice Johnson',
//   email: 'alice@example.com',
//   createdAt: '2025-01-01T00:00:00.000Z'
// }
```

## Function Signature

```ts
function stripInternalKeys<T extends object>(
  item: T,
  keysToStrip?: (keyof T)[],
  extraKeysToStrip?: string[]
): Partial<T>
```

## Parameters

- **`item`** (T extends object): The DynamoDB item object to strip keys from
- **`keysToStrip`** (optional): Array of keys to remove. If not provided, uses default internal keys
- **`extraKeysToStrip`** (optional): Additional string keys to remove beyond the default or specified keys

## Return Value

Returns a `Partial<T>` - a shallow copy of the item without the specified keys, maintaining TypeScript type safety.

## Default Keys Removed

When no `keysToStrip` parameter is provided, the function removes these common DynamoDB internal keys:

| Key Pattern | Description | Examples |
|-------------|-------------|----------|
| `pk`, `PK` | Primary partition key | `USER#123`, `ORDER#456` |
| `sk`, `SK` | Primary sort key | `PROFILE`, `METADATA` |
| `ttl`, `TTL` | Time-to-live attributes | Unix timestamp values |
| `gsi1pk`, `gsi1sk` | Global Secondary Index 1 keys | GSI partition/sort keys |
| `gsi2pk`, `gsi2sk` | Global Secondary Index 2 keys | GSI partition/sort keys |
| `gsi3pk`, `gsi3sk` | Global Secondary Index 3 keys | GSI partition/sort keys |

## Advanced Usage Examples

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
  debugInfo: 'verbose-logging-data',
};

// Remove default keys plus custom internal fields
const publicItem = stripInternalKeys(item, undefined, [
  'internalFlag',
  'metadata',
  'debugInfo'
]);
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
  version: 1,
};

// Only remove specific keys (override defaults)
const customClean = stripInternalKeys(item, ['pk', 'sk', 'version']);
// Result: {
//   name: 'Alice Johnson',
//   email: 'alice@example.com',
//   gsi1pk: 'EMAIL#alice@example.com'
// }
```

### Role-Based Key Stripping

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
  auditLog?: string[];
}

function cleanUserItem(user: UserItem, requestingUserRole: string): Partial<UserItem> {
  // Define role-based extra keys to strip
  const extraKeysToStrip = requestingUserRole === 'admin'
    ? [] // Admins see internal data
    : ['internalNotes', 'adminMetadata', 'auditLog']; // Users don't

  return stripInternalKeys(user, undefined, extraKeysToStrip);
}

// Usage
const adminUser = { pk: 'USER#1', sk: 'PROFILE', name: 'Admin', role: 'admin' as const, internalNotes: 'VIP' };
const regularUser = { pk: 'USER#2', sk: 'PROFILE', name: 'User', role: 'user' as const, internalNotes: 'Standard' };

const cleanedForAdmin = cleanUserItem(adminUser, 'admin');
// Result includes internalNotes

const cleanedForUser = cleanUserItem(regularUser, 'user');
// Result excludes internalNotes
```

## Lambda Integration Examples

### API Gateway GET Handler

```ts
import { withHttpHandler } from '@leighton-digital/lambda-toolkit/lambda';
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const getUserHandler = withHttpHandler(async ({ event }) => {
  const { userId } = event.pathParameters || {};

  if (!userId) {
    return {
      statusCode: 400,
      body: { error: 'User ID is required' },
    };
  }

  try {
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
    const publicUser = stripInternalKeys(result.Item, undefined, [
      'lastLoginIp',
      'debugFlags',
      'internalNotes'
    ]);

    return {
      statusCode: 200,
      body: { user: publicUser },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: 'Failed to retrieve user' },
    };
  }
});
```

### List Items with Pagination

```ts
import { withHttpHandler } from '@leighton-digital/lambda-toolkit/lambda';
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

export const listUsersHandler = withHttpHandler(async ({ event }) => {
  const { limit = '20', lastKey } = event.queryStringParameters || {};
  const requestingUserRole = event.requestContext.authorizer?.role;

  try {
    const result = await dynamodb.send(new QueryCommand({
      TableName: process.env.USER_TABLE,
      IndexName: 'UsersByStatus',
      KeyConditionExpression: 'gsi1pk = :status',
      ExpressionAttributeValues: {
        ':status': 'ACTIVE',
      },
      Limit: parseInt(limit, 10),
      ExclusiveStartKey: lastKey ? JSON.parse(lastKey) : undefined,
    }));

    // Define role-based stripping
    const extraKeysToStrip = requestingUserRole === 'admin'
      ? ['debugFlags']
      : ['internalNotes', 'adminMetadata', 'debugFlags', 'auditLog'];

    // Clean all items
    const publicUsers = result.Items?.map(item =>
      stripInternalKeys(item, undefined, extraKeysToStrip)
    ) || [];

    return {
      statusCode: 200,
      body: {
        users: publicUsers,
        count: publicUsers.length,
        lastKey: result.LastEvaluatedKey
          ? JSON.stringify(result.LastEvaluatedKey)
          : null,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: 'Failed to list users' },
    };
  }
});
```

### Repository Pattern Implementation

```ts
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

export class UserRepository {
  constructor(
    private dynamodb: DynamoDBDocumentClient,
    private tableName: string
  ) {}

  async getUser(userId: string, includeInternal: boolean = false): Promise<any | null> {
    const result = await this.dynamodb.send(new GetCommand({
      TableName: this.tableName,
      Key: { pk: `USER#${userId}`, sk: 'PROFILE' },
    }));

    if (!result.Item) {
      return null;
    }

    // Strip keys based on access level
    const extraKeysToStrip = includeInternal
      ? []
      : ['internalNotes', 'debugInfo', 'auditTrail'];

    return stripInternalKeys(result.Item, undefined, extraKeysToStrip);
  }

  async listUsersByStatus(
    status: string,
    adminView: boolean = false
  ): Promise<any[]> {
    const result = await this.dynamodb.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'UsersByStatus',
      KeyConditionExpression: 'gsi1pk = :status',
      ExpressionAttributeValues: { ':status': status },
    }));

    const extraKeysToStrip = adminView
      ? []
      : ['internalNotes', 'adminMetadata', 'auditTrail'];

    return result.Items?.map(item =>
      stripInternalKeys(item, undefined, extraKeysToStrip)
    ) || [];
  }

  async getUserProfile(userId: string): Promise<any | null> {
    const user = await this.getUser(userId, false);

    if (!user) {
      return null;
    }

    // Additional stripping for public profile
    return stripInternalKeys(user, undefined, [
      'email', // Hide email in public profile
      'phone',
      'address',
      'createdAt',
      'lastLogin'
    ]);
  }
}
```

## Type Safety Features

### TypeScript Type Preservation

```ts
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';

interface UserRecord {
  pk: string;
  sk: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

const user: UserRecord = {
  pk: 'USER#123',
  sk: 'PROFILE',
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
  isActive: true,
};

// Result type is Partial<UserRecord>
const cleanUser = stripInternalKeys(user);
// TypeScript knows cleanUser has: name?, email?, age?, isActive?

// Type assertion if you know what keys remain
const publicUser = cleanUser as Pick<UserRecord, 'name' | 'email' | 'age' | 'isActive'>;
```

### Generic Type Support

```ts
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';

// Generic function that preserves type information
function cleanDynamoItem<T extends Record<string, any>>(
  item: T,
  isAdmin: boolean = false
): Partial<T> {
  const adminOnlyKeys = ['auditLog', 'internalNotes', 'debugInfo'];
  const extraKeysToStrip = isAdmin ? [] : adminOnlyKeys;

  return stripInternalKeys(item, undefined, extraKeysToStrip);
}

// Usage with type inference
interface ProductRecord {
  pk: string;
  sk: string;
  name: string;
  price: number;
  internalNotes: string;
}

const product: ProductRecord = {
  pk: 'PRODUCT#123',
  sk: 'DETAILS',
  name: 'Widget',
  price: 29.99,
  internalNotes: 'High margin item',
};

const publicProduct = cleanDynamoItem(product, false);
// Type: Partial<ProductRecord> without internalNotes
```

## Performance Considerations

### Shallow Copy Behavior

```ts
// The function creates a shallow copy - nested objects are not cloned
const item = {
  pk: 'USER#123',
  sk: 'PROFILE',
  name: 'Alice',
  metadata: {
    preferences: { theme: 'dark' },
    internalData: { flags: ['beta'] }
  }
};

const cleaned = stripInternalKeys(item);

// metadata object is the same reference
console.log(cleaned.metadata === item.metadata); // true

// For deep cleaning of nested objects, handle separately
const fullyClean = {
  ...stripInternalKeys(item),
  metadata: {
    preferences: item.metadata.preferences,
    // Omit internalData
  }
};
```

### Batch Processing Optimization

```ts
import { stripInternalKeys } from '@leighton-digital/lambda-toolkit';

// Optimize for batch processing
function cleanItemsBatch<T extends Record<string, any>>(
  items: T[],
  keysToStrip?: (keyof T)[],
  extraKeysToStrip?: string[]
): Partial<T>[] {
  // Pre-compute key removal logic once
  const defaultKeys = ['pk', 'sk', 'gsi1pk', 'gsi1sk', 'gsi2pk', 'gsi2sk'];
  const allKeysToStrip = keysToStrip || defaultKeys;
  const extraKeys = extraKeysToStrip || [];

  return items.map(item =>
    stripInternalKeys(item, allKeysToStrip, extraKeys)
  );
}

// Usage
const dynamoItems = [/* ... large array of items ... */];
const cleanedItems = cleanItemsBatch(dynamoItems, undefined, ['debugInfo']);
```

## Best Practices

### Security Considerations

- **Always strip sensitive keys** before returning data to clients
- **Use role-based stripping** for different user access levels
- **Validate the cleaned output** against expected API schemas
- **Document internal vs. public keys** in your data models

### Performance Optimization

- **Strip keys as late as possible** in your processing pipeline
- **Pre-compute key lists** for batch operations
- **Consider caching** cleaned objects for repeated access
- **Use TypeScript** for compile-time key validation

### Data Consistency

- **Use consistent naming conventions** for internal keys across your DynamoDB design
- **Document key patterns** (e.g., `gsi1pk`, `gsi2pk`) in your team guidelines
- **Implement validation** to ensure required public fields remain after stripping

## Use Cases

- **API Responses**: Clean DynamoDB items before sending to frontend applications
- **Public APIs**: Remove internal implementation details from public API responses
- **Role-Based Access**: Show different data sets based on user permissions
- **Data Migration**: Clean data when moving between systems or formats
- **Audit Logging**: Remove sensitive fields before logging data
- **Caching**: Store cleaned versions of data in Redis or ElastiCache
- **Third-Party Integration**: Sanitize data before sending to external services

## Features

- **Type Safety**: Maintains TypeScript type information while cleaning data
- **Flexible Configuration**: Override default keys or add custom keys to strip
- **Role-Based Cleaning**: Support for different access levels and user roles
- **Performance Optimized**: Shallow copy approach for efficient processing
- **DynamoDB Optimized**: Pre-configured for common DynamoDB key patterns
- **Framework Agnostic**: Works with any DynamoDB client or framework
