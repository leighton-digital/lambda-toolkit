# DNS Utils

DNS string sanitization utilities for ensuring DNS-compliant domain names and subdomains.

## Overview

The DNS utils module provides utility functions for sanitizing and validating DNS strings. These utilities ensure that generated domain names and subdomains are properly formatted and comply with DNS naming conventions.

## Usage

```ts
import { sanitiseDnsString } from '@leighton-digital/lambda-toolkit';

// Basic sanitization
const clean = sanitiseDnsString('  My Domain Name  ');
// Returns: 'mydomainname'

// Remove spaces and convert to lowercase
const apiName = sanitiseDnsString('API Gateway Service');
// Returns: 'apigatewayservice'

// Handle complex strings
const complexDomain = sanitiseDnsString('  My-App   Production  Environment  ');
// Returns: 'my-appproductionenvironment'

// Stage names with spaces
const stageName = sanitiseDnsString('feature branch test');
// Returns: 'featurebranchtest'
```

## Function Signature

```ts
function sanitiseDnsString(dnsString: string): string
```

## Parameters

- **`dnsString`** (string): The DNS string to sanitize

## Return Value

Returns a sanitized string with:
- Leading and trailing whitespace removed
- All internal spaces removed
- Converted to lowercase
- Ready for use in DNS contexts

## Sanitization Rules

| Input | Output | Description |
|-------|--------|-------------|
| `"  MyApp  "` | `"myapp"` | Trims whitespace, converts to lowercase |
| `"API Gateway"` | `"apigateway"` | Removes internal spaces |
| `"My-Domain-Name"` | `"my-domain-name"` | Preserves hyphens, converts to lowercase |
| `"PRODUCTION ENV"` | `"productionenv"` | Removes spaces, converts to lowercase |
| `"feature_branch_1"` | `"feature_branch_1"` | Preserves underscores |

## Integration Examples

### With DNS Generation Functions

```ts
import { sanitiseDnsString, generateApiSubDomain } from '@leighton-digital/lambda-toolkit';

// Sanitize user input before generating domains
const userStageName = "Feature Branch Testing";
const cleanStageName = sanitiseDnsString(userStageName);
// cleanStageName: "featurebrachtesting"

const apiDomain = generateApiSubDomain({
  stageName: cleanStageName,
  domainName: 'example.com'
});
// Result: 'api-featurebrachtesting.example.com'
```

### CDK Resource Naming

```ts
import { sanitiseDnsString } from '@leighton-digital/lambda-toolkit';
import { Function } from 'aws-cdk-lib/aws-lambda';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: {
    environment: string;
    featureName: string;
  }) {
    super(scope, id, props);

    // Sanitize names for AWS resource naming
    const cleanEnv = sanitiseDnsString(props.environment);
    const cleanFeature = sanitiseDnsString(props.featureName);

    const lambda = new Function(this, 'ProcessorFunction', {
      functionName: `${cleanFeature}-processor-${cleanEnv}`,
      // ... other properties
    });

    // Use in domain generation
    const subdomainPrefix = `${cleanFeature}-${cleanEnv}`;
    // Results in DNS-compliant subdomain components
  }
}
```

### Environment Variable Processing

```ts
import { sanitiseDnsString } from '@leighton-digital/lambda-toolkit';

// Process environment variables that might contain spaces
const rawStageName = process.env.STAGE_NAME || 'development';
const rawAppName = process.env.APP_NAME || 'My Application';

const cleanStageName = sanitiseDnsString(rawStageName);
const cleanAppName = sanitiseDnsString(rawAppName);

// Use in configuration
const config = {
  domainPrefix: `${cleanAppName}-${cleanStageName}`,
  resourcePrefix: `${cleanAppName}${cleanStageName}`,
  dnsLabel: cleanStageName,
};

// Example results:
// - domainPrefix: "myapplication-development"
// - resourcePrefix: "myapplicationdevelopment"
// - dnsLabel: "development"
```

### Branch Name Processing

```ts
import { sanitiseDnsString } from '@leighton-digital/lambda-toolkit';

// Process Git branch names for DNS use
const gitBranches = [
  'feature/user authentication',
  'hotfix/critical bug fix',
  'release/version 2.0',
  'develop',
];

const dnsBranches = gitBranches.map(branch => {
  // Remove common Git prefixes and sanitize
  const cleanBranch = branch
    .replace(/^(feature|hotfix|release)\//, '')
    .trim();

  return sanitiseDnsString(cleanBranch);
});

// Results:
// ['userauthentication', 'criticalbugfix', 'version2.0', 'develop']
```

## Use Cases

- **Domain Generation**: Sanitize stage names before generating subdomains
- **AWS Resource Naming**: Clean names for Lambda functions, S3 buckets, etc.
- **Environment Variables**: Process configuration values that might contain spaces
- **Branch Names**: Convert Git branch names to DNS-compatible strings
- **User Input**: Sanitize user-provided names for DNS contexts
- **Configuration Files**: Clean values from YAML/JSON configuration files

## DNS Compliance Notes

The `sanitiseDnsString` function handles basic sanitization, but for full DNS compliance, consider these additional requirements:

- **Length limits**: Domain labels should be 63 characters or less
- **Character restrictions**: Only letters, numbers, and hyphens are allowed in most DNS contexts
- **Start/end restrictions**: Labels cannot start or end with hyphens
- **Case sensitivity**: DNS is case-insensitive, so lowercase is preferred

```ts
import { sanitiseDnsString } from '@leighton-digital/lambda-toolkit';

// Additional validation for strict DNS compliance
function createDnsCompliantLabel(input: string): string {
  let sanitized = sanitiseDnsString(input);

  // Remove any remaining non-alphanumeric characters except hyphens
  sanitized = sanitized.replace(/[^a-z0-9-]/g, '');

  // Remove leading/trailing hyphens
  sanitized = sanitized.replace(/^-+|-+$/g, '');

  // Truncate to 63 characters
  sanitized = sanitized.substring(0, 63);

  // Ensure it doesn't end with a hyphen after truncation
  sanitized = sanitized.replace(/-+$/, '');

  return sanitized;
}

// Example usage
const userInput = "My-Complex_App Name 2024!";
const dnsLabel = createDnsCompliantLabel(userInput);
// Result: "my-complexappname2024"
```

## Features

- **Whitespace Removal**: Eliminates leading, trailing, and internal spaces
- **Case Normalization**: Converts all text to lowercase
- **Simple API**: Single function with clear behavior
- **Non-destructive**: Preserves hyphens and other valid DNS characters
- **Lightweight**: Minimal processing overhead
- **TypeScript Support**: Full type safety and IntelliSense support
