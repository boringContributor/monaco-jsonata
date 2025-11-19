import type * as monaco from 'monaco-editor';

export function createFormattingProvider(_monacoInstance: typeof monaco): monaco.languages.DocumentFormattingEditProvider {
  return {
    provideDocumentFormattingEdits: (model, options, _token) => {
      const text = model.getValue();
      const formatted = formatJsonata(text, options.tabSize, options.insertSpaces);

      return [
        {
          range: model.getFullModelRange(),
          text: formatted
        }
      ];
    }
  };
}

export function createRangeFormattingProvider(_monacoInstance: typeof monaco): monaco.languages.DocumentRangeFormattingEditProvider {
  return {
    provideDocumentRangeFormattingEdits: (model, range, options, _token) => {
      const text = model.getValueInRange(range);
      const formatted = formatJsonata(text, options.tabSize, options.insertSpaces);

      return [
        {
          range,
          text: formatted
        }
      ];
    }
  };
}

function formatJsonata(text: string, tabSize: number = 2, insertSpaces: boolean = true): string {
  const indent = insertSpaces ? ' '.repeat(tabSize) : '\t';
  let level = 0;
  let result = '';
  let inString = false;
  let stringChar = '';
  let escaped = false;
  let lastChar = '';
  let lineStart = true;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = i < text.length - 1 ? text[i + 1] : '';

    // Handle escape sequences
    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === '\\' && inString) {
      result += char;
      escaped = true;
      continue;
    }

    // Handle strings
    if ((char === '"' || char === "'" || char === '`') && !inString) {
      inString = true;
      stringChar = char;
      result += char;
      lineStart = false;
      continue;
    }

    if (char === stringChar && inString) {
      inString = false;
      stringChar = '';
      result += char;
      lineStart = false;
      continue;
    }

    if (inString) {
      result += char;
      if (char === '\n') {
        lineStart = true;
      } else if (!/\s/.test(char)) {
        lineStart = false;
      }
      continue;
    }

    // Handle comments
    if (char === '/' && nextChar === '/' && !inString) {
      // Line comment - copy until end of line
      let j = i;
      while (j < text.length && text[j] !== '\n') {
        result += text[j];
        j++;
      }
      i = j - 1;
      continue;
    }

    if (char === '/' && nextChar === '*' && !inString) {
      // Block comment - copy until */
      let j = i;
      while (j < text.length - 1 && !(text[j] === '*' && text[j + 1] === '/')) {
        result += text[j];
        j++;
      }
      if (j < text.length - 1) {
        result += '*/';
        i = j + 1;
      }
      continue;
    }

    // Skip multiple consecutive spaces (outside strings)
    if (char === ' ' && lastChar === ' ') {
      continue;
    }

    // Handle newlines and indentation
    if (char === '\n' || char === '\r') {
      // Skip if we already have a newline
      if (result.endsWith('\n')) {
        continue;
      }
      result += '\n';
      lineStart = true;
      lastChar = char;
      continue;
    }

    // Handle opening brackets
    if (char === '{' || char === '[' || char === '(') {
      // Remove trailing space before bracket
      result = result.trimEnd();
      result += char;

      // Add newline after opening bracket for objects and arrays (but not functions)
      if ((char === '{' || char === '[') && nextChar !== '}' && nextChar !== ']') {
        level++;
        result += '\n';
        lineStart = true;
      } else if (char === '(') {
        // Don't add newline for opening parenthesis
      } else {
        level++;
      }

      lastChar = char;
      continue;
    }

    // Handle closing brackets
    if (char === '}' || char === ']' || char === ')') {
      if (char === '}' || char === ']') {
        level = Math.max(0, level - 1);
        // Remove trailing whitespace and add newline if needed
        result = result.trimEnd();
        if (!result.endsWith('\n') && !result.endsWith('{') && !result.endsWith('[')) {
          result += '\n';
        }
        // Add indentation for closing bracket
        result += indent.repeat(level) + char;
      } else {
        // Closing parenthesis
        result = result.trimEnd();
        result += char;
      }

      lastChar = char;
      lineStart = false;
      continue;
    }

    // Handle commas
    if (char === ',' || char === ';') {
      result = result.trimEnd();
      result += char;

      // Add space or newline after comma depending on context
      if (level > 0 && (nextChar !== ' ' && nextChar !== '\n')) {
        result += '\n';
        lineStart = true;
      } else if (nextChar !== ' ' && nextChar !== '\n') {
        result += ' ';
      }

      lastChar = char;
      continue;
    }

    // Handle colons
    if (char === ':') {
      result = result.trimEnd();
      result += char;
      if (nextChar !== ' ') {
        result += ' ';
      }
      lastChar = char;
      continue;
    }

    // Handle operators
    if (isOperator(char, text, i)) {
      const operator = getOperator(text, i);
      result = result.trimEnd();

      // Add space before operator if needed
      if (lastChar && lastChar !== ' ' && lastChar !== '\n' && lastChar !== '(' && lastChar !== '[') {
        result += ' ';
      }

      result += operator;

      // Add space after operator if needed
      const afterOpPos = i + operator.length;
      const afterOpChar = afterOpPos < text.length ? text[afterOpPos] : '';
      if (afterOpChar && afterOpChar !== ' ' && afterOpChar !== '\n') {
        result += ' ';
      }

      i += operator.length - 1;
      lastChar = operator[operator.length - 1];
      lineStart = false;
      continue;
    }

    // Add indentation at line start
    if (lineStart && char !== ' ' && char !== '\t') {
      result += indent.repeat(level);
      lineStart = false;
    }

    // Skip whitespace at line start
    if (lineStart && (char === ' ' || char === '\t')) {
      continue;
    }

    // Add the character
    result += char;
    lastChar = char;

    if (!/\s/.test(char)) {
      lineStart = false;
    }
  }

  // Clean up trailing whitespace
  return result
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
}

function isOperator(char: string, text: string, index: number): boolean {
  const twoCharOps = ['~>', ':=', '..', '==', '!=', '<=', '>=', '&&', '||'];
  const twoChar = text.substring(index, index + 2);

  if (twoCharOps.includes(twoChar)) {
    return true;
  }

  const singleCharOps = ['+', '-', '*', '/', '%', '=', '<', '>', '&', '|', '?', '~'];
  return singleCharOps.includes(char);
}

function getOperator(text: string, index: number): string {
  const twoCharOps = ['~>', ':=', '..', '==', '!=', '<=', '>=', '&&', '||'];
  const twoChar = text.substring(index, index + 2);

  if (twoCharOps.includes(twoChar)) {
    return twoChar;
  }

  return text[index];
}
