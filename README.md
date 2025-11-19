# Monaco JSONata

> Complete Monaco Editor language extension for JSONata with full IDE-like features

[![npm version](https://img.shields.io/npm/v/monaco-jsonata.svg)](https://www.npmjs.com/package/monaco-jsonata)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 📦 Packages

This is a monorepo containing:

- **[monaco-jsonata](./packages/monaco-jsonata)** - The NPM package (language extension)
- **[playground](./packages/playground)** - Demo React application with 3-panel layout

## ✨ Features

- 🎨 **Syntax Highlighting** - Advanced tokenization for all JSONata constructs
- 🔍 **IntelliSense/Autocomplete** - Smart suggestions for all ~70 built-in functions
- 📚 **Hover Documentation** - Detailed function signatures, descriptions, and examples
- 💡 **Signature Help** - Parameter hints while typing function calls
- 🚨 **Real-time Diagnostics** - Parse errors with helpful messages
- ⚡ **Code Formatting** - Pretty-print JSONata expressions
- 🎯 **Function Snippets** - Quick templates for map, filter, reduce, and more

## 🚀 Quick Start

### Installation

```bash
pnpm install monaco-jsonata monaco-editor
```

### Usage

```tsx
import { registerJsonataLanguage } from 'monaco-jsonata';

registerJsonataLanguage(monaco);

monaco.editor.create(container, {
  language: 'jsonata',
  theme: 'jsonata-theme'
});
```

See the [package README](./packages/monaco-jsonata/README.md) for detailed documentation.

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Run playground (demo app)
pnpm run dev

# Build library only
pnpm run build:lib

# Build everything
pnpm run build

# Lint all packages
pnpm run lint
```

## 📁 Project Structure

```
monaco-jsonata/                      # Monorepo root
├── packages/
│   ├── monaco-jsonata/             # NPM package (publishable)
│   │   ├── src/                    # Language extension source
│   │   ├── examples/               # Integration examples
│   │   ├── dist/                   # Built output
│   │   └── package.json
│   └── playground/                 # Demo app (private)
│       ├── src/                    # React playground source
│       └── package.json
├── pnpm-workspace.yaml             # Workspace config
└── package.json                    # Root package
```

## 📝 Documentation

Full documentation is available in the [monaco-jsonata package README](./packages/monaco-jsonata/README.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

---

**Made with ❤️ for the JSONata community**
