import createError from 'http-errors';
import { logger } from '../../core/logger';
import {
  ConflictError,
  ForbiddenError,
  ResourceNotFoundError,
  TooManyRequestsError,
  UnauthorisedError,
  ValidationError,
} from '../../errors';
import { errorHandler } from './error-handler';

jest.mock('../../core/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('errorHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle ValidationError', () => {
    const error = new ValidationError('Validation failed');
    error.name = 'ValidationError';

    try {
      errorHandler(error);
    } catch (e) {
      expect(e).toBeInstanceOf(createError.BadRequest);
    }

    expect(logger.error).toHaveBeenCalledWith(
      'private error: ValidationError: Validation failed',
    );
    expect(logger.error).toHaveBeenCalledWith('Validation failed', {
      errorName: 'Validation failed',
      statusCode: 400,
    });
  });

  it('should handle ResourceNotFound', () => {
    const error = new ResourceNotFoundError('Resource Not Found');
    error.name = 'ResourceNotFound';

    try {
      errorHandler(error);
    } catch (e) {
      expect(e).toBeInstanceOf(createError.NotFound);
    }

    expect(logger.error).toHaveBeenCalledWith(
      'private error: ResourceNotFound: Resource Not Found',
    );
    expect(logger.error).toHaveBeenCalledWith('Resource Not Found', {
      errorName: 'Resource Not Found',
      statusCode: 404,
    });
  });

  it('should handle ConflictError', () => {
    const error = new ConflictError('Conflict occurred');
    error.name = 'ConflictError';

    try {
      errorHandler(error);
    } catch (e) {
      expect(e).toBeInstanceOf(createError.Conflict);
    }

    expect(logger.error).toHaveBeenCalledWith(
      'private error: ConflictError: Conflict occurred',
    );
    expect(logger.error).toHaveBeenCalledWith('Conflict occurred', {
      errorName: 'Conflict occurred',
      statusCode: 409,
    });
  });

  it('should handle TooManyRequestsError', () => {
    const error = new TooManyRequestsError('Rate limit exceeded');
    error.name = 'TooManyRequestsError';

    try {
      errorHandler(error);
    } catch (e) {
      expect(e).toBeInstanceOf(createError.TooManyRequests);
    }

    expect(logger.error).toHaveBeenCalledWith(
      'private error: TooManyRequestsError: Rate limit exceeded',
    );
    expect(logger.error).toHaveBeenCalledWith('Rate limit exceeded', {
      errorName: 'Rate limit exceeded',
      statusCode: 429,
    });
  });

  it('should handle UnauthorisedError', () => {
    const error = new UnauthorisedError('Unauthorized access');
    error.name = 'UnauthorisedError';

    try {
      errorHandler(error);
    } catch (e) {
      expect(e).toBeInstanceOf(createError.Unauthorized);
    }

    expect(logger.error).toHaveBeenCalledWith(
      'private error: UnauthorisedError: Unauthorized access',
    );
    expect(logger.error).toHaveBeenCalledWith('Unauthorized access', {
      errorName: 'Unauthorized access',
      statusCode: 401,
    });
  });

  it('should handle ForbiddenError', () => {
    const error = new ForbiddenError('Access denied');
    error.name = 'ForbiddenError';

    try {
      errorHandler(error);
    } catch (e) {
      expect(e).toBeInstanceOf(createError.Forbidden);
    }

    expect(logger.error).toHaveBeenCalledWith(
      'private error: ForbiddenError: Access denied',
    );
    expect(logger.error).toHaveBeenCalledWith('Access denied', {
      errorName: 'Access denied',
      statusCode: 403,
    });
  });

  it('should handle unknown errors', () => {
    const error = new Error('Unknown Error');
    error.name = 'Unknown Error';

    try {
      errorHandler(error);
    } catch (e) {
      expect(e).toBeInstanceOf(createError.InternalServerError);
    }

    expect(logger.error).toHaveBeenCalledWith(
      'private error: Unknown Error: Unknown Error',
    );
    expect(logger.error).toHaveBeenCalledWith('An error has occurred', {
      errorName: 'An error has occurred',
      statusCode: 500,
    });
  });
});
