module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
    ],
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        'react',
        'react-hooks'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        },
        project: './tsconfig.json'
    },
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true
    },
    globals: {
        chrome: 'readonly'
    },
    rules: {
        // React Rules
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react/jsx-uses-react': 'off',
        'react/jsx-uses-vars': 'error',
        'react/jsx-key': 'error',
        
        // React Hooks Rules
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        
        // TypeScript Rules
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', { 
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
        }],
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/no-unused-expressions': 'off',
        
        // General Rules
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-var': 'error',
        'prefer-const': 'error'
    },
    settings: {
        react: {
            version: 'detect'
        }
    },
    overrides: [
        {
            files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
                'no-console': 'off'
            }
        }
    ]
}; 