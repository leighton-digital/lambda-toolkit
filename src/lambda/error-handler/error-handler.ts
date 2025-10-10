import type { APIGatewayProxyResult } from 'aws-lambda';
import createError from 'http-errors';
import { logger } from '../../core/logger';

/**
 * Handles errors in AWS Lambda functions and throws appropriate HTTP errors.
 *
 * This function logs the error and throws a standardized HTTP error using the `http-errors` package.
 * It supports custom error types like `ValidationError` and `ResourceNotFound`, mapping them to
 * HTTP 400 and 404 respectively. All other errors default to HTTP 500.
 *
 * @param {Error | unknown} error - The error object to handle. Can be a standard Error or any unknown value.
 * @returns {APIGatewayProxyResult} This function always throws and never returns; the return type is for compatibility.
 * @throws {HttpError} Throws an appropriate HTTP error based on the error type.
 *
 * @example
 * try {
 *   // some logic that may throw
 *   throw new Error('Something went wrong');
 * } catch (err) {
 *   errorHandler(err); // Logs and throws a 500 Internal Server Error
 * }
 *
 * @example
 * try {
 *   throw new ValidationError('Missing required field');
 * } catch (err) {
 *   errorHandler(err); // Logs and throws a 400 Bad Request
 * }
 */
export function errorHandler(error: Error | unknown): APIGatewayProxyResult {
  logger.error(`private error: ${error}`);

  let errorMessage = 'An error has occurred';
  let statusCode = 500;

  if (error instanceof Error) {
    switch (error.name) {
      case 'ValidationError':
        errorMessage = error.message;
        statusCode = 400;

        logger.error(errorMessage, {
          errorName: errorMessage,
          statusCode,
        });

        throw createError.BadRequest(errorMessage);
      case 'ResourceNotFound':
        errorMessage = error.message;
        statusCode = 404;

        logger.error(errorMessage, {
          errorName: errorMessage,
          statusCode,
        });

        throw createError.NotFound(errorMessage);
      case 'ConflictError':
        errorMessage = error.message;
        statusCode = 409;

        logger.error(errorMessage, {
          errorName: errorMessage,
          statusCode,
        });

        throw createError.Conflict(errorMessage);
      case 'TooManyRequestsError':
        errorMessage = error.message;
        statusCode = 429;

        logger.error(errorMessage, {
          errorName: errorMessage,
          statusCode,
        });

        throw createError.TooManyRequests(errorMessage);
      case 'UnauthorisedError':
        errorMessage = error.message;
        statusCode = 401;

        logger.error(errorMessage, {
          errorName: errorMessage,
          statusCode,
        });

        throw createError.Unauthorized(errorMessage);
      case 'ForbiddenError':
        errorMessage = error.message;
        statusCode = 403;

        logger.error(errorMessage, {
          errorName: errorMessage,
          statusCode,
        });

        throw createError.Forbidden(errorMessage);

      default:
        errorMessage = 'An error has occurred';
        statusCode = 500;

        logger.error(errorMessage, {
          errorName: errorMessage,
          statusCode,
        });

        throw createError.InternalServerError(errorMessage);
    }
  }

  logger.error(errorMessage, {
    errorName: errorMessage,
    statusCode,
  });

  throw createError.InternalServerError(errorMessage);
}
