import type * as monaco from 'monaco-editor';

export interface JsonataFormatterOptions {
  printWidth?: number;
  tabWidth?: number;
  useTabs?: boolean;
}

export type FormatJsonataFunction = (
  code: string,
  options?: JsonataFormatterOptions
) => string | Promise<string>;

/**
 * Register editor actions for JSONata language
 *
 * @param monacoInstance - Monaco editor instance
 * @param editor - Editor instance
 * @param formatFunction - Optional formatter function (e.g., from @stedi/prettier-plugin-jsonata)
 */
export function registerJsonataActions(
  monacoInstance: typeof monaco,
  editor: monaco.editor.IStandaloneCodeEditor,
  formatFunction?: FormatJsonataFunction
) {
  const disposables: monaco.IDisposable[] = [];

  // Only register format action if formatter is provided
  if (formatFunction) {
    const formatAction = editor.addAction({
      id: 'jsonata.format',
      label: 'Format JSONata',
      contextMenuGroupId: '1_modification',
      contextMenuOrder: 1.5,
      keybindings: [
        monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyF,
      ],
      run: async (editor) => {
        const model = editor.getModel();
        if (!model || model.getLanguageId() !== 'jsonata') {
          return;
        }

        try {
          const code = model.getValue();
          const formatted = await formatFunction(code, {
            printWidth: 80,
            tabWidth: 2,
            useTabs: false,
          });

          // Apply the formatted code
          editor.executeEdits('jsonata.format', [
            {
              range: model.getFullModelRange(),
              text: formatted,
            },
          ]);
        } catch (error) {
          console.error('Failed to format JSONata:', error);
        }
      },
    });

    disposables.push(formatAction);
  }

  return {
    dispose: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}
