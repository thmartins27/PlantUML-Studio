import { useState } from 'react';
import { demoFiles, type DemoId } from './demo-data';
import { Icon } from './icon';

export function FileExplorer({ selected, onSelect }: { selected: DemoId | null; onSelect: (id: DemoId) => void }) {
  const [expanded, setExpanded] = useState(true);
  return <aside id="file-explorer" className="file-explorer" aria-label="Explorador de arquivos demonstrativos">
    <h2 className="explorer-title">EXPLORADOR</h2>
    <nav aria-label="Arquivos de exemplo">
      <button className="folder-row" aria-expanded={expanded} aria-controls="demo-file-list" onClick={() => setExpanded(!expanded)}>
        <Icon name="chevron" className={expanded ? 'expanded' : ''} /><Icon name="folder" /><span>diagramas</span>
      </button>
      <ul id="demo-file-list" hidden={!expanded} className="file-list">
        {demoFiles.map(file => <li key={file.id}><button className={`file-row ${selected === file.id ? 'selected' : ''}`} aria-current={selected === file.id ? 'true' : undefined} onClick={() => onSelect(file.id)} title={file.name}><Icon name="file" /><span>{file.name}</span></button></li>)}
      </ul>
    </nav>
    <div className="explorer-note"><Icon name="info" /><div><p>Ambiente de demonstração</p><p>Arquivos não são salvos</p></div></div>
  </aside>;
}
