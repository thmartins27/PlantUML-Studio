import type { RenderPreviewState } from '../../application/rendering/use-render-preview';
import { Icon } from './icon';
import { InteractiveCanvas } from './interactive-canvas';

interface PreviewPanelProps {
  state: RenderPreviewState;
  documentPath: string | null;
  onRetry: () => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function PreviewPanel({ state, documentPath, onRetry, expanded, onToggleExpanded }: PreviewPanelProps) {
  const svgUrl = state.svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(state.svg)}` : null;
  const hasDiagram = svgUrl !== null;
  return <section id="preview-panel" className="preview-panel" aria-label="Visualização PlantUML">
    <div className="panel-heading preview-heading">
      <h2>Visualização</h2>
      <span title={documentPath ?? 'SVG PlantUML'}><Icon name="image" /><span className="preview-document-name">{documentPath ?? 'SVG PlantUML'}</span></span>
    </div>
    <div className="preview-state-bar" role="status" aria-live="polite">
      <span>{statusLabel(state)}</span>
      {state.durationMs !== null && <span>{state.durationMs} ms</span>}
    </div>
    <div className="preview-viewport" aria-busy={state.status === 'loading'}>
      {hasDiagram && <InteractiveCanvas svgUrl={svgUrl} expanded={expanded} onToggleExpanded={onToggleExpanded} />}
      {state.status === 'loading' && !hasDiagram && <PreviewMessage kind="loading" />}
      {state.status === 'empty' && <PreviewMessage kind="empty" />}
      {state.status === 'error' && <div className={`preview-feedback ${hasDiagram ? 'over-diagram' : ''}`} role="alert">
        <div><Icon name="alert" /><span><strong>Falha na renderização</strong>{state.error.line ? ` · linha ${state.error.line}` : ''}</span></div>
        <p>{state.error.message}{state.error.path ? ` Arquivo: ${state.error.path}.` : ''}{state.error.includeStack?.length ? ` Cadeia: ${state.error.includeStack.join(' → ')}.` : ''}{hasDiagram ? ' O último SVG válido foi preservado.' : ''}</p>
        <button className="button secondary" onClick={onRetry}>Tentar novamente</button>
      </div>}
      {state.status === 'loading' && hasDiagram && <div className="preview-progress"><span className="spinner small" aria-hidden="true" />Atualizando preview…</div>}
      {!hasDiagram && <button type="button" className="preview-expand-button icon-button" onClick={onToggleExpanded} aria-label={expanded ? 'Sair da visualização em tela cheia' : 'Expandir visualização em tela cheia'} title={`${expanded ? 'Sair da tela cheia' : 'Tela cheia'} (F11)`}><Icon name={expanded ? 'fullscreenExit' : 'fullscreen'} /></button>}
    </div>
  </section>;
}

function statusLabel(state: RenderPreviewState): string {
  if (state.status === 'loading') return state.svg ? 'Atualizando…' : 'Renderizando…';
  if (state.status === 'success') return 'Preview atualizado';
  if (state.status === 'error') return state.svg ? 'Erro · exibindo último resultado válido' : 'Erro de renderização';
  return 'Aguardando documento';
}

function PreviewMessage({ kind }: { kind: 'loading' | 'empty' }) {
  return <div className="preview-message" role="status">
    {kind === 'loading' ? <><span className="spinner" aria-hidden="true" /><h3>Renderizando diagrama</h3><p>O motor PlantUML está processando o documento ativo.</p></> : <><div className="state-icon"><Icon name="image" /></div><h3>Nenhum diagrama para visualizar</h3><p>Abra um documento PlantUML para iniciar a renderização.</p></>}
  </div>;
}
