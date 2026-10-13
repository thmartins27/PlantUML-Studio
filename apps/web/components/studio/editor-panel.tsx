import type { DemoFile } from './demo-data';
import { Icon } from './icon';
import { IconButton } from './button';

export function EditorPanel({ file, onClose }: { file: DemoFile | null; onClose: () => void }) {
  return <section id="editor-panel" className="editor-panel" aria-label="Código PlantUML demonstrativo">
    <div className="panel-heading editor-tabs">{file ? <div className="file-tab"><Icon name="file" /><span>{file.name}</span><IconButton icon="close" label="Fechar arquivo demonstrativo" onClick={onClose} /></div> : <span className="panel-title">Código</span>}</div>
    {file ? <>
      <div className="editor-breadcrumb"><span>diagramas <span className="breadcrumb-slash">/</span> {file.name}</span><span className="read-only"><Icon name="lock" />Somente leitura</span></div>
      <div className="source-viewport" tabIndex={0} aria-label={`Fonte de ${file.name}, somente leitura`}>
        <div className="line-numbers" aria-hidden="true">{file.lines.map((_, index) => <div key={index}>{index + 1}</div>)}</div>
        <pre className="source-code"><code>{file.lines.map((line, index) => <span key={index} className={`source-line ${line.tone ?? ''}`}>{line.text || '\u00a0'}{'\n'}</span>)}</code></pre>
      </div>
    </> : <div className="editor-empty"><Icon name="code" /><p>Selecione um arquivo</p><span>Explore os exemplos na sidebar.</span></div>}
    <div className="panel-note"><Icon name="info" /><span>Monaco Editor será integrado na próxima fase</span></div>
  </section>;
}
