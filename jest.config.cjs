module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,
            tsconfig: {
                jsx: 'react-jsx',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            },
        }],
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/components/(.*)$': '<rootDir>/src/components/$1',
        '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@/services/(.*)$': '<rootDir>/src/services/$1',
        '^@/types/(.*)$': '<rootDir>/src/types/$1',
        '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
        '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    testMatch: [
        '**/__tests__/**/*.test.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)'
    ],
    transformIgnorePatterns: [
        'node_modules/(?!(depay-evm-router)/)'
    ],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/DePay/",
        "/Coin_backup/",
        "/DEX_backup/",
        "/OmniCoin-v1--UI/",
        "/OmniBazaar-v1--DHT2/",
    ],
    testEnvironmentOptions: {
        customExportConditions: [''],
    },
}; 