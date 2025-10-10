import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { logger, metrics, tracer } from '../../core';
import { errorHandler } from '../error-handler';
import { getHeaders } from '../headers';

type HandlerFnArgs = {
  event: APIGatewayProxyEvent;
};

type HandlerFn = (args: HandlerFnArgs) => Promise<{
  statusCode?: number;
  body: unknown;
}>;

/**
 * Wraps a Lambda handler function with common middleware for observability and error handling.
 *
 * This utility function applies the following middleware:
 * - `injectLambdaContext`: Injects contextual logging using AWS Lambda Powertools Logger.
 * - `captureLambdaHandler`: Adds distributed tracing using AWS Lambda Powertools Tracer.
 * - `logMetrics`: Captures custom metrics using AWS Lambda Powertools Metrics.
 * - `httpErrorHandler`: Handles thrown HTTP errors and formats them into proper API Gateway responses.
 *
 * The wrapped handler automatically handles JSON serialization of the response body and applies
 * appropriate HTTP headers. It also provides error handling that converts thrown errors into
 * properly formatted API Gateway responses.
 *
 * @param {HandlerFn} handlerFn - The Lambda handler function to wrap. It receives an object containing the event and metrics instance.
 * @returns {middy.MiddyfiedHandler} A Middy-wrapped Lambda handler with observability and error handling.
 *
 * @example
 * ```typescript
 * import { MetricUnits } from '@aws-lambda-powertools/metrics';
 *
 * const handler = withHttpHandler(async ({ event, metrics }) => {
 *   metrics.addMetric('RequestCount', MetricUnits.Count, 1);
 *
 *   return {
 *     statusCode: 200,
 *     body: { message: 'Hello World', path: event.path },
 *   };
 * });
 *
 * export const main = handler;
 * ```
 */

export function withHttpHandler(handlerFn: HandlerFn) {
  const baseHandler = async (
    event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> => {
    try {
      const result = await handlerFn({ event });

      return {
        statusCode: result.statusCode ?? 200,
        headers: getHeaders(),
        body: JSON.stringify(result.body),
      };
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'Unknown error');
      return errorHandler(error);
    }
  };

  return middy(baseHandler)
    .use(injectLambdaContext(logger))
    .use(captureLambdaHandler(tracer))
    .use(logMetrics(metrics))
    .use(httpErrorHandler({ fallbackMessage: 'An error has occurred' }));
}
