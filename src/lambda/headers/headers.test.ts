import { getHeaders } from './headers';

describe('headers', () => {
  describe('get-headers', () => {
    it('should return the default security headers', () => {
      expect(getHeaders()).toMatchSnapshot();
    });

    it('should return headers with custom overrides', () => {
      const overrides = {
        'Access-Control-Allow-Origin': 'https://example.com',
        'Custom-Header': 'custom-value',
      };
      expect(getHeaders(overrides)).toMatchSnapshot();
    });

    it('should override existing headers when provided', () => {
      const overrides = {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'SAMEORIGIN',
      };
      expect(getHeaders(overrides)).toMatchSnapshot();
    });

    it('should merge overrides with default headers', () => {
      const overrides = {
        'New-Custom-Header': 'new-value',
      };
      const result = getHeaders(overrides);

      // Should contain all default headers
      expect(result['Content-Security-Policy']).toBe("default-src 'self'");
      expect(result['X-Content-Type-Options']).toBe('nosniff');

      // Should contain the new custom header
      expect(result['New-Custom-Header']).toBe('new-value');
    });

    it('should handle boolean header values', () => {
      const overrides = {
        'Access-Control-Allow-Credentials': false,
        'Custom-Boolean-Header': true,
      };
      const result = getHeaders(overrides);

      expect(result['Access-Control-Allow-Credentials']).toBe(false);
      expect(result['Custom-Boolean-Header']).toBe(true);
    });
  });
});
