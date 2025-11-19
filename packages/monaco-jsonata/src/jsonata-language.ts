import type * as monaco from 'monaco-editor';
import { jsonataTokensProvider, jsonataLanguageConfiguration, jsonataTheme } from './tokenizer';
import { createCompletionProvider } from './completions';
import { createHoverProvider } from './hovers';
import { createSignatureHelpProvider } from './signatures';
import { createFormattingProvider, createRangeFormattingProvider } from './formatter';
import { setupDiagnostics } from './diagnostics';

export interface JSONataLanguageOptions {
  enableDiagnostics?: boolean;
  enableCompletion?: boolean;
  enableHover?: boolean;
  enableSignatureHelp?: boolean;
  enableFormatting?: boolean;
}

const defaultOptions: JSONataLanguageOptions = {
  enableDiagnostics: true,
  enableCompletion: true,
  enableHover: true,
  enableSignatureHelp: true,
  enableFormatting: true,
};

export function registerJsonataLanguage(
  monacoInstance: typeof monaco,
  options: JSONataLanguageOptions = {}
) {
  // Safety check to ensure monacoInstance is valid
  if (!monacoInstance?.languages) {
    console.error('Monaco instance is not properly initialized');
    return;
  }

  const opts = { ...defaultOptions, ...options };

  // Register the JSONata language
  monacoInstance.languages.register({ id: 'jsonata' });

  // Set up the tokenizer
  monacoInstance.languages.setMonarchTokensProvider('jsonata', jsonataTokensProvider);

  // Set up language configuration
  monacoInstance.languages.setLanguageConfiguration('jsonata', jsonataLanguageConfiguration);

  // Define the JSONata theme
  monacoInstance.editor.defineTheme('jsonata-theme', jsonataTheme);

  // Register language features
  const disposables: monaco.IDisposable[] = [];

  // Completion provider
  if (opts.enableCompletion) {
    disposables.push(
      monacoInstance.languages.registerCompletionItemProvider(
        'jsonata',
        createCompletionProvider(monacoInstance)
      )
    );
  }

  // Hover provider
  if (opts.enableHover) {
    disposables.push(
      monacoInstance.languages.registerHoverProvider(
        'jsonata',
        createHoverProvider(monacoInstance)
      )
    );
  }

  // Signature help provider
  if (opts.enableSignatureHelp) {
    disposables.push(
      monacoInstance.languages.registerSignatureHelpProvider(
        'jsonata',
        createSignatureHelpProvider(monacoInstance)
      )
    );
  }

  // Formatting providers
  if (opts.enableFormatting) {
    disposables.push(
      monacoInstance.languages.registerDocumentFormattingEditProvider(
        'jsonata',
        createFormattingProvider(monacoInstance)
      )
    );

    disposables.push(
      monacoInstance.languages.registerDocumentRangeFormattingEditProvider(
        'jsonata',
        createRangeFormattingProvider(monacoInstance)
      )
    );
  }

  // Set up diagnostics for all JSONata models
  if (opts.enableDiagnostics) {
    const modelDisposables = new Map<string, monaco.IDisposable>();

    // Monitor for new models
    const onModelAdd = monacoInstance.editor.onDidCreateModel((model) => {
      if (model.getLanguageId() === 'jsonata') {
        const disposable = setupDiagnostics(monacoInstance, model);
        modelDisposables.set(model.uri.toString(), disposable);
      }
    });

    // Clean up when models are disposed
    const onModelRemove = monacoInstance.editor.onWillDisposeModel((model) => {
      const uri = model.uri.toString();
      const disposable = modelDisposables.get(uri);
      if (disposable) {
        disposable.dispose();
        modelDisposables.delete(uri);
      }
    });

    // Set up diagnostics for existing models
    monacoInstance.editor.getModels().forEach((model) => {
      if (model.getLanguageId() === 'jsonata') {
        const disposable = setupDiagnostics(monacoInstance, model);
        modelDisposables.set(model.uri.toString(), disposable);
      }
    });

    disposables.push(onModelAdd, onModelRemove);
  }

  // Return disposable to clean up all features
  return {
    dispose: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}
