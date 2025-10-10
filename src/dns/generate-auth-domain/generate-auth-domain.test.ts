import { Stage } from '../../types';
import { generateAuthDomain } from './generate-auth-domain';

describe('generate-auth-domain', () => {
  it('should return the correct values for feature dev', () => {
    const result = generateAuthDomain({
      stageName: Stage.develop,
      domainName: 'my-sub-domain.example.com',
    });
    expect(result).toEqual({
      stage: 'develop',
      subDomain: 'auth-develop.my-sub-domain.example.com',
    });
  });

  it('should return the correct values for staging', () => {
    const result = generateAuthDomain({
      stageName: Stage.staging,
      domainName: 'my-sub-domain.example.com',
    });
    expect(result).toEqual({
      stage: 'staging',
      subDomain: 'auth-staging.my-sub-domain.example.com',
    });
  });

  it('should return the correct values for prod', () => {
    const result = generateAuthDomain({
      stageName: Stage.prod,
      domainName: 'my-sub-domain.example.com',
    });
    expect(result).toEqual({
      stage: 'www',
      subDomain: 'auth.my-sub-domain.example.com',
    });
  });

  it('should return the correct values for ephemeral', () => {
    const result = generateAuthDomain({
      stageName: 'pr-123',
      domainName: 'my-sub-domain.example.com',
    });
    expect(result).toEqual({
      stage: 'pr-123',
      subDomain: 'auth-pr-123.my-sub-domain.example.com',
    });
  });

  it('should return the correct values for test', () => {
    const result = generateAuthDomain({
      stageName: Stage.test,
      domainName: 'my-sub-domain.example.com',
    });
    expect(result).toEqual({
      stage: 'test',
      subDomain: 'auth-test.my-sub-domain.example.com',
    });
  });
});
