# Cypress Vite Preprocessor

[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Cypress preprocessor for bundling JavaScript via [Vite](https://vitejs.dev/).

## Usage

In your project's plugins file:

```ts
const {createVitePreprocessor} = require('cypress-vite-preprocessor')

module.exports = (on) => {
  on('file:preprocessor', createVitePreprocessor())
}
```