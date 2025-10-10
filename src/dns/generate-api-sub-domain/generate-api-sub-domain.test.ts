import { generateApiSubDomain } from './generate-api-sub-domain';

describe('generateApiSubDomain', () => {
  it('should generate the correct api sub domain for prod', () => {
    // arrange / act
    const domainName = generateApiSubDomain({
      stageName: 'prod',
      domainName: 'my-sub-domain.example.com',
    });
    // assert
    expect(domainName).toEqual('api.my-sub-domain.example.com');
  });

  it('should generate the correct api sub domain for staging', () => {
    // arrange / act
    const domainName = generateApiSubDomain({
      stageName: 'staging',
      domainName: 'my-sub-domain.example.com',
    });
    // assert
    expect(domainName).toEqual('api-staging.my-sub-domain.example.com');
  });

  it('should generate the correct api sub domain for test', () => {
    // arrange / act
    const domainName = generateApiSubDomain({
      stageName: 'test',
      domainName: 'my-sub-domain.example.com',
    });
    // assert
    expect(domainName).toEqual('api-test.my-sub-domain.example.com');
  });

  it('should generate the correct api sub domain for develop', () => {
    // arrange / act
    const domainName = generateApiSubDomain({
      stageName: 'develop',
      domainName: 'my-sub-domain.example.com',
    });
    // assert
    expect(domainName).toEqual('api-develop.my-sub-domain.example.com');
  });

  it('should generate the correct api sub domain for ephemeral environments', () => {
    // arrange / act
    const domainName = generateApiSubDomain({
      stageName: 'pr-123',
      domainName: 'my-sub-domain.example.com',
    });
    // assert
    expect(domainName).toEqual('api-pr-123.my-sub-domain.example.com');
  });
});
