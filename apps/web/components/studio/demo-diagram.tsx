// Fixed UI illustrations only. No PlantUML parsing or rendering happens here.
export function DemoDiagram({ kind }: { kind: 'sequence' | 'components' }) {
  return <svg className="demo-diagram" viewBox="0 0 520 400" role="img" aria-label={kind === 'sequence' ? 'Exemplo estático: fluxo entre Usuário, Aplicação e API' : 'Exemplo estático de componentes: interface web, API e motor PlantUML'}>
    <defs><marker id="demo-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="currentColor" /></marker></defs>
    {kind === 'sequence' ? <>
      {[['Usuário', 24], ['Aplicação', 204], ['API', 384]].map(([label, x]) => <g key={label}><rect x={x} y="24" width="112" height="42" rx="4" /><rect x={x} y="334" width="112" height="42" rx="4" /><text x={Number(x) + 56} y="50">{label}</text><text x={Number(x) + 56} y="360">{label}</text><path d={`M${Number(x) + 56} 66v268`} strokeDasharray="6 6" /></g>)}
      <path d="M80 125h180" markerEnd="url(#demo-arrow)" />
      <path d="M260 185h180" markerEnd="url(#demo-arrow)" />
      <path d="M440 247H260" strokeDasharray="6 5" markerEnd="url(#demo-arrow)" />
      <path d="M260 303H80" strokeDasharray="6 5" markerEnd="url(#demo-arrow)" />
      <text x="170" y="113">Entrar</text><text x="350" y="173">Validar acesso</text><text x="350" y="235">Acesso autorizado</text><text x="170" y="291">Exibir workspace</text>
    </> : <>
      <rect x="165" y="28" width="190" height="58" rx="4" /><text x="260" y="63">Interface web</text>
      <rect x="165" y="170" width="190" height="58" rx="4" /><text x="260" y="205">API</text>
      <rect x="165" y="312" width="190" height="58" rx="4" /><text x="260" y="347">Motor PlantUML</text>
      <path d="M260 86v80" markerEnd="url(#demo-arrow)" />
      <path d="M260 228v80" markerEnd="url(#demo-arrow)" />
    </>}
  </svg>;
}
