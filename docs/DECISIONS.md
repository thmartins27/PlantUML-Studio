# PlantUML Studio — Decisões

## Decisões aceitas
As decisões abaixo derivam das instruções fornecidas para o projeto.

| ID | Decisão | Consequência |
| --- | --- | --- |
| D001 | TypeScript estrito, Next.js App Router e NestJS | Manter frontend e backend nesses limites tecnológicos. |
| D002 | Código PlantUML como fonte de verdade | Não implementar edição visual de nós no MVP. |
| D003 | Motor oficial PlantUML com saída SVG | Não criar parser ou renderizador PlantUML próprio. |
| D004 | Transformações do canvas independentes da renderização | Zoom e deslocamento não alteram o código nem exigem nova renderização. |
| D005 | Sem autenticação ou banco sem solicitação explícita | Não introduzir essas capacidades na fundação. |
| D006 | UI desktop-first, profissional e acessível | Seguir o design system e usar as skills de UI/UX pertinentes. |
| D007 | Web, API e pacote compartilhado em diretórios separados | Usar a estrutura solicitada sem impor uma ferramenta de monorepo ainda. |

## Registro de novas decisões
Registrar contexto, escolha, consequências e status. Distinguir propostas de decisões aceitas; não alterar decisões de arquitetura silenciosamente.

## Decisões da fundação
- **D008 — PNPM workspaces (aceita por solicitação):** gerenciar web, API e shared sem adicionar Turborepo ou Nx.
- **D009 — Node 24 / PNPM 12.9.1 (escolha de implementação):** fixar ambiente de referência reproduzível; Node 24.19.0 já disponível. Mudanças de runtime devem ser verificadas antes de atualizar engines e lockfile.
- **D010 — TypeScript 5.9.3 e ESLint 9 (escolha de implementação):** manter `strict` em todos os pacotes e compatibilidade com typescript-eslint; não adotar TypeScript 7 enquanto estiver fora do intervalo suportado por esta ferramenta.
- **D011 — Smoke HTTP com node:test (escolha de implementação):** verificar os builds reais e encerrar os processos ao final, sem dependências adicionais de testes.
- **D012 — Bootstrap mínimo (limite da fase):** somente página inicial e rota de saúde. Shared permanece vazio até existir contrato consumido por ambos os projetos.
- **D013 — Etapas com aprovação (aceita por solicitação):** não iniciar a próxima fase automaticamente; as seis fases do roadmap são uma proposta organizacional, não requisitos adicionais.

## Decisões ainda pendentes
| Tema | O que precisa ser definido | Momento sugerido |
| --- | --- | --- |
| Fases futuras do MVP | Fases 1–8 implementadas; definir somente novos escopos explicitamente aprovados | Antes de cada fase adicional |
| Design system | Tokens aprovados na Fase 2 e preservados nas fases 3–4 | Monitorar feedback de usabilidade |
| Qualidade do MVP | Navegadores suportados e metas mensuráveis de desempenho | Antes de uma validação formal do MVP |

Autenticação, persistência em banco e edição visual de nós permanecem fora do escopo; esta lista não autoriza sua inclusão.

Limitação de D010: ESLint 9.39.1 é marcado como deprecated no registro, mas os plugins React, import e a11y da configuração Next.js consultada ainda não declaram suporte ao ESLint 10. Atualizar quando houver compatibilidade, sem suprimir os avisos de peers.

## Decisões da Fase 2
- **D014 — Layout demonstrativo autorizado:** implementar sidebar, áreas de código e preview, redimensionamento, temas e estados; não iniciar a Fase 3.
- **D015 — Sem dependências adicionais:** React, CSS, Pointer Events, ResizeObserver e SVG nativo cobrem o escopo atual. Monaco não foi instalado; apenas sua futura área foi preparada.
- **D016 — Exemplos explícitos:** fonte somente leitura e SVGs fixos independentes. Não representam renderização PlantUML nem persistência. Exportação permanece desabilitada.
- **D017 — Estado transitório:** tema, seleção, zoom e dimensões ficam em memória; recarregar restaura a demonstração inicial.
- **D018 — Adaptação de painéis:** desktop com separadores acessíveis; explorer sobreposto em larguras intermediárias; abas Código/Preview em telas estreitas.

