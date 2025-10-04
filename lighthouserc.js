module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start:prod',
      startServerReadyPattern: 'Nest application successfully started',
      url: ['http://localhost:3000'],
      numberOfRuns: 1,
    },
    assert: {
      // https://googlechrome.github.io/lighthouse-ci/docs/configuration.html#preset
      preset: 'lighthouse:recommended',
      assertions: {
        // Relax or disable frontend-specific checks for backend APIs
        'network-dependency-tree-insight': 'off',
        'unminified-javascript': 'off',
        'unused-css-rules': 'off',
        'unused-javascript': 'off',
        'uses-text-compression': 'off',
        'render-blocking-insight': 'off',
        'render-blocking-resources': 'off',
        'forced-reflow-insight': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
