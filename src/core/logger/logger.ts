import { Logger } from '@aws-lambda-powertools/logger';

/**
 * A singleton instance of the AWS Lambda Powertools Logger.
 *
 * This logger is shared across all modules that import it, leveraging Node.js module caching
 * to ensure consistent logging configuration and avoid redundant instantiations.
 *
 * @example
 * import { logger } from './logger';
 *
 * logger.info('Function started');
 */
export const logger = new Logger();
