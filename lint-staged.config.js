module.exports = {
    '**/*.{js,jsx,json,md,yml}': ['prettier --write'],
    '**/*.{ts,tsx}': ['eslint --max-warnings=0 --fix'],
    '**/*.ts?(x)': () => 'tsc -p tsconfig.json --noEmit',
};
