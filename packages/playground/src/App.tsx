import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import jsonata from 'jsonata';
import { formatJsonata } from '@stedi/prettier-plugin-jsonata/dist/lib';
import { registerJsonataLanguage, registerJsonataActions } from 'monaco-jsonata';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

function App() {
  const [jsonInput, setJsonInput] = useState('{\n  "firstName": "John",\n  "lastName": "Doe",\n  "age": 30,\n  "address": {\n    "city": "New York",\n    "country": "USA"\n  },\n  "hobbies": ["reading", "coding", "hiking"]\n}');
  const [jsonataExpression, setJsonataExpression] = useState('{\n  "fullName": firstName & " " & lastName,\n  "location": address.city & ", " & address.country,\n  "hobbyCount": $count(hobbies)\n}');
  const [output, setOutput] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const jsonataEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMonacoMount = (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
    if (!monacoRef.current) {
      monacoRef.current = monaco;
      registerJsonataLanguage(monaco);
    }

    // Store editor reference
    jsonataEditorRef.current = editor;

    // Register editor actions with format function
    registerJsonataActions(monaco, editor, formatJsonata);
  };

  useEffect(() => {
    const evaluateJsonata = async () => {
      try {
        const parsedInput = JSON.parse(jsonInput);
        const expression = jsonata(jsonataExpression);
        const result = await expression.evaluate(parsedInput);
        setOutput(JSON.stringify(result, null, 2));
      } catch (error: any) {
        // Format JSONata errors with more detail
        let errorMessage = 'Error: Unknown error occurred';

        if (error?.message) {
          errorMessage = `Error: ${error.message}`;

          // Add error code if available (JSONata errors have this)
          if (error.code) {
            errorMessage = `Error [${error.code}]: ${error.message}`;
          }

          // Add position information if available
          if (error.position !== undefined) {
            errorMessage += `\n\nPosition: ${error.position}`;

            if (error.token) {
              errorMessage += `\nToken: "${error.token}"`;
            }
          }
        } else if (typeof error === 'string') {
          errorMessage = `Error: ${error}`;
        }

        setOutput(errorMessage);
      }
    };

    const debounceTimer = setTimeout(evaluateJsonata, 300);
    return () => clearTimeout(debounceTimer);
  }, [jsonInput, jsonataExpression]);

  const handleFormatJsonata = async () => {
    try {
      const formatted = await formatJsonata(jsonataExpression, {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
      });
      setJsonataExpression(formatted);
    } catch (error) {
      console.error('Failed to format JSONata:', error);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error('Failed to format JSON:', error);
    }
  };

  const handleFormatOutput = () => {
    try {
      const parsed = JSON.parse(output);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error('Failed to format output:', error);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/shivi.png"
            alt="Shiva"
            className="w-16 h-16 rounded-full object-cover"
          />
          <h1 className="text-xl font-semibold">JSONata Playground</h1>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://docs.jsonata.org/overview.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            JSONata Docs
          </a>
        </div>
      </header>

      <PanelGroup direction={isMobile ? "vertical" : "horizontal"} className="flex flex-1 overflow-hidden">
        <Panel defaultSize={33.33} minSize={20} maxSize={60}>
          <div
            className="flex flex-col h-full"
          >
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">JSON Input</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(jsonInput)}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  Copy
                </button>
                <button
                  onClick={handleFormatJson}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  Format
                </button>
              </div>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={jsonInput}
                onChange={(value) => setJsonInput(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  padding: { top: 12 }
                }}
              />
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className={isMobile ? "h-1 bg-gray-700 hover:bg-blue-500 transition-colors" : "w-1 bg-gray-700 hover:bg-blue-500 transition-colors"} />

        <Panel defaultSize={33.33} minSize={20} maxSize={60}>
          <div
            className="flex flex-col h-full"
          >
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">JSONata Expression</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(jsonataExpression)}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  Copy
                </button>
                <button
                  onClick={handleFormatJsonata}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  Format
                </button>
              </div>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="jsonata"
                value={jsonataExpression}
                onChange={(value) => setJsonataExpression(value || '')}
                theme="jsonata-theme"
                onMount={handleMonacoMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  padding: { top: 12 }
                }}
              />
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className={isMobile ? "h-1 bg-gray-700 hover:bg-blue-500 transition-colors" : "w-1 bg-gray-700 hover:bg-blue-500 transition-colors"} />

        <Panel defaultSize={33.33} minSize={20} maxSize={60}>
          <div
            className="flex flex-col h-full"
          >
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">Output</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(output)}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  Copy
                </button>
                <button
                  onClick={handleFormatOutput}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  Format
                </button>
              </div>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={output}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  padding: { top: 12 }
                }}
              />
            </div>
          </div>
        </Panel>
      </PanelGroup>

      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-3 flex items-center justify-center gap-6">
        <a
          href="https://github.com/boringcontributor"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/sauerer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </a>
        <a
          href="https://dev.to/boringcontributor"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6l.02 2.44.04 2.45.56-.02c.41 0 .63-.07.83-.26.24-.24.26-.36.26-2.2 0-1.91-.02-1.96-.29-2.18zM0 4.94v14.12h24V4.94H0zM8.56 15.3c-.44.58-1.06.77-2.53.77H4.71V8.53h1.4c1.67 0 2.16.18 2.6.9.27.43.29.6.32 2.57.05 2.23-.02 2.73-.47 3.3zm5.09-5.47h-2.47v1.77h1.52v1.28l-.72.04-.75.03v1.77l1.22.03 1.2.04v1.28h-1.6c-1.53 0-1.6-.01-1.87-.3l-.3-.28v-3.16c0-3.02.01-3.18.25-3.48.23-.31.25-.31 1.88-.31h1.64v1.3zm4.68 5.45c-.17.43-.64.79-1 .79-.18 0-.45-.15-.67-.39-.32-.32-.45-.63-.82-2.08l-.9-3.39-.45-1.67h.76c.4 0 .75.02.75.05 0 .06 1.16 4.54 1.26 4.83.04.15.32-.7.73-2.3l.66-2.52.74-.04c.4-.02.73 0 .73.04 0 .14-1.67 6.38-1.8 6.68z"/>
          </svg>
          DEV.to
        </a>
      </footer>
    </div>
  );
}

export default App;
