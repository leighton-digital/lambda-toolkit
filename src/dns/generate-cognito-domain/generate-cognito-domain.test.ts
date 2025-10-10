import { generateCognitoDomain } from './generate-cognito-domain';

describe('generate-cognito-domain', () => {
  it('should generate the correct domain name', () => {
    // arrange
    const prefix = 'iagl-oms-12';
    const region = 'eu-west-2';

    // act / assert
    expect(
      generateCognitoDomain({ domainPrefix: prefix, region: region }),
    ).toEqual('iagl-oms-12.auth.eu-west-2.amazoncognito.com');
  });
});
