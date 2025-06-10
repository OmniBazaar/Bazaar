module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,
        }],
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
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
}; 