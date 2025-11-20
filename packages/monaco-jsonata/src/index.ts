// Main export
export { registerJsonataLanguage, type JSONataLanguageOptions } from './jsonata-language';

// Export individual components for advanced usage
export { jsonataTokensProvider, jsonataLanguageConfiguration, jsonataTheme } from './tokenizer';
export { createCompletionProvider } from './completions';
export { createHoverProvider } from './hovers';
export { createSignatureHelpProvider } from './signatures';
export { createFormattingProvider, createRangeFormattingProvider } from './formatter';
export { setupDiagnostics, createDiagnostics } from './diagnostics';
export { registerJsonataActions } from './actions';

// Export function definitions for custom usage
export {
  jsonataFunctions,
  jsonataFunctionMap,
  jsonataKeywords,
  jsonataOperators,
  type JSONataFunction
} from './jsonata-functions';
