import { Metrics } from '@aws-lambda-powertools/metrics';

/**
 * A singleton instance of the AWS Lambda Powertools Metrics.
 *
 * This metrics instance is shared across all modules that import it, leveraging Node.js module caching
 * to ensure consistent metrics configuration and avoid redundant instantiations.
 *
 * @example
 * import { metrics } from './metrics';
 *
 * metrics.addMetric('FunctionStarted', MetricUnits.Count, 1);
 */
export const metrics = new Metrics();
