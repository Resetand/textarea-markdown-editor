module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['eslint:recommended', 'prettier', 'react-app'],

    rules: {
        'no-console': ['error', { allow: ['warn', 'error'] }],
    },
};
