import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const mensajePureza = 'El motor debe ser puro y determinista: sin hora, azar externo, DOM ni Node.';

export default tseslint.config(
  { ignores: ['**/node_modules/', '**/dist/', '**/coverage/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['packages/engine/src/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...[
          'Date',
          'performance',
          'setTimeout',
          'setInterval',
          'queueMicrotask',
          'crypto',
          'fetch',
        ].map((name) => ({ name, message: mensajePureza })),
      ],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: mensajePureza },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['node:*'], message: mensajePureza },
            {
              group: ['@juegos/client', '**/client/**'],
              message: 'El motor no puede depender del cliente.',
            },
          ],
        },
      ],
    },
  },
  prettier,
);
