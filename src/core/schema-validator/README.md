# Schema Validator

Zod-based schema validation with comprehensive error handling and type safety.

## Overview

Provides the `validateSchema()` function for validating data against Zod schemas. When validation fails, it throws a detailed `ValidationError` with comprehensive error information. When validation succeeds, it returns properly typed data.

## Usage

```ts
import { validateSchema } from '@leighton-digital/lambda-toolkit';
import { z } from 'zod';

// Define a schema
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().min(0).max(120),
});

// Validate data
const userData = {
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
};

try {
  const validUser = validateSchema(userSchema, userData);
  // validUser is fully typed and validated
  console.log('Valid user:', validUser);
} catch (error) {
  // ValidationError with detailed Zod error information
  console.error('Validation failed:', error.message);
}
```

## Advanced Example

```ts
import { validateSchema } from '@leighton-digital/lambda-toolkit';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(18).max(120),
  preferences: z.object({
    newsletter: z.boolean().default(false),
    language: z.enum(['en', 'es', 'fr']).default('en'),
  }).optional(),
  tags: z.array(z.string()).default([]),
});

// In Lambda handler
export const handler = withHttpHandler(async ({ event }) => {
  const body = JSON.parse(event.body || '{}');

  const validatedUser = validateSchema(createUserSchema, body);

  return {
    statusCode: 201,
    body: { message: 'User created', user: validatedUser },
  };
});
```

## Functions

### `validateSchema<T>(schema: ZodSchema<T>, data: unknown): T`

Validates data against a Zod schema and returns typed results.

- **Parameters**:
  - `schema` - The Zod schema to validate against
  - `data` - The data to validate
- **Returns**: Validated and typed data
- **Throws**: `ValidationError` if validation fails

## Features

- **Type Safety**: Full TypeScript type inference from Zod schemas
- **Detailed Errors**: Comprehensive validation error messages
- **Schema Composition**: Support for complex nested schemas
- **Default Values**: Automatic application of default values
- **Transform Support**: Data transformation during validation
