import type { Monaco } from '@monaco-editor/react';
import type { editor, Position } from 'monaco-editor';

const languageId = 'plantuml';
let configured = false;

const completionItems = [
  ['startuml', '@startuml\n\t$0\n@enduml', 'Bloco básico de um diagrama PlantUML'],
  ['actor', 'actor ${1:Usuário}', 'Declara um ator'],
  ['participant', 'participant ${1:Participante}', 'Declara um participante'],
  ['class', 'class ${1:Nome} {\n\t$0\n}', 'Declara uma classe'],
  ['interface', 'interface ${1:Nome}', 'Declara uma interface'],
  ['component', 'component "${1:Componente}" as ${2:componente}', 'Declara um componente'],
  ['package', 'package "${1:Pacote}" {\n\t$0\n}', 'Declara um pacote'],
  ['note', 'note ${1:right}: ${2:Texto}', 'Adiciona uma nota'],
  ['alt', 'alt ${1:Condição}\n\t$0\nelse ${2:Alternativa}\nend', 'Adiciona um bloco alternativo'],
  ['loop', 'loop ${1:Descrição}\n\t$0\nend', 'Adiciona um loop'],
  ['if', 'if (${1:condição}) then (sim)\n\t$0\nelse (não)\nendif', 'Adiciona uma condição'],
  ['skinparam', 'skinparam ${1:parâmetro} ${2:valor}', 'Configura a aparência do diagrama'],
  ['include', '!include ${1:caminho}', 'Inclui outro arquivo PlantUML'],
  ['include_once', '!include_once ${1:caminho}', 'Inclui um arquivo apenas uma vez'],
  ['include_many', '!include_many ${1:caminho}', 'Permite incluir o mesmo arquivo várias vezes'],
] as const;

export function configurePlantUmlLanguage(monaco: Monaco) {
  if (configured) return;
  configured = true;

  monaco.languages.register({ id: languageId, extensions: ['.puml', '.plantuml', '.pu'], aliases: ['PlantUML', 'plantuml'] });
  monaco.languages.setLanguageConfiguration(languageId, {
    comments: { lineComment: "'", blockComment: ["/'", "'/"] },
    brackets: [['{', '}'], ['[', ']'], ['(', ')']],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
    indentationRules: {
      increaseIndentPattern: /^\s*(?:(?:alt|opt|loop|par|group|critical|break|if|while|repeat|package|namespace|class|interface|component|state)\b.*|.*\{)\s*$/i,
      decreaseIndentPattern: /^\s*(?:end|endif|endwhile|repeat while|else\b|})/i,
    },
  });

  monaco.languages.setMonarchTokensProvider(languageId, {
    ignoreCase: true,
    directives: ['@startuml', '@enduml', '!include', '!include_once', '!include_many', '!define', '!undef', '!if', '!else', '!endif'],
    keywords: [
      'actor', 'participant', 'boundary', 'control', 'entity', 'database', 'collections', 'queue',
      'component', 'interface', 'class', 'abstract', 'enum', 'annotation', 'object', 'package',
      'node', 'folder', 'frame', 'cloud', 'rectangle', 'storage', 'artifact', 'state', 'usecase',
      'title', 'caption', 'legend', 'header', 'footer', 'scale', 'hide', 'show', 'skinparam',
      'note', 'as', 'of', 'on', 'link', 'over', 'left', 'right', 'top', 'bottom',
      'alt', 'else', 'opt', 'loop', 'par', 'break', 'critical', 'group', 'end',
      'if', 'then', 'elseif', 'endif', 'while', 'endwhile', 'repeat', 'fork', 'again', 'stop', 'start',
    ],
    tokenizer: {
      root: [
        [/\/\'/, 'comment', '@comment'],
        [/'.*$/, 'comment'],
        [/@[a-z_]+|![a-z_]+/, { cases: { '@directives': 'keyword.directive', '@default': 'keyword.directive' } }],
        [/[a-zA-Z_À-ÿ][\wÀ-ÿ]*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
        [/(?:--?|\.\.?)[ox*<>|/\\]*(?:--?|\.\.?|>)/, 'operator'],
        [/#[0-9a-fA-F]{3,8}\b/, 'number.hex'],
        [/"/, 'string', '@string'],
        [/\d+(?:\.\d+)?/, 'number'],
        [/[{}()[\]]/, '@brackets'],
      ],
      comment: [
        [/[^']+/, 'comment'],
        [/'\//, 'comment', '@pop'],
        [/'/, 'comment'],
      ],
      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop'],
      ],
    },
  });

  monaco.languages.registerCompletionItemProvider(languageId, {
    provideCompletionItems(model: editor.ITextModel, position: Position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      return {
        suggestions: completionItems.map(([label, insertText, documentation]) => ({
          label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation,
          range,
        })),
      };
    },
  });

  monaco.editor.defineTheme('plantuml-studio-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'AA9AFF' },
      { token: 'keyword.directive', foreground: 'AA9AFF', fontStyle: 'bold' },
      { token: 'comment', foreground: '899383', fontStyle: 'italic' },
      { token: 'operator', foreground: '7DD3A7' },
      { token: 'string', foreground: 'D7BA7D' },
      { token: 'number', foreground: 'B5CEA8' },
    ],
    colors: {
      'editor.background': '#101114',
      'editor.foreground': '#ECECF1',
      'editorLineNumber.foreground': '#626677',
      'editorLineNumber.activeForeground': '#A1A3B0',
      'editorCursor.foreground': '#AA9AFF',
      'editor.selectionBackground': '#3A3557',
      'editor.inactiveSelectionBackground': '#2B2939',
      'editorSuggestWidget.background': '#17181C',
      'editorSuggestWidget.border': '#2A2C33',
      'editorWidget.background': '#17181C',
    },
  });

  monaco.editor.defineTheme('plantuml-studio-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '6550C7' },
      { token: 'keyword.directive', foreground: '6550C7', fontStyle: 'bold' },
      { token: 'comment', foreground: '65735B', fontStyle: 'italic' },
      { token: 'operator', foreground: '177B56' },
      { token: 'string', foreground: '8A5A00' },
      { token: 'number', foreground: '336B22' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#20222B',
      'editorLineNumber.foreground': '#8B8F9E',
      'editorLineNumber.activeForeground': '#626677',
      'editorCursor.foreground': '#6550C7',
      'editor.selectionBackground': '#DAD3F8',
      'editor.inactiveSelectionBackground': '#EEEBFA',
      'editorSuggestWidget.background': '#F7F8FA',
      'editorSuggestWidget.border': '#DDE0E7',
      'editorWidget.background': '#F7F8FA',
    },
  });
}
