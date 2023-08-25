module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: { ecmaVersion: 8, sourceType: 'module' },
  ignorePatterns: ['node_modules/*'],
  extends: ['eslint:recommended'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      settings: {
        react: { version: 'detect' },
        'import/resolver': {
          typescript: {},
        },
      },
      env: {
        browser: true,
        node: true,
        es6: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended'
      ],
      plugins: ['import-newlines'],
      rules: {
        'newline-per-chained-call': ['error', { ignoreChainWithDepth: 1 }],
        indent: ['error', 2, {SwitchCase: 1}],
        'no-restricted-imports': [
          'error',
          {
            patterns: ['@/features/*/*'],
          },
        ],
        'max-len': ['error', 100, 2, {
          ignoreUrls: true,
          ignoreComments: false,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        }],
        semi: ['error', 'never', { beforeStatementContinuationChars: 'never' }],
        'quotes': ["error", 'single', {allowTemplateLiterals: true}],
        'linebreak-style': 0,
        'eol-last': ["error", "always"],
        "object-curly-spacing": ["error", "always"],
        'no-multiple-empty-lines': ["error", { "max": 2, "maxEOF": 1 }],
        'array-bracket-newline': ["error", { "multiline": true, "minItems": 3 }],
        'object-curly-newline': ['error' , {
          "ObjectExpression": {'minProperties': 3, 'multiline': true, 'consistent': true},
          "ObjectPattern": { "multiline": true, 'minProperties': 2 },
          "ImportDeclaration": { "multiline": true },
          "ExportDeclaration": { "multiline": true, "minProperties": 3 }
        }],
        'no-duplicate-imports': 'off',
        'import/order': [
          'error',
          {
            groups: [
              'builtin',
              'external',
              'internal',
              'parent',
              'sibling',
              'index',
              'object',
              'type',
            ],
            'newlines-between': 'never',
            alphabetize: { order: 'asc', caseInsensitive: true },
          },
        ],
        'import/newline-after-import': ['error', { 'count': 2 }],
        'import/no-duplicates': ['error', {'prefer-inline': true}],
        'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
        'import/default': 'off',
        'import/no-named-as-default-member': 'off',
        'import/no-named-as-default': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { 
            argsIgnorePattern: '^_',
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_"
          },
        ],
        "@typescript-eslint/consistent-type-imports": ["error", {prefer: 'type-imports', fixStyle: 'separate-type-imports'}],
        '@typescript-eslint/no-import-type-side-effects': 'error',
        '@typescript-eslint/explicit-function-return-type': ['off'],
        '@typescript-eslint/explicit-module-boundary-types': ['off'],
        '@typescript-eslint/no-empty-function': ['off'],
        '@typescript-eslint/no-explicit-any': ['off'],
        '@typescript-eslint/consistent-type-assertions': ['off'],
        'import-newlines/enforce': [
          'error',
          {
            'items': 1,
            'max-len': 100,
            'semi': false
          }
        ],
      },
    },
  ],
}