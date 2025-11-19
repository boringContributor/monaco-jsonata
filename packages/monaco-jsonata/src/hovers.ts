import type * as monaco from 'monaco-editor';
import { jsonataFunctionMap, jsonataKeywords } from './jsonata-functions';

export function createHoverProvider(monacoInstance: typeof monaco): monaco.languages.HoverProvider {
  return {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (!word) {
        return null;
      }

      const wordText = word.word;

      // Check if it's a JSONata function (starts with $)
      if (wordText.startsWith('$')) {
        const func = jsonataFunctionMap.get(wordText);
        if (func) {
          const paramsDoc = func.params.map(p => {
            const optionalMark = p.optional ? '?' : '';
            return `- **${p.name}${optionalMark}** (\`${p.type}\`): ${p.description}`;
          }).join('\n');

          const examplesDoc = func.examples
            ? `\n\n**Examples:**\n\`\`\`jsonata\n${func.examples.join('\n')}\n\`\`\``
            : '';

          const docsLink = func.docsUrl
            ? `\n\n[📖 View official documentation](${func.docsUrl})`
            : '';

          const markdown: monaco.IMarkdownString = {
            value: [
              `### ${func.name}`,
              '',
              '```typescript',
              func.signature,
              '```',
              '',
              func.description,
              '',
              '**Parameters:**',
              paramsDoc,
              '',
              `**Returns:** \`${func.returns}\``,
              examplesDoc,
              docsLink
            ].join('\n'),
            isTrusted: true,
            supportHtml: false
          };

          return {
            range: new monacoInstance.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn
            ),
            contents: [markdown]
          };
        }
      }

      // Check if it's a keyword
      if (jsonataKeywords.includes(wordText)) {
        const keywordDocs: Record<string, string> = {
          'function': 'Defines a function\n\n```jsonata\nfunction($x, $y) { $x + $y }\n```',
          'lambda': 'Lambda function (alternative syntax)\n\n```jsonata\nλ($x) { $x * 2 }\n```',
          'if': 'Conditional expression (used with then/else)\n\n```jsonata\nif(age >= 18) then "adult" else "minor"\n```',
          'then': 'True branch of conditional',
          'else': 'False branch of conditional',
          'and': 'Logical AND operator\n\n```jsonata\nage > 18 and verified = true\n```',
          'or': 'Logical OR operator\n\n```jsonata\nstatus = "active" or status = "pending"\n```',
          'in': 'Tests if a value is in an array\n\n```jsonata\n"red" in colors\n```',
          'null': 'Null value',
          'true': 'Boolean true value',
          'false': 'Boolean false value'
        };

        const doc = keywordDocs[wordText];
        if (doc) {
          return {
            range: new monacoInstance.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn
            ),
            contents: [
              {
                value: `**${wordText}** (keyword)\n\n${doc}`,
                isTrusted: true
              }
            ]
          };
        }
      }

      return null;
    }
  };
}
