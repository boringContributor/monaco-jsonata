'use client';

import { useChat } from '@ai-sdk/react';
import { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import {
  Reasoning,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from '@/components/ai-elements/prompt-input';
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion';
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockFilename,
  CodeBlockActions,
  CodeBlockCopyButton,
} from '@/components/ai-elements/code-block';

export interface ChatPanelHandle {
  sendSuggestion: (suggestion: string) => void;
}

interface ChatPanelProps {
  jsonInput: string;
  jsonataExpression: string;
  output: string;
  hasError: boolean;
  onApplyExpression: (expression: string) => void;
  ref?: React.Ref<ChatPanelHandle>;
}

function extractJsonataBlocks(text: string): string[] {
  const blocks: string[] = [];
  const regex = /```jsonata\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

function getMessageText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p) => p.type === 'text' && p.text)
    .map((p) => p.text!)
    .join('');
}

function removeJsonataBlocks(text: string): string {
  // Remove complete jsonata code blocks
  let result = text.replace(/```jsonata\n[\s\S]*?```/g, '');
  // Also remove incomplete jsonata code blocks (during streaming)
  result = result.replace(/```jsonata[\s\S]*$/g, '');
  return result.trim();
}

function deriveFieldSuggestions(jsonInput: string): string[] {
  try {
    const parsed = JSON.parse(jsonInput);
    const keys = Object.keys(parsed);
    const suggestions: string[] = [];

    // Find arrays for aggregation suggestions
    for (const key of keys) {
      if (Array.isArray(parsed[key])) {
        suggestions.push(`Map over ${key}`);
      }
      if (typeof parsed[key] === 'object' && parsed[key] !== null && !Array.isArray(parsed[key])) {
        suggestions.push(`Flatten ${key}`);
      }
    }

    if (suggestions.length === 0) {
      suggestions.push('Transform to flat object');
    }

    // Always offer a general suggestion
    suggestions.push('Write a new expression');

    return suggestions.slice(0, 3);
  } catch {
    return ['Write a new expression', 'Help with JSONata syntax'];
  }
}

interface ExpressionConfirmationProps {
  expression: string;
  onAccept: () => void;
  onReject: () => void;
  applied: boolean;
  rejected: boolean;
}

