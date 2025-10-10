import { generateWebSubDomain } from './generate-web-sub-domain';

describe('generateWebSubDomain', () => {
  it('should generate the correct web sub domain for prod', () => {
    // arrange / act
    const domainName = generateWebSubDomain({
      stageName: 'prod',
      domainName: 'my-sub-domain.example.com',
    });
    // assert
    expect(domainName).toEqual({
      stage: 'www',
      subDomain: 'my-sub-domain.example.com',
    });
  });

  it('should generate the correct web sub domain for staging', () => {
    // arrange / act
    const domainName = generateWebSubDomain({
      stageName: 'staging',
      domainName: 'my-sub-domain.example.com',
    });
    // assert
    expect(domainName).toEqual({
      stage: 'staging',
      subDomain: 'staging.my-sub-domain.example.com',
    });
  });

  it('should generate the correct web sub domain for develop', () => {
    // arrange / act
    const domainName = generateWebSubDomain({
      stageName: 'develop',
      domainName: 'my-sub-domain.example.com',
    });
    // assert
    expect(domainName).toEqual({
      stage: 'develop',
      subDomain: 'develop.my-sub-domain.example.com',
    });
  });

  it('should generate the correct web sub domain for test', () => {
    // arrange / act
    const domainName = generateWebSubDomain({
      stageName: 'test',
      domainName: 'my-sub-domain.example.com',
    });
    // assert
    expect(domainName).toEqual({
      stage: 'test',
      subDomain: 'test.my-sub-domain.example.com',
    });
  });

  it('should generate the correct web sub domain for ephemeral environments', () => {
    // arrange / act
    const domainName = generateWebSubDomain({
      stageName: 'pr-123',
      domainName: 'my-sub-domain.example.com',
    });
    // assert
    expect(domainName).toEqual({
      stage: 'pr-123',
      subDomain: 'pr-123.my-sub-domain.example.com',
    });
  });
});
