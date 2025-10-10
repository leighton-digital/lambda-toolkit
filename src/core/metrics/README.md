# Metrics

CloudWatch metrics collection with AWS Lambda Powertools integration.

## Overview

Provides a singleton AWS Lambda Powertools Metrics instance for collecting and publishing custom metrics to CloudWatch. The metrics instance leverages Node.js module caching to ensure consistent configuration across your application.

## Usage

```ts
import { metrics } from '@leighton-digital/lambda-toolkit';
import { MetricUnits } from '@aws-lambda-powertools/metrics';

// Add custom metrics
metrics.addMetric('UserCreated', MetricUnits.Count, 1);
metrics.addMetric('ProcessingTime', MetricUnits.Milliseconds, 150);
metrics.addMetric('ErrorRate', MetricUnits.Percent, 2.5);

// Within Lambda context
export const handler = withHttpHandler(async ({ event }) => {
  metrics.addMetric('FunctionInvocation', MetricUnits.Count, 1);

  const startTime = Date.now();

  // Your business logic here

  const processingTime = Date.now() - startTime;
  metrics.addMetric('ProcessingDuration', MetricUnits.Milliseconds, processingTime);

  return { statusCode: 200, body: { success: true } };
});
```

## Common Metric Units

- `MetricUnits.Count` - For counting events
- `MetricUnits.Milliseconds` - For timing measurements
- `MetricUnits.Percent` - For percentage values
- `MetricUnits.Bytes` - For memory or data size measurements

## Features

- **CloudWatch Integration**: Automatic publishing to CloudWatch Metrics
- **Custom Metrics**: Track business-specific measurements
- **Performance Monitoring**: Monitor function execution times
- **Error Tracking**: Track error rates and counts
- **Singleton Pattern**: Consistent configuration across modules
