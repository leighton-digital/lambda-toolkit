module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow long paragraphs in bodies (IDE-generated messages, URLs, etc.).
    'body-max-line-length': [0],
  },
  ignores: [(message) => message.includes('[skip ci]')],
  parserPreset: {
    parserOpts: {
      issuePrefixes: ['#'],
    },
  },
};