D012 descreve a entrega histórica da fundação; D014 autoriza sua substituição pelo layout desta fase, mantendo a API sem novas funcionalidades.

## Decisões da Fase 3
- **D019 — Monaco Editor local:** usar `monaco-editor` com `@monaco-editor/react`, carregamento somente no cliente e worker empacotado pelo Next.js. A aplicação não depende de CDN para editar.
- **D020 — PlantUML como linguagem de edição:** registrar Monarch tokens, configuração de indentação e snippets básicos. Isso oferece assistência textual sem criar parser ou renderizador PlantUML próprio.
- **D021 — Zustand transitório:** documentos, abas e documento ativo ficam em um store Zustand sem middleware de persistência. Recarregar restaura o estado inicial.
- **D022 — Modelo por documento:** identificar modelos Monaco por ID estável, preservando undo/redo e view state entre abas; renomear não troca o identificador do modelo.
- **D023 — Checkpoint salvo na sessão:** conteúdo editado é comparado a `savedContent`; `Ctrl/Cmd+S` ou o botão Salvar atualiza apenas esse checkpoint em memória. O texto da UI explicita que não há salvamento permanente.
- **D024 — Preview desacoplado:** a edição não dispara renderização. Os SVGs existentes continuam exemplos fixos até a fase de integração com o motor oficial.

## Decisões da Fase 4
- **D025 — Servidor oficial isolado:** usar `plantuml/plantuml-server:jetty-v1.2026.8` fixado por digest, com Graphviz e sem servidor público. A API NestJS aguarda seu healthcheck, é o único consumidor e o renderer não publica porta.
- **D026 — Sandbox em camadas:** combinar `PLANTUML_SECURITY_PROFILE=SANDBOX`, rede Docker interna, raiz somente leitura, usuário não-root, capabilities removidas, `no-new-privileges`, limites de CPU, memória e PIDs e tmpfs efêmeros. Includes locais e remotos ficam bloqueados.
- **D027 — Contrato HTTP estruturado:** `POST /render` recebe fonte e tema; limita entrada a 50 KB, corpo a 64 KB, resposta a 2 MB e execução a 5 segundos. Erros distinguem entrada, sintaxe, timeout, indisponibilidade e SVG inseguro.
- **D028 — SVG sanitizado e não injetado:** a API aplica allowlist com `sanitize-html`; o frontend usa contexto de imagem em vez de `dangerouslySetInnerHTML`. Links, scripts, eventos e recursos externos são descartados.
- **D029 — Renderização automática resiliente:** aplicar debounce de 400 ms, abortar fetch anterior e também conferir uma sequência monotônica. Guardar o último SVG válido por documento e tema para recuperação visual em erro.
- **D030 — Tema no motor:** usar `IDENTITY` no tema claro e `LIGTHNESS_INVERSE` no escuro, ambos mapeadores oficiais do PlantUML, em vez de alterar SVG por filtro CSS. A inversão por luminosidade transforma também cores claras explícitas e evita texto branco sobre preenchimentos claros, mantendo o PlantUML como fonte de verdade.
- **D031 — Navegação adiada:** o preview real não introduz zoom ou pan. Controles existentes permanecem visíveis, porém desabilitados, até autorização da Fase 5.

## Decisões da Fase 5
- **D032 — Biblioteca de transformações:** usar `react-zoom-pan-pinch` 3.7.0 para mouse, touchpad e toque. O visualizador não implementa matemática gestual própria nem modifica o SVG.
- **D033 — Estado independente da renderização:** escala e posição pertencem ao `InteractiveCanvas`; não entram no store de documentos, no contrato da API ou nas dependências de renderização.
- **D034 — Preservação oportunista:** manter a instância de transformação montada e reaplicar o último estado após a troca da imagem. Reset centraliza em 100%; Fit to Screen recalcula apenas quando solicitado.
- **D035 — Limites de navegação:** permitir 10%–400%, pan sem limites rígidos e Fit to Screen limitado a 100% para não ampliar desnecessariamente diagramas pequenos.
- **D036 — Entradas equivalentes:** pan aceita botão esquerdo, botão central, espaço + arraste e setas com foco; zoom aceita roda centrada no cursor, touchpad, pinch e botões. Navegação nunca altera o PlantUML.

