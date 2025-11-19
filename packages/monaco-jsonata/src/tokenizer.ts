import type * as monaco from 'monaco-editor';
import { jsonataKeywords } from './jsonata-functions';

export const jsonataTokensProvider: monaco.languages.IMonarchLanguage = {
  defaultToken: 'invalid',
  tokenPostfix: '.jsonata',

  keywords: jsonataKeywords,

  operators: [
    '~>', ':=', '..', '?', ':', '=', '==', '!=', '<', '>', '<=', '>=',
    '+', '-', '*', '/', '%', '&', '|'
  ],

  symbols: /[=><!~?:&|+\-*/%^]+/,
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  digits: /\d+(_+\d+)*/,
  octaldigits: /[0-7]+(_+[0-7]+)*/,
  binarydigits: /[0-1]+(_+[0-1]+)*/,
  hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,

  tokenizer: {
    root: [
      // Whitespace
      { include: '@whitespace' },

      // JSONata function names (start with $)
      [/\$[a-zA-Z_]\w*/, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'variable.predefined'
        }
      }],

      // Identifiers and keywords
      [/[a-zA-Z_]\w*/, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'identifier'
        }
      }],

      // Delimiters and operators
      [/[{}[\]()]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': ''
        }
      }],

      // Numbers
      [/(@digits)[eE]([-+]?(@digits))?/, 'number.float'],
      [/(@digits)\.(@digits)([eE][-+]?(@digits))?/, 'number.float'],
      [/0[xX](@hexdigits)/, 'number.hex'],
      [/0[oO]?(@octaldigits)/, 'number.octal'],
      [/0[bB](@binarydigits)/, 'number.binary'],
      [/(@digits)/, 'number'],

      // Delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],

      // Strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
      [/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
      [/`([^`\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
      [/"/, 'string', '@string_double'],
      [/'/, 'string', '@string_single'],
      [/`/, 'string', '@string_backtick'],

      // Regular expressions
      [/\/(?=([^\/\\]|\\.)+\/)/, 'regexp', '@regexp'],
    ],

    whitespace: [
      [/[ \t\r\n]+/, ''],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],

    comment: [
      [/[^/*]+/, 'comment'],
      [/\*\//, 'comment', '@pop'],
      [/[/*]/, 'comment']
    ],

    string_double: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string', '@pop']
    ],

    string_single: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, 'string', '@pop']
    ],

    string_backtick: [
      [/[^\\`]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/`/, 'string', '@pop']
    ],

    regexp: [
      [/[^\\/\[]+/, 'regexp'],
      [/\[/, 'regexp.escape', '@regexp_class'],
      [/\\/, 'regexp.escape', '@regexp_escape'],
      [/\/[gimuy]*/, 'regexp', '@pop'],
    ],

    regexp_class: [
      [/[^\]\\]+/, 'regexp.escape'],
      [/\\/, 'regexp.escape', '@regexp_escape'],
      [/\]/, 'regexp.escape', '@pop'],
    ],

    regexp_escape: [
      [/./, 'regexp.escape', '@pop'],
    ],
  },
};

export const jsonataLanguageConfiguration: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/']
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"', notIn: ['string'] },
    { open: "'", close: "'", notIn: ['string', 'comment'] },
    { open: '`', close: '`', notIn: ['string', 'comment'] }
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '`', close: '`' }
  ],
  folding: {
    markers: {
      start: /^\s*\/\*\s*#region\b/,
      end: /^\s*\*\/\s*#endregion\b/
    }
  },
  // Word pattern that includes $ as part of JSONata identifiers
  wordPattern: /(\$\w+)|(-?\d*\.\d\w*)|([a-zA-Z_]\w*)/g,
  indentationRules: {
    increaseIndentPattern: /^((?!\/\/).)*(\{[^}"'`]*|\([^)"'`]*|\[[^\]"'`]*)$/,
    decreaseIndentPattern: /^((?!.*?\/\*).*\*\/)?\s*[\)}]\s*$/
  },
  onEnterRules: [
    {
      // e.g. /** | */
      beforeText: /^\s*\/\*\*(?!\/)([^*]|\*(?!\/))*$/,
      afterText: /^\s*\*\/$/,
      action: { indentAction: 3, appendText: ' * ' } // IndentAction.IndentOutdent
    },
    {
      // e.g. /** ...|
      beforeText: /^\s*\/\*\*(?!\/)([^*]|\*(?!\/))*$/,
      action: { indentAction: 0, appendText: ' * ' } // IndentAction.None
    },
    {
      // e.g.  * ...|
      beforeText: /^(\t|[ ])*[ ]\*([^*]|\*(?!\/))*$/,
      action: { indentAction: 0, appendText: '* ' } // IndentAction.None
    },
    {
      // e.g.  */|
      beforeText: /^(\t|[ ])*[ ]\*\/\s*$/,
      action: { indentAction: 0, removeText: 1 } // IndentAction.None
    }
  ]
};

export const jsonataTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A9955' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'string.escape', foreground: 'D7BA7D' },
    { token: 'string.escape.invalid', foreground: 'FF0000' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'number.hex', foreground: 'B5CEA8' },
    { token: 'number.binary', foreground: 'B5CEA8' },
    { token: 'number.octal', foreground: 'B5CEA8' },
    { token: 'number.float', foreground: 'B5CEA8' },
    { token: 'regexp', foreground: 'D16969' },
    { token: 'regexp.escape', foreground: 'D7BA7D' },
    { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
    { token: 'operator', foreground: 'D4D4D4' },
    { token: 'variable.predefined', foreground: '4FC1FF', fontStyle: 'bold' },
    { token: 'identifier', foreground: '9CDCFE' },
    { token: 'delimiter', foreground: 'D4D4D4' },
    { token: 'delimiter.bracket', foreground: 'FFD700' }
  ],
  colors: {
    'editor.foreground': '#D4D4D4',
    'editor.background': '#1E1E1E',
    'editorCursor.foreground': '#AEAFAD',
    'editor.lineHighlightBackground': '#2A2A2A',
    'editorLineNumber.foreground': '#858585',
    'editor.selectionBackground': '#264F78',
    'editor.inactiveSelectionBackground': '#3A3D41'
  }
};
