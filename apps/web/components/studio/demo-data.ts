export interface StudioDocument {
  id: string;
  name: string;
  path: string;
  content: string;
  savedContent: string;
  fileHandle?: FileSystemFileHandle;
  lastKnownModified?: number;
}

export const newDocumentContent = `@startuml

' Escreva seu diagrama PlantUML aqui

@enduml
`;

const authenticationSource = `@startuml
title Fluxo de autenticação
actor Usuário
participant Aplicação
participant API

Usuário -> Aplicação: Entrar
Aplicação -> API: Validar acesso
API --> Aplicação: Acesso autorizado
Aplicação --> Usuário: Exibir workspace

@enduml
`;

const componentsSource = `@startuml
title Componentes do Studio

[Interface web] --> [API]
[API] --> [Motor PlantUML]

' Renderizado localmente pelo motor oficial
@enduml
`;

export const initialDocuments: StudioDocument[] = [
  {
    id: 'auth',
    name: 'autenticacao.puml',
    path: 'autenticacao.puml',
    content: authenticationSource,
    savedContent: authenticationSource,
  },
  {
    id: 'components',
    name: 'componentes.puml',
    path: 'componentes.puml',
    content: componentsSource,
    savedContent: componentsSource,
  },
];
