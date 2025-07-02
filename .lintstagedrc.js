module.exports = {
  'client/src/**/*.{ts,tsx,js,jsx}': ['prettier --write', 'eslint --fix --no-warn-ignored'],

  'server/src/**/*.{ts,js}': ['prettier --write', 'eslint --fix --no-warn-ignored'],

  'server/templates/**/*.{ts,js}': ['prettier --write'],

  'client/*.{js,ts}': ['prettier --write'],

  '{client/src,server/src}/**/*.{ts,tsx}': [() => 'npm run type-check:incremental'],

  '**/*.json': ['prettier --write'],

  '*.{md,yml,yaml}': ['prettier --write'],

  '{commitlint.config.js,.lintstagedrc.js}': ['prettier --write'],
};