## Decisões da Fase 6
- **D037 — Snapshot local versionado:** persistir documentos, abas abertas e documento ativo em uma única chave IndexedDB na versão 1. Zustand continua como estado de execução; o adaptador de aplicação isola a infraestrutura do navegador.
- **D038 — Autosave confirmado:** salvar após 450 ms sem novas mutações e em `Ctrl/Cmd+S`; marcar conteúdo como salvo somente após a transação concluir. Uma falha mantém o documento em memória e expõe o erro, sem descartar alterações.
- **D039 — Importação limitada:** aceitar `.puml`, `.plantuml` e `.pu` até 50 KB, preservar o nome válido e recusar duplicatas. O texto importado segue pelo mesmo store e autosave dos documentos criados no Studio.
- **D040 — Exportação no cliente:** baixar o código original em `.puml`, reutilizar o último SVG já sanitizado pela API e rasterizá-lo em canvas efêmero para PNG de 1× a 4×. Limites de dimensão e área evitam alocações excessivas.
- **D041 — Artefato sem chrome:** exportar somente o SVG do motor ou sua rasterização; transformação, fundo, toolbar e controles do canvas nunca entram no arquivo.
- **D042 — Sem nova dependência ou nuvem:** usar IndexedDB, File API, Blob, object URLs e canvas nativos. Não introduzir autenticação, banco remoto, sincronização ou middleware de persistência.

## Decisões da Fase 7
- **D043 — Projeto como mapa virtual:** persistir `path` relativo por documento e `mainDocumentId`; o arquivo ativo é o entrypoint temporário do preview, enquanto o principal permanece como fallback do projeto. Visualizar outro arquivo não altera essa configuração persistida.
- **D044 — Includes isolados em memória:** resolver somente `!include`, `!include_once` e `!include_many` contra o mapa enviado na requisição. Nenhum caminho fornecido pelo usuário é lido do filesystem da API ou do renderer.
- **D045 — Defesa de caminhos e recursos:** normalizar caminhos POSIX e rejeitar absolutos, URLs, travessia da raiz, duplicatas, ciclos, ausências e limites de arquivos/tamanho antes do motor oficial.
- **D046 — Fontes originais preservadas:** expansão existe apenas durante a requisição; editor, IndexedDB e exportação continuam usando exatamente os arquivos importados.
- **D047 — Tela cheia progressiva:** tentar Fullscreen API por ação do usuário e manter fallback CSS. A instância de `InteractiveCanvas` não é remontada, preservando escala e posição.
- **D048 — Sem nova dependência:** usar seleção de diretório, Fullscreen API e resolução de caminhos com APIs já disponíveis no navegador/Node.js.

## Decisões da Fase 8
- **D049 — Estado por projeto:** Zustand mantém uma coleção de projetos; documentos, abas, ativo e principal pertencem ao projeto e nunca a uma lista global compartilhada.
- **D050 — Snapshot v3:** IndexedDB persiste projetos internos e locais, projetos abertos, projeto ativo, metadados e handles suportados. Workspaces v1/v2 migram para um projeto interno sem perda de documentos.
- **D051 — Origem explícita:** projetos `browser` têm conteúdo confirmado pelo IndexedDB; projetos `local` usam o arquivo em disco como checkpoint e o IndexedDB apenas para metadados e recuperação do estado de edição.
- **D052 — Escrita protegida:** antes de gravar um arquivo local, conferir permissão, existência, `lastModified` e conteúdo conhecido. Divergências externas bloqueiam a escrita e exigem reabrir a pasta.
- **D053 — Backend inalterado:** File System Access API existe somente no frontend. Handles e caminhos absolutos não são serializados para `POST /render`; apenas arquivos e caminhos relativos do projeto ativo são enviados.
- **D054 — Estrutura local conservadora:** a fase grava edições em arquivos existentes, mas não cria, move ou exclui entradas no disco. Operações estruturais continuam habilitadas em projetos internos e ficam explicitamente indisponíveis em projetos locais.
