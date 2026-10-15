import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { MAX_PLANTUML_SOURCE_BYTES, MAX_PROJECT_FILES, MAX_PROJECT_TOTAL_BYTES } from '@plantuml-studio/shared';
import { openLocalProject, supportsDirectoryPicker } from '../../application/documents/local-file-system';
import { useDocumentStore } from '../../state/document-store';
import type { StudioDocument } from './demo-data';
import { DocumentDialog } from './document-dialog';
import { Icon } from './icon';
import { IconButton } from './button';

type DialogState = { mode: 'project' } | { mode: 'create' } | { mode: 'rename'; document: StudioDocument } | { mode: 'delete'; document: StudioDocument } | null;
type ImportMessage = { kind: 'success' | 'error'; text: string };
interface DirectoryNode { name: string; path: string; directories: DirectoryNode[]; documents: StudioDocument[] }

export function FileExplorer({ onDocumentOpened }: { onDocumentOpened: () => void }) {
  const [expanded, setExpanded] = useState(true);
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(() => new Set());
  const [dialog, setDialog] = useState<DialogState>(null);
  const [importMessage, setImportMessage] = useState<ImportMessage | null>(null);
  const [directoryPickerSupported, setDirectoryPickerSupported] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const projects = useDocumentStore(state => state.projects);
  const openProjectIds = useDocumentStore(state => state.openProjectIds);
  const activeProjectId = useDocumentStore(state => state.activeProjectId);
  const project = projects.find(candidate => candidate.id === activeProjectId) ?? null;
  const documents = project?.documents ?? [];
  const activeDocumentId = project?.activeDocumentId ?? null;
  const mainDocumentId = project?.mainDocumentId ?? null;
  const createProject = useDocumentStore(state => state.createProject);
  const switchProject = useDocumentStore(state => state.switchProject);
  const closeProject = useDocumentStore(state => state.closeProject);
  const openDocument = useDocumentStore(state => state.openDocument);
  const createDocument = useDocumentStore(state => state.createDocument);
  const importDocument = useDocumentStore(state => state.importDocument);
  const importProject = useDocumentStore(state => state.importProject);
  const renameDocument = useDocumentStore(state => state.renameDocument);
  const deleteDocument = useDocumentStore(state => state.deleteDocument);
  const setMainDocument = useDocumentStore(state => state.setMainDocument);
  const tree = buildDirectoryTree(documents);
  const canMutateStructure = project?.origin !== 'local';

  useEffect(() => { projectInputRef.current?.setAttribute('webkitdirectory', ''); setDirectoryPickerSupported(supportsDirectoryPicker()); }, []);
  useEffect(() => { setCollapsedFolders(new Set()); setExpanded(true); setImportMessage(null); }, [activeProjectId]);

  function selectDocument(id: string) { openDocument(id); onDocumentOpened(); }

  async function openFolder() {
    setImportMessage(null);
    try {
      const selected = await openLocalProject();
      const result = importProject(selected.name, selected.files, 'local', selected.directoryHandle);
      if (!result.ok) { setImportMessage({ kind: 'error', text: result.error }); return; }
      setImportMessage({ kind: 'success', text: `${result.count} arquivo(s) vinculados à pasta local.` });
      onDocumentOpened();
    } catch (error: unknown) {
      setImportMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Não foi possível abrir a pasta.' });
    }
  }

  async function importFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;
    const errors: string[] = [];
    let imported = 0;
    for (const file of files) {
      if (!isPlantUmlFile(file.name)) { errors.push(`${file.name}: extensão não suportada`); continue; }
      if (file.size > MAX_PLANTUML_SOURCE_BYTES) { errors.push(`${file.name}: excede ${MAX_PLANTUML_SOURCE_BYTES / 1000} KB`); continue; }
      try {
        const result = importDocument(file.name, await file.text());
        if (!result.ok) errors.push(`${file.name}: ${result.error}`); else imported += 1;
      } catch { errors.push(`${file.name}: falha de leitura`); }
    }
    if (imported) onDocumentOpened();
    setImportMessage(importResultMessage(imported, errors));
  }

  async function importFolder(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';
    const files = selected.filter(file => isPlantUmlFile(file.name));
    if (!files.length) { setImportMessage({ kind: 'error', text: 'A pasta não contém arquivos PlantUML compatíveis.' }); return; }
    if (files.length > MAX_PROJECT_FILES) { setImportMessage({ kind: 'error', text: `A pasta excede o limite de ${MAX_PROJECT_FILES} arquivos PlantUML.` }); return; }
    if (files.some(file => file.size > MAX_PLANTUML_SOURCE_BYTES) || files.reduce((sum, file) => sum + file.size, 0) > MAX_PROJECT_TOTAL_BYTES) { setImportMessage({ kind: 'error', text: 'A pasta excede os limites seguros de tamanho do projeto.' }); return; }
    try {
      const rootName = files[0]?.webkitRelativePath.split('/')[0] || 'Projeto importado';
      const projectFiles = await Promise.all(files.map(async file => ({ path: relativeImportedPath(file), content: await file.text() })));
      const result = importProject(rootName, projectFiles, 'browser');
      if (!result.ok) { setImportMessage({ kind: 'error', text: result.error }); return; }
      setImportMessage({ kind: 'success', text: `${result.count} arquivo(s) importados em um novo projeto.` });
      onDocumentOpened();
    } catch { setImportMessage({ kind: 'error', text: 'Não foi possível ler a pasta selecionada.' }); }
  }

  function toggleFolder(path: string) {
    setCollapsedFolders(current => { const next = new Set(current); if (next.has(path)) next.delete(path); else next.add(path); return next; });
  }

  return <aside id="file-explorer" className="file-explorer" aria-label="Explorador de projetos PlantUML">
    <div className="explorer-heading"><h2 className="explorer-title">EXPLORADOR</h2><span className="explorer-heading-actions">
      <IconButton icon="folderOpen" label="Abrir pasta local" onClick={() => { void openFolder(); }} />
      <IconButton icon="folderUpload" label="Importar pasta como novo projeto interno" onClick={() => projectInputRef.current?.click()} />
      <IconButton icon="plus" label="Novo projeto" onClick={() => setDialog({ mode: 'project' })} />
    </span><input ref={projectInputRef} className="visually-hidden" type="file" accept=".puml,.plantuml,.pu" multiple onChange={event => { void importFolder(event); }} /></div>
    <div className="project-switcher">
      <label><span className="visually-hidden">Alternar projeto</span><select value={activeProjectId ?? ''} onChange={event => switchProject(event.target.value)}>
        {!activeProjectId && <option value="">Nenhum projeto aberto</option>}
        {projects.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.name}{candidate.origin === 'local' ? ' · pasta local' : ' · navegador'}{openProjectIds.includes(candidate.id) ? '' : ' · fechado'}</option>)}
      </select></label>
      {project && <span className={`project-origin-badge ${project.origin}`}>{project.origin === 'local' ? 'local' : 'navegador'}</span>}
      <IconButton icon="close" label={project ? `Fechar projeto ${project.name}` : 'Nenhum projeto para fechar'} disabled={!project} onClick={() => { if (project) closeProject(project.id); }} />
    </div>
    {project ? <>
      <div className="project-file-actions">
        <span>{project.name}</span><span>
          <IconButton icon="upload" label="Importar documentos no projeto" disabled={!canMutateStructure} onClick={() => fileInputRef.current?.click()} />
          <IconButton icon="plus" label="Criar documento PlantUML" disabled={!canMutateStructure} onClick={() => setDialog({ mode: 'create' })} />
        </span>
        <input ref={fileInputRef} className="visually-hidden" type="file" accept=".puml,.plantuml,.pu" multiple onChange={event => { void importFiles(event); }} />
      </div>
      <nav aria-label={`Projeto ${project.name}`}>
        <button className="folder-row" aria-expanded={expanded} aria-controls="document-file-list" onClick={() => setExpanded(!expanded)}><Icon name="chevron" className={expanded ? 'expanded' : ''} /><Icon name="folder" /><span>{project.name}</span></button>
        <ul id="document-file-list" hidden={!expanded} className="file-list project-tree">
          <TreeContents node={tree} depth={0} collapsedFolders={collapsedFolders} onToggleFolder={toggleFolder} activeDocumentId={activeDocumentId} mainDocumentId={mainDocumentId} onSelect={selectDocument} onSetMain={setMainDocument} onRename={document => setDialog({ mode: 'rename', document })} onDelete={document => setDialog({ mode: 'delete', document })} canMutateStructure={canMutateStructure} />
        </ul>
      </nav>
      <div className="explorer-note"><Icon name={project.origin === 'local' ? 'folder' : 'info'} /><div><p>Principal: {documents.find(document => document.id === mainDocumentId)?.path ?? 'não definido'}</p><p>{project.origin === 'local' ? 'Vinculado ao disco · Ctrl+S grava o original' : 'Projeto interno · IndexedDB'}</p>{importMessage && <p className={`import-message ${importMessage.kind}`} role={importMessage.kind === 'error' ? 'alert' : 'status'}>{importMessage.text}</p>}</div></div>
    </> : <div className="explorer-empty"><Icon name="folder" /><p>Nenhum projeto aberto</p><span>Selecione um projeto, crie um novo ou abra uma pasta local.</span></div>}
    {directoryPickerSupported === false && <p className="filesystem-unsupported">Abrir Pasta não é compatível com este navegador; use Importar Pasta.</p>}
    {dialog?.mode === 'project' && <DocumentDialog title="Novo projeto" description="Cria um projeto independente armazenado neste navegador." confirmLabel="Criar projeto" inputLabel="Nome do projeto" initialValue="Novo projeto" onCancel={() => setDialog(null)} onConfirm={value => { const result = createProject(value); if (!result.ok) return result.error; setDialog(null); onDocumentOpened(); return null; }} />}
    {dialog?.mode === 'create' && <DocumentDialog title="Novo documento" description="Use barras para criar o documento dentro de uma pasta." confirmLabel="Criar" initialValue="novo-diagrama.puml" onCancel={() => setDialog(null)} onConfirm={value => { const result = createDocument(value); if (!result.ok) return result.error; setDialog(null); onDocumentOpened(); return null; }} />}
    {dialog?.mode === 'rename' && <DocumentDialog title="Renomear documento" description={`O arquivo permanecerá em ${parentPath(dialog.document.path) || project?.name || 'projeto'}.`} confirmLabel="Renomear" initialValue={dialog.document.name} onCancel={() => setDialog(null)} onConfirm={value => { const result = renameDocument(dialog.document.id, value); if (!result.ok) return result.error; setDialog(null); return null; }} />}
    {dialog?.mode === 'delete' && <DocumentDialog title="Excluir documento" description={`Excluir ${dialog.document.path} deste navegador? Includes que apontam para ele passarão a falhar.`} confirmLabel="Excluir" destructive onCancel={() => setDialog(null)} onConfirm={() => { deleteDocument(dialog.document.id); setDialog(null); return null; }} />}
  </aside>;
}

