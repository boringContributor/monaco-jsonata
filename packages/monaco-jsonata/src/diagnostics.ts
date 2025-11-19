import type * as monaco from 'monaco-editor';
import jsonata from 'jsonata';

export function createDiagnostics(
  monacoInstance: typeof monaco,
  model: monaco.editor.ITextModel
): monaco.editor.IMarkerData[] {
  const markers: monaco.editor.IMarkerData[] = [];
  const text = model.getValue();

  if (!text.trim()) {
    return markers;
  }

  try {
    // Try to parse the JSONata expression
    jsonata(text);
    // If successful, clear all markers
    return [];
  } catch (error: any) {
    // Parse error from JSONata
    const marker = parseJsonataError(error, text, monacoInstance);
    if (marker) {
      markers.push(marker);
    }
  }

  return markers;
}

function parseJsonataError(
  error: any,
  text: string,
  monacoInstance: typeof monaco
): monaco.editor.IMarkerData | null {
  const message = error.message || 'Unknown error';
  let position = error.position ?? 0;
  let token = error.token || '';
  const errorCode = error.code || 'JSONATA_ERROR';

  // Calculate line and column from position
  const lines = text.split('\n');
  let currentPos = 0;
  let lineNumber = 1;
  let column = 1;

  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1; // +1 for newline
    if (currentPos + lineLength > position) {
      lineNumber = i + 1;
      column = position - currentPos + 1;
      break;
    }
    currentPos += lineLength;
  }

  // Determine error severity based on error code
  let severity = monacoInstance.MarkerSeverity.Error;

  // S02xx codes are syntax errors
  // S03xx codes are evaluation errors (could be warnings in some cases)
  if (errorCode.startsWith('S03')) {
    severity = monacoInstance.MarkerSeverity.Warning;
  }

  // Calculate end column (highlight the token if available)
  let endColumn = column;
  if (token) {
    endColumn = column + token.length;
  } else {
    // Try to find the end of the current word
    const line = lines[lineNumber - 1];
    if (line) {
      let pos = column - 1;
      while (pos < line.length && /\S/.test(line[pos])) {
        pos++;
      }
      endColumn = pos + 1;
    }
  }

  // Ensure endColumn is at least one character ahead
  if (endColumn <= column) {
    endColumn = column + 1;
  }

  return {
    severity,
    startLineNumber: lineNumber,
    startColumn: column,
    endLineNumber: lineNumber,
    endColumn,
    message: formatErrorMessage(message, error),
    code: errorCode,
    source: 'jsonata'
  };
}

function formatErrorMessage(message: string, error: any): string {
  // Use the JSONata error message directly - it's already well-formatted
  let formattedMessage = message;

  // Add error code for reference
  if (error.code) {
    formattedMessage = `[${error.code}] ${formattedMessage}`;
  }

  // Add helpful tips based on error patterns
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('expected') && error.value && error.token) {
    formattedMessage += `\n\nExpected "${error.value}" but found "${error.token}"`;
  }

  if (lowerMessage.includes('unexpected token')) {
    formattedMessage += '\n\nTip: Check for missing or extra parentheses, brackets, or operators.';
  } else if (lowerMessage.includes('expected')) {
    formattedMessage += '\n\nTip: Make sure all expressions are properly closed.';
  } else if (lowerMessage.includes('undefined')) {
    formattedMessage += '\n\nTip: Check if the variable/function is defined or spelled correctly.';
  }

  return formattedMessage;
}

export function setupDiagnostics(
  monacoInstance: typeof monaco,
  model: monaco.editor.ITextModel
): monaco.IDisposable {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const validate = () => {
    const markers = createDiagnostics(monacoInstance, model);
    monacoInstance.editor.setModelMarkers(model, 'jsonata', markers);
  };

  // Initial validation
  validate();

  // Validate on content change with debouncing
  const disposable = model.onDidChangeContent(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(validate, 300);
  });

  return {
    dispose: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      disposable.dispose();
      monacoInstance.editor.setModelMarkers(model, 'jsonata', []);
    }
  };
}
