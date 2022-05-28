module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['eslint:recommended', 'prettier', 'react-app', 'react-app/jest'],

    rules: {
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'testing-library/no-container': 'off',
        'testing-library/no-node-access': 'off',
    },
};