function ExpressionConfirmation({ expression, onAccept, onReject, applied, rejected }: ExpressionConfirmationProps) {
  return (
    <div className="flex flex-col gap-2">
      <CodeBlock code={expression} language="javascript">
        <CodeBlockHeader>
          <CodeBlockTitle>
            <CodeBlockFilename>jsonata</CodeBlockFilename>
          </CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton />
          </CodeBlockActions>
        </CodeBlockHeader>
      </CodeBlock>

      {applied ? (
        <Alert className="border-green-500/30 bg-green-500/10">
          <AlertDescription className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs">
            <CheckIcon className="size-3.5" />
            Applied to editor
          </AlertDescription>
        </Alert>
      ) : rejected ? (
        <Alert className="border-muted-foreground/30 bg-muted/50">
          <AlertDescription className="text-muted-foreground text-xs">
            Dismissed
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-2"
            onClick={onAccept}
          >
            <CheckIcon className="size-4" />
            Accept & Apply
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function ChatPanel({ jsonInput, jsonataExpression, output, hasError, onApplyExpression, ref }: ChatPanelProps) {
  // Use refs for context values to avoid re-renders on every keystroke
  const contextRef = useRef({ jsonInput, jsonataExpression, output });
  contextRef.current = { jsonInput, jsonataExpression, output };

  // Track applied/rejected state per code block: key is `${messageId}-${blockIndex}`
  const [blockStates, setBlockStates] = useState<Record<string, 'applied' | 'rejected'>>({});

  const buildContext = useCallback(() => {
    const ctx = contextRef.current;
    return `Current context:
\`\`\`json
${ctx.jsonInput}
\`\`\`

Current JSONata expression:
\`\`\`jsonata
${ctx.jsonataExpression}
\`\`\`

Current output:
\`\`\`
${ctx.output}
\`\`\``;
  }, []);

  const { messages: rawMessages, status, sendMessage, stop } = useChat();

  const isStreaming = status === 'streaming';
  const isSubmitted = status === 'submitted';
  const isLoading = isStreaming || isSubmitted;

  // Deduplicate messages; only filter empty assistant messages when idle (not during streaming)
  const messages = rawMessages
    .filter((msg, idx, arr) => arr.findIndex((m) => m.id === msg.id) === idx)
    .filter((msg) => {
      if (!isLoading && msg.role === 'assistant') {
        const text = getMessageText(msg.parts);
        return text.length > 0;
      }
      return true;
    });

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      const contextMessage = `${buildContext()}\n\nUser request: ${suggestion}`;
      sendMessage({ text: contextMessage });
    },
    [buildContext, sendMessage],
  );

  const handlePromptSubmit = useCallback(
    ({ text }: { text: string }) => {
      if (!text.trim()) return;
      const contextMessage = `${buildContext()}\n\nUser request: ${text}`;
      sendMessage({ text: contextMessage });
    },
    [buildContext, sendMessage],
  );

  const getDisplayContent = (text: string, role: string) => {
    if (role === 'user') {
      const match = text.match(/User request: ([\s\S]*)$/);
      return match ? match[1] : text;
    }
    return text;
  };

  const handleAccept = useCallback((blockKey: string, expression: string) => {
    onApplyExpression(expression);
    setBlockStates((prev) => ({ ...prev, [blockKey]: 'applied' }));
  }, [onApplyExpression]);

  const handleReject = useCallback((blockKey: string) => {
    setBlockStates((prev) => ({ ...prev, [blockKey]: 'rejected' }));
  }, []);

  useImperativeHandle(ref, () => ({
    sendSuggestion: handleSuggestion,
  }), [handleSuggestion]);

  const errorSuggestions = ['Fix my expression', 'Explain the error', 'Rewrite it'];
  const dynamicSuggestions = deriveFieldSuggestions(jsonInput);
  const suggestions = hasError ? errorSuggestions : dynamicSuggestions;

  return (
    <div className="w-[400px] border-l border-border flex flex-col bg-background shrink-0">
      <Conversation>
        <ConversationContent className="gap-6 p-4">
          {messages.length === 0 && (
            <ConversationEmptyState
              title={hasError ? 'Expression Error' : 'JSONata AI Assistant'}
              description={
                hasError
                  ? 'Your expression has an error. Ask me to fix it!'
                  : 'Ask me to create, fix, or adjust JSONata expressions'
              }
            >
              <div className="mt-4 w-full">
                <Suggestions className="flex-wrap! w-full! justify-center gap-2">
                  {suggestions.map((s) => (
                    <Suggestion
                      key={s}
                      suggestion={s}
                      onClick={handleSuggestion}
                    />
                  ))}
                </Suggestions>
              </div>
            </ConversationEmptyState>
          )}

          {messages.map((message, msgIndex) => {
            const fullText = getMessageText(message.parts);
            const displayContent = getDisplayContent(fullText, message.role);
            const jsonataBlocks = message.role === 'assistant' ? extractJsonataBlocks(fullText) : [];

            return (
              <Message key={`${message.id}-${msgIndex}`} from={message.role}>
                <MessageContent>
                  {message.role === 'user' ? (
                    <p className="text-sm">{displayContent}</p>
                  ) : (
                    <>
                      <MessageResponse>{removeJsonataBlocks(displayContent)}</MessageResponse>
                      {jsonataBlocks.map((block, i) => {
                        const blockKey = `${message.id}-${i}`;
                        const state = blockStates[blockKey];
                        return (
                          <ExpressionConfirmation
                            key={blockKey}
                            expression={block}
                            applied={state === 'applied'}
                            rejected={state === 'rejected'}
                            onAccept={() => handleAccept(blockKey, block)}
                            onReject={() => handleReject(blockKey)}
                          />
                        );
                      })}
                    </>
                  )}
                </MessageContent>
              </Message>
            );
          })}

          {isLoading && messages.length > 0 && !messages[messages.length - 1]?.parts?.some(p => p.type === 'text' && p.text) && (
            <Message from="assistant">
              <MessageContent>
                <Reasoning isStreaming={isLoading}>
                  <ReasoningTrigger />
                </Reasoning>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border p-3">
        <PromptInput onSubmit={handlePromptSubmit}>
          <PromptInputTextarea
            placeholder={hasError ? 'Ask me to fix the error...' : 'Ask about JSONata...'}
            disabled={isStreaming}
          />
          <PromptInputFooter>
            <div />
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
