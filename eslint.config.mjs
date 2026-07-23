import next from 'eslint-config-next';

const config = [
  ...next,
  {
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      'jsx-quotes': ['error', 'prefer-double'],
    },
  },
];

export default config;
