/**
 * React Integration Example for monaco-jsonata
 *
 * This example shows how to integrate the JSONata language extension
 * with Monaco Editor in a React application using @monaco-editor/react
 */

import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { registerJsonataLanguage } from 'monaco-jsonata';

export function JSONataEditor() {
  const monacoRef = useRef<typeof Monaco | null>(null);

  const handleEditorWillMount = (monaco: typeof Monaco) => {
    // Register JSONata language before editor mounts
    monacoRef.current = monaco;
    registerJsonataLanguage(monaco);
  };

  const handleEditorDidMount = (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
    // Optional: Set up additional editor configurations
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
    });
  };

  return (
    <div style={{ height: '400px', border: '1px solid #ccc' }}>
      <Editor
        height="100%"
        defaultLanguage="jsonata"
        defaultValue='{\n  "fullName": firstName & " " & lastName,\n  "total": $sum(items.price)\n}'
        theme="jsonata-theme"
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
    </div>
  );
}

/**
 * Alternative: Using Monaco Editor directly (without React wrapper)
 */
export function DirectMonacoExample() {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Dynamically import Monaco
    import('monaco-editor').then((monaco) => {
      // Register JSONata language
      registerJsonataLanguage(monaco);

      // Create editor instance
      const editor = monaco.editor.create(editorRef.current!, {
        value: '{\n  "result": $sum([1, 2, 3, 4])\n}',
        language: 'jsonata',
        theme: 'jsonata-theme',
        automaticLayout: true,
      });

      editorInstanceRef.current = editor;
    });

    // Cleanup
    return () => {
      editorInstanceRef.current?.dispose();
    };
  }, []);

  return <div ref={editorRef} style={{ height: '400px', border: '1px solid #ccc' }} />;
}

/**
 * Advanced Example: With custom options and event handlers
 */
export function AdvancedJSONataEditor() {
  const monacoRef = useRef<typeof Monaco | null>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorWillMount = (monaco: typeof Monaco) => {
    monacoRef.current = monaco;

    // Register with custom options
    registerJsonataLanguage(monaco, {
      enableDiagnostics: true,
      enableCompletion: true,
      enableHover: true,
      enableSignatureHelp: true,
      enableFormatting: true,
    });
  };

  const handleEditorDidMount = (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
    editorRef.current = editor;

    // Add custom keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const value = editor.getValue();
      console.log('Saving:', value);
      // Implement your save logic here
    });

    // Listen to content changes
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      console.log('Content changed:', value);
    });

    // Add format command
    editor.addAction({
      id: 'format-jsonata',
      label: 'Format JSONata',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      run: (ed) => {
        ed.getAction('editor.action.formatDocument')?.run();
      },
    });
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <button onClick={handleFormat}>Format Code</button>
      </div>
      <Editor
        height="400px"
        defaultLanguage="jsonata"
        defaultValue='$map(items, function($item) { $item.name })'
        theme="jsonata-theme"
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
      />
    </div>
  );
}
