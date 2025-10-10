import { fromBoolean, fromNumber, fromString } from './converters';

describe('converters', () => {
  describe('fromString', () => {
    it.each([
      { value: 'valid_string', expected: 'valid_string' },
      { value: 'ab', expected: 'ab' },
      { value: 'a'.repeat(100), expected: 'a'.repeat(100) },
      { value: 'test@#$%^&*()_+{}|:<>?', expected: 'test@#$%^&*()_+{}|:<>?' },
      { value: 'hello world test', expected: 'hello world test' },
      { value: 'test123abc', expected: 'test123abc' },
    ])(
      'should return the "$expected" input string when the set value is valid: $value',
      ({ value, expected }) => {
        const result = fromString({
          variableName: 'TEST_STRING',
          value,
        });

        expect(result).toBe(expected);
      },
    );

    it.each([
      { value: () => 'a', description: 'wrong type' },
      { value: Infinity, description: 'not a parseable value' },
      { value: NaN, description: 'not a parseable value' },
      { value: undefined, description: 'not a parseable value' },
      { value: 234, description: 'not a parseable value' },
    ])(
      'should throw error when value "$value" is $description',
      ({ value }) => {
        expect(() =>
          fromString({
            variableName: 'TEST_STRING',
            value: value as unknown as string,
          }),
        ).toThrow('Invalid value for environment variable: TEST_STRING');
      },
    );
  });

  describe('fromBoolean', () => {
    it.each([
      { value: true, expected: 'true' },
      { value: false, expected: 'false' },
    ])(
      'should return "$expected" when the set value is $value',
      ({ value, expected }) => {
        const result = fromBoolean({
          variableName: 'TEST_BOOLEAN',
          value,
        });

        expect(result).toBe(expected);
      },
    );

    it.each([
      { value: 'true' as unknown as boolean, type: 'string' },
      { value: 1 as unknown as boolean, type: 'number' },
      { value: null as unknown as boolean, type: 'null' },
      { value: undefined as unknown as boolean, type: 'undefined' },
      { value: {} as unknown as boolean, type: 'object' },
      { value: [] as unknown as boolean, type: 'array' },
    ])(
      'should throw error when set value $value (type: $type) is not a boolean',
      ({ value }) => {
        expect(() =>
          fromBoolean({
            variableName: 'TEST_BOOLEAN',
            value,
          }),
        ).toThrow('Invalid value for environment variable: TEST_BOOLEAN');
      },
    );
  });

  describe('fromNumber', () => {
    it.each([
      { value: 42, expected: '42' },
      { value: 0, expected: '0' },
      { value: -123, expected: '-123' },
      { value: Math.PI, expected: Math.PI.toString() },
      { value: 1234567890, expected: '1234567890' },
      { value: 0.001, expected: '0.001' },
      { value: 1e10, expected: '10000000000' },
    ])(
      'should successfully set value $value as string: $expected',
      ({ value, expected }) => {
        const result = fromNumber({
          variableName: 'TEST_NUMBER',
          value,
        });

        expect(result).toBe(expected);
      },
    );

    it.each([
      { value: '42' as unknown as number, type: 'string' },
      { value: true as unknown as number, type: 'boolean' },
      { value: null as unknown as number, type: 'null' },
      { value: undefined as unknown as number, type: 'undefined' },
      { value: {} as unknown as number, type: 'object' },
      { value: [] as unknown as number, type: 'array' },
      { value: NaN, type: 'NaN' },
      { value: Infinity, type: 'Infinity' },
      { value: -Infinity, type: 'negative Infinity' },
    ])(
      'should throw error when set value $value (type: $type) is invalid',
      ({ value }) => {
        expect(() =>
          fromNumber({
            variableName: 'TEST_NUMBER',
            value,
          }),
        ).toThrow('Invalid value for environment variable: TEST_NUMBER');
      },
    );
  });
});
