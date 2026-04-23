import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import prettierConfig from 'eslint-config-prettier'
import prettier from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'

export default [
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            'main.js',
            '*.config.mjs',
            'version-bump.mjs',
        ],
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                sourceType: 'module',
                ecmaVersion: 'latest',
            },
            globals: {
                __dirname: 'readonly',
                __filename: 'readonly',
                console: 'readonly',
                exports: 'writable',
                global: 'readonly',
                module: 'readonly',
                process: 'readonly',
                require: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            'simple-import-sort': simpleImportSort,
            'unused-imports': unusedImports,
            prettier,
        },
        rules: {
            ...tseslint.configs['eslint-recommended'].rules,
            ...tseslint.configs.recommended.rules,
            ...prettierConfig.rules,

            // Existing rules
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
            '@typescript-eslint/ban-ts-comment': 'off',
            'no-prototype-builtins': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-explicit-any': 'error',
            'no-inline-comments': 'off',
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'TSAnyKeyword',
                    message:
                        'any type is not allowed. Use unknown with proper type guards instead.',
                },
            ],

            // New rules
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'unused-imports/no-unused-imports': 'error',
            'prettier/prettier': 'error',
        },
    },
]