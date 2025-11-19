import type * as monaco from 'monaco-editor';
import { jsonataFunctionMap } from './jsonata-functions';

export function createSignatureHelpProvider(monacoInstance: typeof monaco): monaco.languages.SignatureHelpProvider {
  return {
    signatureHelpTriggerCharacters: ['(', ','],
    signatureHelpRetriggerCharacters: [','],

    provideSignatureHelp: (model, position, _token, context) => {
      // Find the function call context
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      // Find the last opening parenthesis and the function name before it
      const functionCallMatch = findFunctionCall(textUntilPosition);

      if (!functionCallMatch) {
        return null;
      }

      const { functionName, paramIndex } = functionCallMatch;

      // Look up the function
      const func = jsonataFunctionMap.get(functionName);
      if (!func) {
        return null;
      }

      // Build parameter information
      const parameters: monaco.languages.ParameterInformation[] = func.params.map(param => {
        const optionalMark = param.optional ? '?' : '';
        return {
          label: `${param.name}${optionalMark}: ${param.type}`,
          documentation: {
            value: param.description,
            isTrusted: true
          }
        };
      });

      const signature: monaco.languages.SignatureInformation = {
        label: func.signature,
        documentation: {
          value: func.description,
          isTrusted: true
        },
        parameters,
        activeParameter: Math.min(paramIndex, parameters.length - 1)
      };

      return {
        value: {
          signatures: [signature],
          activeSignature: 0,
          activeParameter: Math.min(paramIndex, parameters.length - 1)
        },
        dispose: () => {}
      };
    }
  };
}

interface FunctionCallInfo {
  functionName: string;
  paramIndex: number;
}

function findFunctionCall(text: string): FunctionCallInfo | null {
  let depth = 0;
  let paramIndex = 0;
  let functionName = '';
  let inString = false;
  let stringChar = '';
  let escaped = false;

  // Scan backwards from the end
  for (let i = text.length - 1; i >= 0; i--) {
    const char = text[i];
    const prevChar = i > 0 ? text[i - 1] : '';

    // Handle string escaping
    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\' && inString) {
      escaped = true;
      continue;
    }

    // Handle strings
    if ((char === '"' || char === "'" || char === '`') && !inString) {
      inString = true;
      stringChar = char;
      continue;
    }

    if (char === stringChar && inString) {
      inString = false;
      stringChar = '';
      continue;
    }

    if (inString) {
      continue;
    }

    // Track parentheses depth
    if (char === ')') {
      depth++;
    } else if (char === '(') {
      if (depth === 0) {
        // Found the opening parenthesis of our function call
        // Extract function name
        let nameEnd = i - 1;
        while (nameEnd >= 0 && /\s/.test(text[nameEnd])) {
          nameEnd--;
        }

        if (nameEnd >= 0) {
          let nameStart = nameEnd;
          while (nameStart >= 0 && /[$\w]/.test(text[nameStart])) {
            nameStart--;
          }
          functionName = text.substring(nameStart + 1, nameEnd + 1);

          if (functionName.startsWith('$')) {
            return { functionName, paramIndex };
          }
        }
        return null;
      }
      depth--;
    } else if (char === ',' && depth === 0) {
      // Count parameters at depth 0
      paramIndex++;
    }
  }

  return null;
}
