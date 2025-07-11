// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

module.exports = {
    roots: ['<rootDir>/src'],
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
    setupFiles: ['react-app-polyfill/jsdom'],
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.tsx'],
    testMatch: ['<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}', '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'],
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': '<rootDir>/config/jest/babelTransform.js',
        '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
        '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js',
    },
    transformIgnorePatterns: ['node_modules/?!(pretty-bytes)'],
    moduleNameMapper: {
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    },
    moduleFileExtensions: ['web.js', 'js', 'web.ts', 'ts', 'web.tsx', 'tsx', 'json', 'web.jsx', 'jsx', 'node'],
    resetMocks: false,
    coveragePathIgnorePatterns: [
        'src/service-worker.ts',
        'src/serviceWorkerRegistration.ts',
        'src/webworkers',
        'src/hooks/use-worker/utils.ts',
        'src/theme',
        'src/report-web-vitals.ts',
        'src/app.component.tsx',
        'src/index.tsx',
        'src/assets',
        'src/e2e',
        'src/intel-admin-app',
        'src/sign-up',
        'dev-proxy.ts',
        'tests',
    ],
    coverageReporters: ['clover', 'json', 'json-summary'],
    coverageThreshold: {
        global: {
            lines: 75,
        },
    },
    globalSetup: './jest.global.js',
};
