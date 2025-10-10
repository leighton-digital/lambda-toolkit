import { Tracer } from '@aws-lambda-powertools/tracer';

/**
 * A singleton instance of the AWS Lambda Powertools Tracer.
 *
 * This tracer instance is shared across all modules that import it, leveraging Node.js module caching
 * to ensure consistent tracer configuration and avoid redundant instantiations.
 *
 * @example
 * import { tracer } from './tracer';
 *
 * tracer.putAnnotation('Key', 'Value');
 */
export const tracer = new Tracer();
