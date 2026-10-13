export type PreviewState = 'example' | 'loading' | 'error' | 'empty';
export type DemoId = 'auth' | 'components' | 'new';
export interface DemoLine { text: string; tone?: 'keyword' | 'comment' }
export interface DemoFile { id: DemoId; name: string; lines: DemoLine[]; diagram: 'sequence' | 'components' | null }

// Authored examples, not parsed or rendered from the PlantUML source.
export const demoFiles: DemoFile[] = [
  { id: 'auth', name: 'autenticacao.puml', diagram: 'sequence', lines: [
    { text: '@startuml', tone: 'keyword' },
    { text: 'title Fluxo de autenticação' },
    { text: 'actor Usuário' },
    { text: 'participant Aplicação' },
    { text: 'participant API' },
    { text: '' },
    { text: 'Usuário -> Aplicação: Entrar' },
    { text: 'Aplicação -> API: Validar acesso' },
    { text: 'API --> Aplicação: Acesso autorizado' },
    { text: 'Aplicação --> Usuário: Exibir workspace' },
    { text: '' },
    { text: '@enduml', tone: 'keyword' },
  ] },
  { id: 'components', name: 'componentes.puml', diagram: 'components', lines: [
    { text: '@startuml', tone: 'keyword' },
    { text: 'title Componentes do Studio' },
    { text: '' },
    { text: '[Interface web] --> [API]' },
    { text: '[API] --> [Motor PlantUML]' },
    { text: '' },
    { text: "' Exemplo visual, sem integração", tone: 'comment' },
    { text: '@enduml', tone: 'keyword' },
  ] },
  { id: 'new', name: 'novo-diagrama.puml', diagram: null, lines: [
    { text: '@startuml', tone: 'keyword' }, { text: '' },
    { text: "' Seu próximo diagrama começa aqui", tone: 'comment' },
    { text: '' }, { text: '@enduml', tone: 'keyword' },
  ] },
];
