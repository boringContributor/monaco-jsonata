# monaco-jsonata

> Complete Monaco Editor language extension for JSONata with full IDE-like features

[![npm version](https://img.shields.io/npm/v/monaco-jsonata.svg)](https://www.npmjs.com/package/monaco-jsonata)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A comprehensive language extension that brings **complete JSONata support** to Monaco Editor, providing the best JSONata developer experience available today.

## ✨ Features

**Complete Language Support:**

- 🎨 **Syntax Highlighting** - Advanced tokenization for all JSONata constructs
- 🔍 **IntelliSense/Autocomplete** - Smart suggestions for all ~70 built-in functions
- 📚 **Hover Documentation** - Detailed function signatures, descriptions, and examples
- 💡 **Signature Help** - Parameter hints while typing function calls
- 🚨 **Real-time Diagnostics** - Parse errors with helpful messages
- ⚡ **Code Formatting** - Pretty-print JSONata expressions
- 🎯 **Function Snippets** - Quick templates for map, filter, reduce, and more

## 🚀 Why monaco-jsonata?

This extension provides **better tooling than the official JSONata playground** by offering:

- Complete autocomplete for all JSONata functions
- Rich hover tooltips with examples and documentation links
- Real-time error detection and helpful error messages
- Modern IDE features (signature help, formatting, etc.)
- Easy integration with React, Vue, Svelte, and vanilla JS
- TypeScript support out of the box

## 📦 Installation

```bash
npm install monaco-jsonata monaco-editor
```

Or with yarn:

```bash
yarn add monaco-jsonata monaco-editor
```

Or with pnpm:

```bash
pnpm add monaco-jsonata monaco-editor
```

## 🎯 Quick Start

### React (with @monaco-editor/react)

```tsx
import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { registerJsonataLanguage } from 'monaco-jsonata';

function JSONataEditor() {
  const handleEditorWillMount = (monaco: typeof Monaco) => {
    registerJsonataLanguage(monaco);
  };

  return (
    <Editor
      height="400px"
      defaultLanguage="jsonata"
      defaultValue='$sum([1, 2, 3, 4])'
      theme="jsonata-theme"
      beforeMount={handleEditorWillMount}
    />
  );
}
```

### SvelteKit

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import type * as Monaco from 'monaco-editor';

  let editorContainer: HTMLDivElement;
  let editor: Monaco.editor.IStandaloneCodeEditor;

  onMount(async () => {
    const monaco = await import('monaco-editor');
    const { registerJsonataLanguage } = await import('monaco-jsonata');

    registerJsonataLanguage(monaco.default);

    editor = monaco.default.editor.create(editorContainer, {
      value: '$map(items, function($v) { $v * 2 })',
      language: 'jsonata',
      theme: 'jsonata-theme'
    });
  });
</script>

<div bind:this={editorContainer} style="height: 400px;" />
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/vs/loader.js"></script>
</head>
<body>
  <div id="editor" style="height: 400px;"></div>

  <script type="module">
    require.config({
      paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/vs' }
    });

    require(['vs/editor/editor.main'], async function() {
      const { registerJsonataLanguage } = await import('monaco-jsonata');

      registerJsonataLanguage(window.monaco);

      window.monaco.editor.create(document.getElementById('editor'), {
        value: '{ "total": $sum(items.price) }',
        language: 'jsonata',
        theme: 'jsonata-theme'
      });
    });
  </script>
</body>
</html>
```

## 📖 API Reference

### `registerJsonataLanguage(monaco, options?)`

Registers the JSONata language with Monaco Editor.

**Parameters:**

- `monaco` - The Monaco editor instance
- `options` (optional) - Configuration options

**Options:**

```typescript
interface JSONataLanguageOptions {
  enableDiagnostics?: boolean;      // Enable real-time error checking (default: true)
  enableCompletion?: boolean;       // Enable autocomplete (default: true)
  enableHover?: boolean;            // Enable hover tooltips (default: true)
  enableSignatureHelp?: boolean;    // Enable parameter hints (default: true)
  enableFormatting?: boolean;       // Enable code formatting (default: true)
}
```

**Example:**

```typescript
import { registerJsonataLanguage } from 'monaco-jsonata';

const disposable = registerJsonataLanguage(monaco, {
  enableDiagnostics: true,
  enableCompletion: true,
  enableHover: true,
  enableSignatureHelp: true,
  enableFormatting: true
});

// Later, to clean up:
disposable.dispose();
```

## 🎨 Features in Detail

### 1. Syntax Highlighting

Advanced Monarch tokenizer with support for:

- JSONata function names (`$sum`, `$map`, etc.)
- Operators (`~>`, `:=`, `..`, etc.)
- Keywords (`function`, `lambda`, `if`, `then`, `else`, etc.)
- String literals (single, double, and backtick quotes)
- Regular expressions
- Numbers (including scientific notation, hex, octal, binary)
- Comments (line and block)

### 2. IntelliSense / Autocomplete

Intelligent code completion featuring:

- **All ~70 JSONata built-in functions** with descriptions
- **Function signatures** as snippets with placeholders
- **Examples** in documentation
- **Keyword suggestions** (if, then, else, and, or, etc.)
- **Common patterns** (map, filter, reduce templates)
- **Variable suggestions** ($, $$, $v, $i, etc.)

**Trigger autocomplete:**
- Type `$` to see all functions
- Press `Ctrl+Space` anywhere for context-aware suggestions

### 3. Hover Documentation

Rich hover tooltips showing:

- Function signature
- Description
- Parameter details with types
- Return type
- Code examples
- Links to official JSONata documentation

**Try it:** Hover over any `$function` name

### 4. Signature Help

Parameter hints while typing function calls:

- Shows function signature
- Highlights current parameter
- Displays parameter types and descriptions

**Try it:** Type `$map(` or `$reduce(` to see parameter hints

### 5. Real-time Diagnostics

Automatic error detection using the JSONata parser:

- Syntax errors highlighted in red
- Parse errors with helpful messages
- Suggestions for common mistakes
- Updates as you type (with debouncing)

### 6. Code Formatting

Pretty-print JSONata expressions:

- Smart indentation
- Proper spacing around operators
- Object and array formatting
- Preserves comments

**Keyboard shortcut:** `Shift+Alt+F` (or `Shift+Option+F` on Mac)

**Programmatic:**
```typescript
editor.getAction('editor.action.formatDocument').run();
```

### 7. Theme

Custom `jsonata-theme` optimized for JSONata syntax:

- Distinct colors for functions, keywords, operators
- Good contrast for readability
- Based on VS Code Dark+ theme

## 📚 JSONata Functions Coverage

This extension includes complete documentation for all JSONata built-in functions:

**String Functions:** `$string`, `$length`, `$substring`, `$substringBefore`, `$substringAfter`, `$uppercase`, `$lowercase`, `$trim`, `$pad`, `$contains`, `$split`, `$join`, `$match`, `$replace`, `$eval`, `$base64encode`, `$base64decode`, `$encodeUrlComponent`, `$encodeUrl`, `$decodeUrlComponent`, `$decodeUrl`

**Numeric Functions:** `$number`, `$abs`, `$floor`, `$ceil`, `$round`, `$power`, `$sqrt`, `$random`, `$formatNumber`, `$formatBase`, `$formatInteger`, `$parseInteger`

**Aggregation Functions:** `$sum`, `$max`, `$min`, `$average`

**Boolean Functions:** `$boolean`, `$not`, `$exists`

**Array Functions:** `$count`, `$append`, `$sort`, `$reverse`, `$shuffle`, `$distinct`, `$zip`

**Object Functions:** `$keys`, `$lookup`, `$spread`, `$merge`, `$sift`, `$each`, `$error`, `$assert`, `$type`

**Higher-Order Functions:** `$map`, `$filter`, `$reduce`, `$singletonArray`

**Date/Time Functions:** `$now`, `$millis`, `$fromMillis`, `$toMillis`

## 🔧 Advanced Usage

### Custom Editor Configuration

```typescript
import { registerJsonataLanguage } from 'monaco-jsonata';
import * as monaco from 'monaco-editor';

registerJsonataLanguage(monaco);

const editor = monaco.editor.create(container, {
  value: '',
  language: 'jsonata',
  theme: 'jsonata-theme',
  // Monaco options
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  // Enable all features
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false
  },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnCommitCharacter: true,
  acceptSuggestionOnEnter: 'on',
  parameterHints: {
    enabled: true
  }
});
```

### Using Individual Components

For advanced use cases, you can import and use individual components:

```typescript
import {
  createCompletionProvider,
  createHoverProvider,
  createSignatureHelpProvider,
  createFormattingProvider,
  setupDiagnostics,
  jsonataFunctions,
  jsonataTokensProvider
} from 'monaco-jsonata';

// Use individual providers
monaco.languages.registerCompletionItemProvider('jsonata', createCompletionProvider(monaco));
monaco.languages.registerHoverProvider('jsonata', createHoverProvider(monaco));
// ... etc
```

### Access Function Metadata

```typescript
import { jsonataFunctions, jsonataFunctionMap } from 'monaco-jsonata';

// Get all functions
console.log(jsonataFunctions); // Array of all functions

// Lookup specific function
const sumFunc = jsonataFunctionMap.get('$sum');
console.log(sumFunc.signature);    // "$sum(array)"
console.log(sumFunc.description);  // "Returns the sum of all numbers in array"
console.log(sumFunc.params);       // Parameter details
```

## 📝 Examples

See the [examples](./examples) directory for complete integration examples:

- **React:** [react-example.tsx](./examples/react-example.tsx)
- **SvelteKit:** [sveltekit-example.svelte](./examples/sveltekit-example.svelte)
- **Vanilla JS:** [vanilla-js-example.html](./examples/vanilla-js-example.html)

## 🌐 Browser Compatibility

Works in all modern browsers that support Monaco Editor:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🔷 TypeScript Support

This package includes full TypeScript definitions. No need for `@types/*` packages.

```typescript
import type { JSONataFunction, JSONataLanguageOptions } from 'monaco-jsonata';
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build library
npm run build:lib

# Run demo application
npm run dev

# Lint
npm run lint
```

## 📁 Project Structure

```
monaco-jsonata/
├── src/
│   ├── index.ts              # Main export
│   ├── jsonata-language.ts   # Language registration
│   ├── jsonata-functions.ts  # Function definitions (~70 functions)
│   ├── tokenizer.ts          # Monarch tokenizer
│   ├── completions.ts        # Autocomplete provider
│   ├── hovers.ts             # Hover provider
│   ├── signatures.ts         # Signature help provider
│   ├── diagnostics.ts        # Error checking
│   └── formatter.ts          # Code formatter
├── examples/                 # Integration examples
├── dist/                     # Built library (generated)
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🙏 Acknowledgments

- [JSONata](https://jsonata.org/) - The JSONata query and transformation language
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The code editor that powers VS Code
- [@stedi/prettier-plugin-jsonata](https://github.com/Stedi/prettier-plugin-jsonata) - JSONata formatting inspiration

## 🔗 Related Projects

- [jsonata](https://www.npmjs.com/package/jsonata) - JSONata query and transformation library
- [monaco-editor](https://www.npmjs.com/package/monaco-editor) - Monaco Editor
- [@monaco-editor/react](https://www.npmjs.com/package/@monaco-editor/react) - Monaco Editor React wrapper

---

**Made with ❤️ for the JSONata community**
