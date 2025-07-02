module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // A new feature
        'fix', // A bug fix
        'docs', // Documentation only changes
        'style', // Changes that do not affect the meaning of the code
        'refactor', // A code change that neither fixes a bug nor adds a feature
        'perf', // A code change that improves performance
        'test', // Adding missing tests or correcting existing tests
        'chore', // Changes to the build process or auxiliary tools
        'ci', // Changes to CI configuration files and scripts
        'build', // Changes that affect the build system or external dependencies
        'revert', // Reverts a previous commit
        'wip', // Work in progress (use sparingly)
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        // Core areas
        'client', // Frontend/React changes
        'server', // Backend/NestJS changes
        'shared', // Shared utilities/types
        'templates', // Code generation templates
        'generator', // Code generation logic

        // Feature areas
        'auth', // Authentication related
        'users', // User management
        'database', // Database related
        'config', // Configuration changes
        'ui', // UI components
        'api', // API related

        // Technical areas
        'deps', // Dependency updates
        'docs', // Documentation
        'ci', // CI/CD related
        'tooling', // Development tools

        // Architecture
        'monolith', // Monolith specific
        'microservice', // Microservice specific
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 120],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
};
