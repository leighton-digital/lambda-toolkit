import { sanitiseDnsString } from './dns-string-sanitiser';

describe('sanitiseDnsString', () => {
  describe('basic functionality', () => {
    it('should convert uppercase letters to lowercase', () => {
      expect(sanitiseDnsString('EXAMPLE')).toBe('example');
      expect(sanitiseDnsString('ExAmPlE')).toBe('example');
      expect(sanitiseDnsString('API-GATEWAY')).toBe('api-gateway');
    });

    it('should remove leading and trailing whitespace', () => {
      expect(sanitiseDnsString('  example  ')).toBe('example');
      expect(sanitiseDnsString('\texample\t')).toBe('example');
      expect(sanitiseDnsString('\nexample\n')).toBe('example');
      expect(sanitiseDnsString('   \t example \n  ')).toBe('example');
    });

    it('should remove internal whitespace', () => {
      expect(sanitiseDnsString('hello world')).toBe('helloworld');
      expect(sanitiseDnsString('api gateway service')).toBe(
        'apigatewayservice',
      );
      expect(sanitiseDnsString('my   app   name')).toBe('myappname');
    });

    it('should handle mixed whitespace types', () => {
      expect(sanitiseDnsString('hello\tworld\ntest')).toBe('helloworldtest');
      expect(sanitiseDnsString('api\r\ngateway\tservice')).toBe(
        'apigatewayservice',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(sanitiseDnsString('')).toBe('');
    });

    it('should handle string with only whitespace', () => {
      expect(sanitiseDnsString('   ')).toBe('');
      expect(sanitiseDnsString('\t\n\r')).toBe('');
      expect(sanitiseDnsString(' \t \n \r ')).toBe('');
    });

    it('should handle string with no changes needed', () => {
      expect(sanitiseDnsString('example')).toBe('example');
      expect(sanitiseDnsString('api-gateway')).toBe('api-gateway');
      expect(sanitiseDnsString('my-service-123')).toBe('my-service-123');
    });

    it('should handle single character', () => {
      expect(sanitiseDnsString('A')).toBe('a');
      expect(sanitiseDnsString(' B ')).toBe('b');
      expect(sanitiseDnsString('c')).toBe('c');
    });
  });

  describe('DNS-specific scenarios', () => {
    it('should sanitise typical subdomain names', () => {
      expect(sanitiseDnsString('My API Service')).toBe('myapiservice');
      expect(sanitiseDnsString('Web App Frontend')).toBe('webappfrontend');
      expect(sanitiseDnsString('Database Service')).toBe('databaseservice');
    });

    it('should handle domain-like strings', () => {
      expect(sanitiseDnsString('My App.example.com')).toBe('myapp.example.com');
      expect(sanitiseDnsString('API Gateway.test.local')).toBe(
        'apigateway.test.local',
      );
    });

    it('should preserve hyphens and dots', () => {
      expect(sanitiseDnsString('my-api-service')).toBe('my-api-service');
      expect(sanitiseDnsString('sub.domain.example')).toBe(
        'sub.domain.example',
      );
      expect(sanitiseDnsString('API-GATEWAY.TEST.LOCAL')).toBe(
        'api-gateway.test.local',
      );
    });

    it('should handle numbers and special characters', () => {
      expect(sanitiseDnsString('api-v2-service')).toBe('api-v2-service');
      expect(sanitiseDnsString('service_123')).toBe('service_123');
      expect(sanitiseDnsString('My Service V2')).toBe('myservicev2');
    });
  });

  describe('comprehensive transformations', () => {
    it('should apply all transformations together', () => {
      expect(sanitiseDnsString('  My API Gateway Service  ')).toBe(
        'myapigatewayservice',
      );
      expect(sanitiseDnsString('\tAPI\n GATEWAY\r SERVICE\t')).toBe(
        'apigatewayservice',
      );
      expect(sanitiseDnsString('  WEB   APP   FRONTEND  ')).toBe(
        'webappfrontend',
      );
    });

    it('should handle complex real-world examples', () => {
      expect(sanitiseDnsString('My Company API Gateway')).toBe(
        'mycompanyapigateway',
      );
      expect(sanitiseDnsString('  User Authentication Service  ')).toBe(
        'userauthenticationservice',
      );
      expect(sanitiseDnsString('Database\tConnection\nPool')).toBe(
        'databaseconnectionpool',
      );
    });
  });
});
