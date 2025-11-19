import type * as monaco from 'monaco-editor';
import { jsonataFunctions, jsonataKeywords } from './jsonata-functions';

export function createCompletionProvider(monacoInstance: typeof monaco): monaco.languages.CompletionItemProvider {
  return {
    triggerCharacters: ['$', '.', '['],

    provideCompletionItems: (model, position) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      // Check if we're typing a function (starts with $)
      const isDollarContext = textUntilPosition.match(/\$\w*$/);

      // Manually calculate the range for $ functions
      let range: monaco.IRange;
      if (isDollarContext) {
        // Find where the $ started
        const match = textUntilPosition.match(/\$\w*$/);
        const matchedText = match ? match[0] : '';
        const startColumn = position.column - matchedText.length;

        range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: startColumn,
          endColumn: position.column,
        };
      } else {
        // For non-$ context, use Monaco's word detection
        const word = model.getWordUntilPosition(position);
        range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
      }

      const suggestions: monaco.languages.CompletionItem[] = [];

      if (isDollarContext) {
        // Suggest all JSONata functions
        for (const func of jsonataFunctions) {
          // Build snippet params with proper escaping
          const snippetParams = func.params
            .map((p, idx) => `\${${idx + 1}:${p.name}}`)
            .join(', ');

          // Build the full snippet - need to escape $ in function name for snippet syntax
          // In Monaco snippets, $ is special, so \\$ becomes literal $
          const escapedFuncName = func.name.replace(/\$/g, '\\$');
          const snippet = escapedFuncName + '(' + snippetParams + ')';

          suggestions.push({
            label: func.name,
            kind: monacoInstance.languages.CompletionItemKind.Function,
            documentation: {
              value: `**${func.signature}**\n\n${func.description}\n\n**Returns:** ${func.returns}${
                func.examples ? `\n\n**Examples:**\n\`\`\`jsonata\n${func.examples.join('\n')}\n\`\`\`` : ''
              }`,
              isTrusted: true
            },
            insertText: snippet,
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            detail: func.signature,
            sortText: `0_${func.name}`,
          });
        }
      }

      // Add keyword suggestions
      if (!isDollarContext) {
        for (const keyword of jsonataKeywords) {
          suggestions.push({
            label: keyword,
            kind: monacoInstance.languages.CompletionItemKind.Keyword,
            documentation: `JSONata keyword: ${keyword}`,
            insertText: keyword,
            range,
            sortText: `1_${keyword}`,
          });
        }
      }

      // Add common patterns as snippets
      const snippets = [
        {
          label: 'map',
          insertText: '$map(${1:array}, function($$v) {\n\t${2}\n})',
          documentation: 'Map over an array',
          detail: 'Map pattern'
        },
        {
          label: 'filter',
          insertText: '$filter(${1:array}, function($$v) {\n\t${2:$$v > 0}\n})',
          documentation: 'Filter an array',
          detail: 'Filter pattern'
        },
        {
          label: 'reduce',
          insertText: '$reduce(${1:array}, function($$acc, $$v) {\n\t${2:$$acc + $$v}\n}, ${3:0})',
          documentation: 'Reduce an array to a single value',
          detail: 'Reduce pattern'
        },
        {
          label: 'function',
          insertText: 'function(${1:params}) {\n\t${2}\n}',
          documentation: 'Define a function',
          detail: 'Function definition'
        },
        {
          label: 'lambda',
          insertText: 'λ(${1:params}) { ${2} }',
          documentation: 'Lambda function (short syntax)',
          detail: 'Lambda function'
        },
        {
          label: 'if-then-else',
          insertText: '${1:condition} ? ${2:true_value} : ${3:false_value}',
          documentation: 'Conditional expression',
          detail: 'Ternary operator'
        },
        {
          label: 'object-constructor',
          insertText: '{\n\t"${1:key}": ${2:value}\n}',
          documentation: 'Object constructor',
          detail: 'Object literal'
        },
        {
          label: 'array-constructor',
          insertText: '[${1:items}]',
          documentation: 'Array constructor',
          detail: 'Array literal'
        }
      ];

      for (const snippet of snippets) {
        if (!isDollarContext) {
          suggestions.push({
            label: snippet.label,
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            documentation: snippet.documentation,
            insertText: snippet.insertText,
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            detail: snippet.detail,
            sortText: `2_${snippet.label}`,
          });
        }
      }

      // Add common variable suggestions (context-aware)
      const variableSuggestions = [
        { label: '$$', detail: 'Context root', documentation: 'Reference to the root context' },
        { label: '$', detail: 'Current context', documentation: 'Reference to the current context' },
      ];

      if (textUntilPosition.includes('function')) {
        variableSuggestions.push(
          { label: '$v', detail: 'Value parameter', documentation: 'Common parameter name for values' },
          { label: '$i', detail: 'Index parameter', documentation: 'Common parameter name for indices' },
          { label: '$k', detail: 'Key parameter', documentation: 'Common parameter name for keys' },
          { label: '$acc', detail: 'Accumulator parameter', documentation: 'Common parameter name for accumulators' }
        );
      }

      for (const varSuggestion of variableSuggestions) {
        if (isDollarContext) {
          suggestions.push({
            label: varSuggestion.label,
            kind: monacoInstance.languages.CompletionItemKind.Variable,
            documentation: varSuggestion.documentation,
            insertText: varSuggestion.label,
            range,
            detail: varSuggestion.detail,
            sortText: `3_${varSuggestion.label}`,
          });
        }
      }

      return { suggestions };
    },
  };
}
