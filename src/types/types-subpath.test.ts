describe('src/types index module', () => {
  it('does not transitively load middy or powertools middleware when required directly', () => {
    jest.isolateModules(() => {
      const before = new Set(Object.keys(require.cache ?? {}));
      require('./index');
      const newEntries = Object.keys(require.cache ?? {}).filter(
        (p) => !before.has(p),
      );
      expect(newEntries.some((p) => p.includes('@middy/'))).toBe(false);
      expect(
        newEntries.some(
          (p) =>
            p.includes('@aws-lambda-powertools') && p.includes('middleware'),
        ),
      ).toBe(false);
    });
  });
});
