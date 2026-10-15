'use client';

import Editor, { loader, type OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import type { StudioDocument } from './demo-data';
import { configurePlantUmlLanguage } from './plantuml-language';

loader.config({ monaco });

if (typeof window !== 'undefined') {
  const target = globalThis as typeof globalThis & {
    MonacoEnvironment?: { getWorker: () => Worker };
  };
  target.MonacoEnvironment = {
    getWorker: () => new Worker(new URL('monaco-editor/editor/editor.worker.js', import.meta.url), { type: 'module' }),
  };
}

interface MonacoCodeEditorProps {
  document: StudioDocument;
  theme: 'dark' | 'light';
  onChange: (content: string) => void;
  onSave: () => void;
}

export function MonacoCodeEditor({ document, theme, onChange, onSave }: MonacoCodeEditorProps) {
  const saveRef = useRef(onSave);
  const saveActionRef = useRef<{ dispose: () => void } | null>(null);

  useEffect(() => { saveRef.current = onSave; }, [onSave]);
  useEffect(() => () => saveActionRef.current?.dispose(), []);

  const handleMount: OnMount = (editor, monacoInstance) => {
    saveActionRef.current?.dispose();
    saveActionRef.current = editor.addAction({
      id: 'plantuml-studio.save-in-memory',
      label: 'Salvar estado do documento na sessão',
      keybindings: [monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS],
      run: () => saveRef.current(),
    });
    editor.focus();
  };

  return <div className="monaco-editor-shell" aria-label={`Editor de ${document.name}`}>
    <Editor
      beforeMount={configurePlantUmlLanguage}
      height="100%"
      language="plantuml"
      path={`inmemory://plantuml-studio/${document.id}.puml`}
      value={document.content}
      theme={theme === 'dark' ? 'plantuml-studio-dark' : 'plantuml-studio-light'}
      saveViewState
      keepCurrentModel
      onMount={handleMount}
      onChange={value => onChange(value ?? '')}
      loading={<div className="editor-loading" role="status">Carregando editor…</div>}
      options={{
        automaticLayout: true,
        accessibilitySupport: 'auto',
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        bracketPairColorization: { enabled: true },
        cursorBlinking: 'smooth',
        detectIndentation: false,
        fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
        fontSize: 13,
        insertSpaces: true,
        lineHeight: 24,
        lineNumbers: 'on',
        minimap: { enabled: false },
        padding: { top: 14, bottom: 18 },
        quickSuggestions: { other: true, comments: false, strings: false },
        renderWhitespace: 'selection',
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        suggestOnTriggerCharacters: true,
        tabCompletion: 'on',
        tabSize: 2,
        wordWrap: 'off',
      }}
    />
  </div>;
}
