import {
  get,
  getBoolean,
  getBooleans,
  getNumber,
  getNumbers,
  getString,
  getStrings,
} from './getters';

describe('getters', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getEnvVarString', () => {
    it.each([
      { envValue: 'valid_string', expected: 'valid_string' },
      { envValue: 'ab', expected: 'ab' },
      { envValue: 'a'.repeat(100), expected: 'a'.repeat(100) },
    ])(
      'should return a valid string when environment variable $envValue is set correctly as $expected',
      ({ envValue, expected }) => {
        process.env.TEST_STRING = envValue;

        const result = getString('TEST_STRING');
        expect(result).toBe(expected);
      },
    );

    it.each([
      { envValue: undefined, description: 'undefined' },
      { envValue: 'a'.repeat(1001), description: 'too long' },
      { envValue: '', description: 'empty string' },
    ])(
      'should throw error due to "$description" when environment variable is set to $envValue',
      ({ envValue }) => {
        if (envValue === undefined) {
          delete process.env.TEST_STRING;
        } else {
          process.env.TEST_STRING = envValue;
        }

        expect(() => getString('TEST_STRING')).toThrow(
          'Invalid environment variable: TEST_STRING',
        );
      },
    );
  });

  describe('getEnvVarBoolean', () => {
    it.each([
      { envValue: 'true', expected: true },
      { envValue: 'TRUE', expected: true },
      { envValue: 'false', expected: false },
      { envValue: 'FALSE', expected: false },
    ])(
      'should return $expected when environment variable is $envValue',
      ({ envValue, expected }) => {
        process.env.TEST_BOOLEAN = envValue;

        const result = getBoolean('TEST_BOOLEAN');

        expect(result).toBe(expected);
      },
    );

    it.each([
      { envValue: undefined, description: 'undefined' },
      { envValue: 'maybe', description: 'not "true" or "false"' },
      { envValue: 'toolong', description: 'too long' },
      { envValue: '', description: 'empty string' },
    ])(
      'should throw error due to "$description" when environment variable is set to $envValue',
      ({ envValue }) => {
        if (envValue === undefined) {
          delete process.env.TEST_BOOLEAN;
        } else {
          process.env.TEST_BOOLEAN = envValue;
        }

        expect(() => getBoolean('TEST_BOOLEAN')).toThrow(
          'Invalid environment variable: TEST_BOOLEAN',
        );
      },
    );
  });

  describe('getEnvVarNumber', () => {
    it.each([
      { envValue: '42', expected: 42 },
      { envValue: '0', expected: 0 },
      { envValue: '-123', expected: -123 },
      { envValue: '3.14', expected: 3.14 },
      { envValue: '1234567890', expected: 1234567890 },
    ])(
      'should successfully parse $envValue as $expected',
      ({ envValue, expected }) => {
        process.env.TEST_NUMBER = envValue;

        const result = getNumber('TEST_NUMBER');

        expect(result).toBe(expected);
      },
    );

    it.each([
      { envValue: undefined, description: 'undefined' },
      { envValue: 'not_a_number', description: 'not a number' },
      { envValue: '', description: 'empty string' },
      { envValue: '12345678901', description: 'too long' },
      { envValue: '   ', description: 'contains only spaces' },
    ])(
      'should throw error due to "$description" when environment variable is set to $envValue',
      ({ envValue }) => {
        if (envValue === undefined) {
          delete process.env.TEST_NUMBER;
        } else {
          process.env.TEST_NUMBER = envValue;
        }

        expect(() => getNumber('TEST_NUMBER')).toThrow(
          'Invalid environment variable: TEST_NUMBER',
        );
      },
    );
  });

  describe('getStrings', () => {
    it('should return an array of strings when all environment variables are valid', () => {
      process.env.TEST_STRING_1 = 'value1';
      process.env.TEST_STRING_2 = 'value2';
      process.env.TEST_STRING_3 = 'value3';

      const [stringOne, stringTwo, stringThree] = getStrings(
        'TEST_STRING_1',
        'TEST_STRING_2',
        'TEST_STRING_3',
      );

      expect(stringOne).toEqual('value1');
      expect(stringTwo).toEqual('value2');
      expect(stringThree).toEqual('value3');
    });

    it('should return an empty array when no variable names are provided', () => {
      const result = getStrings();

      expect(result).toEqual([]);
    });

    it('should throw error when any environment variable is invalid', () => {
      process.env.TEST_STRING_1 = 'valid';
      delete process.env.TEST_STRING_2; // Missing variable
      process.env.TEST_STRING_3 = 'valid';

      expect(() =>
        getStrings('TEST_STRING_1', 'TEST_STRING_2', 'TEST_STRING_3'),
      ).toThrow('Invalid environment variable: TEST_STRING_2');
    });
  });

  describe('getBooleans', () => {
    it('should return an array of booleans when all environment variables are valid', () => {
      process.env.TEST_BOOL_1 = 'true';
      process.env.TEST_BOOL_2 = 'FALSE';
      process.env.TEST_BOOL_3 = 'True';

      const [boolOne, boolTwo, boolThree] = getBooleans(
        'TEST_BOOL_1',
        'TEST_BOOL_2',
        'TEST_BOOL_3',
      );

      expect(boolOne).toEqual(true);
      expect(boolTwo).toEqual(false);
      expect(boolThree).toEqual(true);
    });

    it('should return an empty array when no variable names are provided', () => {
      const result = getBooleans();

      expect(result).toEqual([]);
    });

    it('should throw error when any environment variable is invalid', () => {
      process.env.TEST_BOOL_1 = 'true';
      process.env.TEST_BOOL_2 = 'invalid'; // Invalid boolean
      process.env.TEST_BOOL_3 = 'false';

      expect(() =>
        getBooleans('TEST_BOOL_1', 'TEST_BOOL_2', 'TEST_BOOL_3'),
      ).toThrow('Invalid environment variable: TEST_BOOL_2');
    });
  });

  describe('getNumbers', () => {
    it('should return an array of numbers when all environment variables are valid', () => {
      process.env.TEST_NUM_1 = '42';
      process.env.TEST_NUM_2 = '-3.14';
      process.env.TEST_NUM_3 = '0';

      const [numOne, numTwo, numThree] = getNumbers(
        'TEST_NUM_1',
        'TEST_NUM_2',
        'TEST_NUM_3',
      );

      expect(numOne).toEqual(42);
      expect(numTwo).toEqual(-3.14);
      expect(numThree).toEqual(0);
    });

    it('should return an empty array when no variable names are provided', () => {
      const result = getNumbers();

      expect(result).toEqual([]);
    });

    it('should throw error when any environment variable is invalid', () => {
      process.env.TEST_NUM_1 = '123';
      process.env.TEST_NUM_2 = 'not_a_number'; // Invalid number
      process.env.TEST_NUM_3 = '456';

      expect(() =>
        getNumbers('TEST_NUM_1', 'TEST_NUM_2', 'TEST_NUM_3'),
      ).toThrow('Invalid environment variable: TEST_NUM_2');
    });
  });

  describe('get', () => {
    describe('automatic type detection', () => {
      it('should detect boolean types correctly', () => {
        process.env.TEST_BOOL_TRUE = 'true';
        process.env.TEST_BOOL_FALSE = 'FALSE';
        process.env.TEST_BOOL_MIXED = 'True';

        const [boolTrue, boolFalse, boolMixed] = get(
          'TEST_BOOL_TRUE',
          'TEST_BOOL_FALSE',
          'TEST_BOOL_MIXED',
        );

        expect(boolTrue).toBe(true);
        expect(typeof boolTrue).toBe('boolean');
        expect(boolFalse).toBe(false);
        expect(typeof boolFalse).toBe('boolean');
        expect(boolMixed).toBe(true);
        expect(typeof boolMixed).toBe('boolean');
      });

      it('should detect number types correctly', () => {
        process.env.TEST_NUM_INT = '42';
        process.env.TEST_NUM_FLOAT = '3.14';
        process.env.TEST_NUM_NEGATIVE = '-123';
        process.env.TEST_NUM_ZERO = '0';

        const [numInt, numFloat, numNegative, numZero] = get(
          'TEST_NUM_INT',
          'TEST_NUM_FLOAT',
          'TEST_NUM_NEGATIVE',
          'TEST_NUM_ZERO',
        );

        expect(numInt).toBe(42);
        expect(typeof numInt).toBe('number');
        expect(numFloat).toBe(3.14);
        expect(typeof numFloat).toBe('number');
        expect(numNegative).toBe(-123);
        expect(typeof numNegative).toBe('number');
        expect(numZero).toBe(0);
        expect(typeof numZero).toBe('number');
      });

      it('should detect string types correctly', () => {
        process.env.TEST_STRING_SIMPLE = 'hello';
        process.env.TEST_STRING_URL = 'https://api.example.com';
        process.env.TEST_STRING_MIXED = 'value123';
        process.env.TEST_STRING_LOOKS_LIKE_BOOL = 'truthy';

        const [stringSimple, stringUrl, stringMixed, stringLikeBool] = get(
          'TEST_STRING_SIMPLE',
          'TEST_STRING_URL',
          'TEST_STRING_MIXED',
          'TEST_STRING_LOOKS_LIKE_BOOL',
        );

        expect(stringSimple).toBe('hello');
        expect(typeof stringSimple).toBe('string');
        expect(stringUrl).toBe('https://api.example.com');
        expect(typeof stringUrl).toBe('string');
        expect(stringMixed).toBe('value123');
        expect(typeof stringMixed).toBe('string');
        expect(stringLikeBool).toBe('truthy');
        expect(typeof stringLikeBool).toBe('string');
      });

      it('should handle mixed types in a single call', () => {
        process.env.TEST_MIXED_STRING = 'api-url';
        process.env.TEST_MIXED_NUMBER = '8080';
        process.env.TEST_MIXED_BOOLEAN = 'true';
        process.env.TEST_MIXED_FLOAT = '30.5';

        const [mixedString, mixedNumber, mixedBoolean, mixedFloat] = get(
          'TEST_MIXED_STRING',
          'TEST_MIXED_NUMBER',
          'TEST_MIXED_BOOLEAN',
          'TEST_MIXED_FLOAT',
        );

        expect(mixedString).toBe('api-url');
        expect(typeof mixedString).toBe('string');
        expect(mixedNumber).toBe(8080);
        expect(typeof mixedNumber).toBe('number');
        expect(mixedBoolean).toBe(true);
        expect(typeof mixedBoolean).toBe('boolean');
        expect(mixedFloat).toBe(30.5);
        expect(typeof mixedFloat).toBe('number');
      });
    });

    describe('type precedence', () => {
      it('should prioritize boolean over number when value could be both', () => {
        // Note: "true" and "false" are not valid numbers, so this tests boolean priority
        process.env.TEST_PRECEDENCE_BOOL = 'true';

        const [result] = get('TEST_PRECEDENCE_BOOL');

        expect(result).toBe(true);
        expect(typeof result).toBe('boolean');
      });

      it('should prioritize number over string when value could be both', () => {
        process.env.TEST_PRECEDENCE_NUM = '123';

        const [result] = get('TEST_PRECEDENCE_NUM');

        expect(result).toBe(123);
        expect(typeof result).toBe('number');
      });

      it('should fall back to string when value cannot be boolean or number', () => {
        process.env.TEST_PRECEDENCE_STRING = 'not-a-number-or-bool';

        const [result] = get('TEST_PRECEDENCE_STRING');

        expect(result).toBe('not-a-number-or-bool');
        expect(typeof result).toBe('string');
      });
    });

    describe('edge cases and error handling', () => {
      it('should return empty array when no variable names are provided', () => {
        const result = get();

        expect(result).toEqual([]);
      });

      it('should throw error when environment variable is missing', () => {
        delete process.env.TEST_MISSING;

        expect(() => get('TEST_MISSING')).toThrow(
          'Invalid environment variable: TEST_MISSING',
        );
      });

      it('should throw error when string is too long', () => {
        process.env.TEST_TOO_LONG = 'a'.repeat(1001);

        expect(() => get('TEST_TOO_LONG')).toThrow(
          'Invalid environment variable: TEST_TOO_LONG',
        );
      });

      it('should fall back to string when number is too long for number validation', () => {
        process.env.TEST_NUM_TOO_LONG = '12345678901'; // 11 digits, max for number is 10

        const [result] = get('TEST_NUM_TOO_LONG');

        expect(result).toBe('12345678901');
        expect(typeof result).toBe('string');
      });

      it('should throw error when only one variable in a batch is invalid', () => {
        process.env.TEST_VALID_1 = 'valid';
        delete process.env.TEST_INVALID;
        process.env.TEST_VALID_2 = 'also-valid';

        expect(() =>
          get('TEST_VALID_1', 'TEST_INVALID', 'TEST_VALID_2'),
        ).toThrow('Invalid environment variable: TEST_INVALID');
      });
    });

    describe('consistency with individual getters', () => {
      it('should return same results as individual getter functions', () => {
        process.env.TEST_CONSISTENCY_STRING = 'test-value';
        process.env.TEST_CONSISTENCY_NUMBER = '42';
        process.env.TEST_CONSISTENCY_BOOLEAN = 'true';

        const [autoString, autoNumber, autoBoolean] = get(
          'TEST_CONSISTENCY_STRING',
          'TEST_CONSISTENCY_NUMBER',
          'TEST_CONSISTENCY_BOOLEAN',
        );

        expect(autoString).toEqual('test-value');
        expect(autoNumber).toEqual(42);
        expect(autoBoolean).toEqual(true);
      });
    });
  });
});
