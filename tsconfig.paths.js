const tsConfigPaths = require('tsconfig-paths');

tsConfigPaths.register({
    baseUrl: './src',
    paths: {
        '~/*': ['./*']
    }
})