describe('./types sub-path entry', () => {
  it('does not transitively load middy or powertools middleware', () => {
    jest.isolateModules(() => {
      require('./index');
      const loaded = Object.keys(require.cache ?? {});
      expect(loaded.some((p) => p.includes('@middy/'))).toBe(false);
      expect(
        loaded.some(
          (p) =>
            p.includes('@aws-lambda-powertools') && p.includes('middleware'),
        ),
      ).toBe(false);
    });
  });
});
