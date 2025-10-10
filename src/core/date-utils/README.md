# Date Utilities

Consistent ISO 8601 timestamp generation for Lambda functions.

## Overview

Provides the `getISOString()` function for generating UTC timestamps in ISO 8601 format, ensuring consistent date handling across your application.

## Usage

```ts
import { getISOString } from '@leighton-digital/lambda-toolkit';

const timestamp = getISOString();
// Returns: "2025-10-10T14:30:45.123Z"

// Use in data objects
const userRecord = {
  id: 'user123',
  name: 'Alice Johnson',
  createdAt: getISOString(),
  updatedAt: getISOString(),
};
```

## Functions

### `getISOString()`

Returns the current date and time in ISO 8601 format as a UTC string.

- **Returns**: `string` - Current UTC timestamp in ISO 8601 format
- **Example output**: `"2025-10-10T14:30:45.123Z"`
