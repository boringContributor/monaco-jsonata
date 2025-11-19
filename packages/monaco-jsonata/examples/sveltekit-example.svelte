<script lang="ts">
  /**
   * SvelteKit Integration Example for monaco-jsonata
   *
   * This example shows how to integrate the JSONata language extension
   * with Monaco Editor in a SvelteKit application
   */

  import { onMount, onDestroy } from 'svelte';
  import type * as Monaco from 'monaco-editor';

  let editorContainer: HTMLDivElement;
  let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
  let monaco: typeof Monaco | null = null;

  // Props
  export let value = '{\n  "fullName": firstName & " " & lastName\n}';
  export let height = '400px';
  export let theme = 'jsonata-theme';

  onMount(async () => {
    // Dynamically import Monaco Editor (important for SSR)
    const monacoModule = await import('monaco-editor');
    monaco = monacoModule.default;

    // Import and register JSONata language
    const { registerJsonataLanguage } = await import('monaco-jsonata');
    registerJsonataLanguage(monaco);

    // Create editor instance
    editor = monaco.editor.create(editorContainer, {
      value,
      language: 'jsonata',
      theme,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
    });

    // Listen to changes
    editor.onDidChangeModelContent(() => {
      if (editor) {
        value = editor.getValue();
      }
    });
  });

  onDestroy(() => {
    editor?.dispose();
  });

  // Expose format function
  export function format() {
    if (editor) {
      editor.getAction('editor.action.formatDocument')?.run();
    }
  }

  // Expose get/set value
  export function getValue() {
    return editor?.getValue() || '';
  }

  export function setValue(newValue: string) {
    if (editor) {
      editor.setValue(newValue);
    }
  }
</script>

<div class="jsonata-editor-wrapper">
  <div class="editor-container" bind:this={editorContainer} style="height: {height};" />
</div>

<style>
  .jsonata-editor-wrapper {
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
  }

  .editor-container {
    width: 100%;
  }
</style>
