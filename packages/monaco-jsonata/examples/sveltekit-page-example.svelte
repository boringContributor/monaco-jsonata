<script lang="ts">
  /**
   * Example SvelteKit +page.svelte that uses the JSONata editor component
   */

  import JSONataEditor from './sveltekit-example.svelte';

  let editorRef: any;
  let currentValue = '';

  function handleFormat() {
    editorRef?.format();
  }

  function handleGetValue() {
    const value = editorRef?.getValue();
    currentValue = value;
    console.log('Current value:', value);
  }

  function handleSetExample() {
    const example = `$map(products, function($p) {
  {
    "name": $p.name,
    "price": $p.price,
    "discounted": $p.price * 0.9
  }
})`;
    editorRef?.setValue(example);
  }
</script>

<svelte:head>
  <title>JSONata Editor - SvelteKit Example</title>
</svelte:head>

<div class="container">
  <h1>Monaco JSONata - SvelteKit Integration</h1>

  <div class="toolbar">
    <button on:click={handleFormat}>Format Code</button>
    <button on:click={handleGetValue}>Get Value</button>
    <button on:click={handleSetExample}>Load Example</button>
  </div>

  <JSONataEditor
    bind:this={editorRef}
    bind:value={currentValue}
    height="500px"
    theme="jsonata-theme"
  />

  <div class="info">
    <h3>Current Value Length: {currentValue.length} characters</h3>
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    margin-bottom: 20px;
    color: #333;
  }

  .toolbar {
    margin-bottom: 10px;
    display: flex;
    gap: 10px;
  }

  button {
    padding: 8px 16px;
    background: #0066cc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  }

  button:hover {
    background: #0052a3;
  }

  .info {
    margin-top: 20px;
    padding: 15px;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .info h3 {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
</style>
