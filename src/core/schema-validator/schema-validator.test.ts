import { z } from 'zod';
import { validateSchema } from './schema-validator';

const body = {
  firstName: 'Tom',
  surname: 'Jones',
};

const schema = z.object({
  firstName: z
    .string()
    .regex(/^[a-zA-Z]+$/, 'First name must contain only letters'),
  surname: z.string().regex(/^[a-zA-Z]+$/, 'Surname must contain only letters'),
});

describe('schema-validator', () => {
  it('should validate a schema correctly and return parsed data', () => {
    const result = validateSchema(schema, body);
    expect(result).toEqual(body);
    expect(result.firstName).toBe('Tom');
    expect(result.surname).toBe('Jones');
  });

  it('should throw an error if the schema is invalid', () => {
    const badBody = {
      ...body,
      firstName: null,
    };
    expect(() =>
      validateSchema(schema, badBody),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Validation failed: firstName: Invalid input: expected string, received null"`,
    );
  });

  it('should throw an error with multiple validation issues', () => {
    const badBody = {
      firstName: 123,
      surname: '',
    };
    expect(() => validateSchema(schema, badBody)).toThrow('Validation failed');
  });

  it('should throw an error for invalid regex pattern', () => {
    const badBody = {
      firstName: 'Tom123',
      surname: 'Jones',
    };
    expect(() => validateSchema(schema, badBody)).toThrow(
      'First name must contain only letters',
    );
  });
});
