'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import jsonata from 'jsonata';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { BotMessageSquareIcon, SparklesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChatPanel, type ChatPanelHandle } from './chat-panel';

const DEFAULT_JSON = `{
  "firstName": "John",
  "lastName": "Doe",
  "age": 30,
  "address": {
    "city": "New York",
    "country": "USA"
  },
  "hobbies": ["reading", "coding", "hiking"]
}`;

const DEFAULT_EXPRESSION = `{
  "fullName": firstName & " " & lastName,
  "location": address.city & ", " & address.country,
  "hobbyCount": $count(hobbies)
}`;

export function Playground() {
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON);
  const [jsonataExpression, setJsonataExpression] = useState(DEFAULT_EXPRESSION);
  const [output, setOutput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const jsonataEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const chatRef = useRef<ChatPanelHandle>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMonacoMount = useCallback(
    async (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
      if (!monacoRef.current) {
        monacoRef.current = monaco;
        const { registerJsonataLanguage } = await import('monaco-jsonata');
        registerJsonataLanguage(monaco);
      }

      jsonataEditorRef.current = editor;

      try {
        const { registerJsonataActions } = await import('monaco-jsonata');
        const { formatJsonata } = await import('@stedi/prettier-plugin-jsonata/dist/lib');
        registerJsonataActions(monaco, editor, formatJsonata);
      } catch {
        // prettier plugin optional
      }
    },
    [],
  );

  useEffect(() => {
    const evaluateJsonata = async () => {
      try {
        const parsedInput = JSON.parse(jsonInput);
        const expression = jsonata(jsonataExpression);
        const result = await expression.evaluate(parsedInput);
        setOutput(JSON.stringify(result, null, 2) ?? 'undefined');
      } catch (error: unknown) {
        const err = error as { code?: string; message?: string; position?: number; token?: string };
        let msg = 'Error: Unknown error';
        if (err.message) {
          msg = err.code ? `Error [${err.code}]: ${err.message}` : `Error: ${err.message}`;
          if (err.position !== undefined) {
            msg += `\n\nPosition: ${err.position}`;
            if (err.token) msg += `\nToken: "${err.token}"`;
          }
        }
        setOutput(msg);
      }
    };

    const timer = setTimeout(evaluateJsonata, 300);
    return () => clearTimeout(timer);
  }, [jsonInput, jsonataExpression]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  const handleFormatJson = () => {
    try {
      setJsonInput(JSON.stringify(JSON.parse(jsonInput), null, 2));
    } catch {}
  };

  const handleApplyExpression = (expression: string) => {
    setJsonataExpression(expression);
  };

  const handleFixWithAI = useCallback(() => {
    if (!showChat) setShowChat(true);
    // Small delay to ensure chat is mounted before sending
    setTimeout(() => {
      chatRef.current?.sendSuggestion('Fix my expression');
    }, 100);
  }, [showChat]);

  return (
    <div className="flex flex-col h-screen w-screen">
      <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">JSONata Playground</h1>
        </div>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showChat ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setShowChat(!showChat)}
              >
                <BotMessageSquareIcon className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {showChat ? 'Hide AI Assistant' : 'Show AI Assistant'}
            </TooltipContent>
          </Tooltip>
          <a
            href="https://docs.jsonata.org/overview.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            JSONata Docs
          </a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <PanelGroup direction={isMobile ? 'vertical' : 'horizontal'} className="flex-1">
          {/* JSON Input */}
          <Panel defaultSize={30} minSize={15}>
            <div className="flex flex-col h-full">
              <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">JSON Input</h3>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(jsonInput)}>
                    Copy
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleFormatJson}>
                    Format
                  </Button>
                </div>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  defaultLanguage="json"
                  value={jsonInput}
                  onChange={(v) => setJsonInput(v || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'off',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    padding: { top: 12 },
                  }}
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle
            className={
              isMobile
                ? 'h-1 bg-border hover:bg-primary transition-colors'
                : 'w-1 bg-border hover:bg-primary transition-colors'
            }
          />

          {/* JSONata Expression */}
          <Panel defaultSize={35} minSize={15}>
            <div className="flex flex-col h-full">
              <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">JSONata Expression</h3>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(jsonataExpression)}>
                  Copy
                </Button>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  defaultLanguage="jsonata"
                  value={jsonataExpression}
                  onChange={(v) => setJsonataExpression(v || '')}
                  theme="jsonata-theme"
                  onMount={handleMonacoMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'off',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    padding: { top: 12 },
                  }}
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle
            className={
              isMobile
                ? 'h-1 bg-border hover:bg-primary transition-colors'
                : 'w-1 bg-border hover:bg-primary transition-colors'
            }
          />

          {/* Output */}
          <Panel defaultSize={35} minSize={15}>
            <div className="flex flex-col h-full">
              <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">Output</h3>
                <div className="flex items-center gap-2">
                  {output.startsWith('Error') && (
                    <Button variant="secondary" size="sm" className="gap-1.5" onClick={handleFixWithAI}>
                      <SparklesIcon className="size-3.5" />
                      Fix with AI
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(output)}>
                    Copy
                  </Button>
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
                    padding: { top: 12 },
                  }}
                />
              </div>
            </div>
          </Panel>
        </PanelGroup>

        {/* AI Chat Panel */}
        {showChat && (
          <ChatPanel
            ref={chatRef}
            jsonInput={jsonInput}
            jsonataExpression={jsonataExpression}
            output={output}
            hasError={output.startsWith('Error')}
            onApplyExpression={handleApplyExpression}
          />
        )}
      </div>

      <footer className="bg-card border-t border-border px-6 py-2 flex items-center justify-center gap-6 shrink-0">
        <a
          href="https://github.com/boringcontributor"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/sauerer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          LinkedIn
        </a>
      </footer>
    </div>
  );
}