function TreeContents({ node, depth, collapsedFolders, onToggleFolder, activeDocumentId, mainDocumentId, onSelect, onSetMain, onRename, onDelete, canMutateStructure }: {
  node: DirectoryNode; depth: number; collapsedFolders: Set<string>; onToggleFolder: (path: string) => void; activeDocumentId: string | null; mainDocumentId: string | null; onSelect: (id: string) => void; onSetMain: (id: string) => void; onRename: (document: StudioDocument) => void; onDelete: (document: StudioDocument) => void; canMutateStructure: boolean;
}) {
  return <>
    {node.directories.map(directory => { const collapsed = collapsedFolders.has(directory.path); return <li className="tree-directory" key={directory.path}><button className="folder-row nested" style={{ '--tree-depth': depth } as CSSProperties} aria-expanded={!collapsed} onClick={() => onToggleFolder(directory.path)}><Icon name="chevron" className={collapsed ? '' : 'expanded'} /><Icon name="folder" /><span>{directory.name}</span></button><ul hidden={collapsed} className="file-list"><TreeContents node={directory} depth={depth + 1} collapsedFolders={collapsedFolders} onToggleFolder={onToggleFolder} activeDocumentId={activeDocumentId} mainDocumentId={mainDocumentId} onSelect={onSelect} onSetMain={onSetMain} onRename={onRename} onDelete={onDelete} canMutateStructure={canMutateStructure} /></ul></li>; })}
    {node.documents.map(document => {
      const isMain = document.id === mainDocumentId;
      return <li className={`file-item ${activeDocumentId === document.id ? 'selected' : ''}`} style={{ '--tree-depth': depth } as CSSProperties} key={document.id}>
        <button className="file-row" aria-current={activeDocumentId === document.id ? 'page' : undefined} onClick={() => onSelect(document.id)} title={document.path}><Icon name="file" /><span>{document.name}</span>{isMain && <span className="main-file-badge">principal</span>}{document.content !== document.savedContent && <span className="dirty-dot" title="Alterações não salvas"><span className="visually-hidden">Alterações não salvas</span></span>}</button>
        <span className="file-actions"><IconButton icon="main" label={isMain ? `${document.name} é o arquivo principal` : `Definir ${document.name} como arquivo principal`} disabled={isMain} onClick={() => onSetMain(document.id)} /><IconButton icon="edit" label={canMutateStructure ? `Renomear ${document.name}` : 'Renomeie arquivos locais no sistema operacional'} disabled={!canMutateStructure} onClick={() => onRename(document)} /><IconButton icon="trash" label={canMutateStructure ? `Excluir ${document.name}` : 'Exclua arquivos locais no sistema operacional'} disabled={!canMutateStructure} onClick={() => onDelete(document)} /></span>
      </li>;
    })}
  </>;
}

