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
        'network-dependency-tree-insight': 'warn',
        'unminified-javascript': 'warn',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'uses-text-compression': 'warn',
        'render-blocking-insight': 'warn',
        'render-blocking-resources': 'warn',
        'forced-reflow-insight': 'warn',
        'document-latency-insight': 'warn',
        'image-delivery-insight': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