function buildDirectoryTree(documents: StudioDocument[]): DirectoryNode {
  const root: DirectoryNode = { name: '', path: '', directories: [], documents: [] };
  for (const document of [...documents].sort((a, b) => a.path.localeCompare(b.path))) {
    const parts = document.path.split('/'); let current = root;
    for (const part of parts.slice(0, -1)) { const path = [current.path, part].filter(Boolean).join('/'); let child = current.directories.find(directory => directory.name === part); if (!child) { child = { name: part, path, directories: [], documents: [] }; current.directories.push(child); } current = child; }
    current.documents.push(document);
  }
  return root;
}

function relativeImportedPath(file: File) { const parts = file.webkitRelativePath.split('/'); return parts.length > 1 ? parts.slice(1).join('/') : file.name; }
function isPlantUmlFile(name: string) { return /\.(?:puml|plantuml|pu)$/i.test(name); }
function importResultMessage(imported: number, errors: string[]): ImportMessage { return errors.length ? { kind: 'error', text: `${imported ? `${imported} importado(s). ` : ''}${errors.slice(0, 2).join(' · ')}${errors.length > 2 ? ` · +${errors.length - 2} erro(s)` : ''}` } : { kind: 'success', text: `${imported} documento(s) importado(s)` }; }
function parentPath(path: string) { return path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : ''; }
