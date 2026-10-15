# PlantUML Studio — Roadmap

As fases 1 a 8 foram autorizadas e implementadas. As entregas seguem os limites aprovados em cada fase; critérios não documentados não autorizam funcionalidades adicionais.

## Fase 1 — Fundação do projeto
Status: concluída e verificada.

Escopo: PNPM workspaces, Next.js App Router, NestJS, TypeScript estrito, documentação e verificações básicas.

Critérios de aceitação:
- Instalação reproduzível pelo lockfile em Node/PNPM documentados.
- Web, API e shared com configuração estrita e scripts de build, lint e typecheck.
- Build web servido por HTTP; API responde `GET /health` com 200 e status `ok`.
- Smoke tests encerram seus processos após a verificação.
- Cinco documentos de referência com requisitos confirmados e decisões pendentes separados.
- Nenhum editor, canvas, motor PlantUML, banco ou autenticação implementado.

Evidências da fase 1 (2026-10-12):
- `pnpm install --frozen-lockfile`: aprovado; lockfile atualizado.
- `pnpm peers check`: sem incompatibilidades de peers.
- `pnpm lint` e `pnpm typecheck`: aprovados nos três pacotes.
- `pnpm test`: build dos três pacotes aprovado e 2 testes HTTP aprovados.
- `pnpm dev`: web e API iniciadas juntas; HTTP 200 em `/` na web e `/health` na API; processos encerrados após verificação.
- Configuração final do Next.js: lint, typecheck, build web e os 2 smoke tests reexecutados com sucesso.
- Links locais dos documentos e presença das seis fases conferidos.

Limitações registradas na fase 1: ESLint 9 marcado deprecated, mantido por compatibilidade com os plugins atuais do Next.js; naquela revisão, a pasta ainda não era reconhecida como repositório Git. Não houve validação visual de produto, pois essa fase continha apenas o bootstrap. O repositório local foi inicializado posteriormente e verificado na revisão da fase 2.

## Fase 2 — Design System e Layout
Status: concluída, revisada e aprovada para continuidade.

Escopo entregue: tokens dark/light; layout com explorador, editor somente leitura e preview demonstrativo; painéis redimensionáveis; controles de zoom; estados de loading, erro e vazio; adaptação para larguras intermediárias e mobile; foco visível e operação por teclado. Não foram introduzidos Monaco, renderização PlantUML, persistência ou funcionalidades da fase 3.

Evidências da revisão final (2026-10-13):
- Build de produção inspecionado no navegador em 1584 × 992, 1024 × 768 e 390 × 844, sem overflow horizontal nos viewports verificados.
- Redimensionamento por arraste e teclado, zoom de 50% a 200%, ajuste à área, temas dark/light, estados demonstrativos e navegação responsiva verificados.
- Skip link, landmarks, nomes acessíveis, referências `aria-controls`, foco visível e limites dos separadores verificados.
- `pnpm typecheck`, `pnpm lint`, `pnpm build` e `pnpm test` aprovados; os 2 smoke tests passaram.
- Comparação visual realizada contra `docs/design/phase-2-concept.png`; divergências e recomendações permanecem registradas no relatório da revisão para decisão antes de correções.

## Fase 3 — Edição de código PlantUML
Status: concluída e aprovada para continuidade.

Escopo entregue: Monaco Editor local com linguagem PlantUML, autocomplete e indentação; edição e atalhos nativos; modelos por documento; abas; criação, renomeação e exclusão em memória; documento ativo; checkpoints e indicação de alterações não salvas; Zustand sem persistência.

Evidências da fase 3 (2026-10-13):
- Edição, syntax highlighting, sugestão de snippet, undo/redo e `Ctrl+S` verificados no Monaco renderizado.
- Criação, validação de nome duplicado, renomeação, exclusão, fechamento, reabertura e alternância de documentos verificados no navegador.
- Tema dark/light, worker local, layout desktop e alternância mobile verificados sem erros ou warnings no console.
- `pnpm typecheck`, `pnpm lint`, `pnpm build` e `pnpm test` executados com sucesso; os 2 smoke tests existentes foram aprovados.

Limites: o preview permanece estático e não deriva do texto; nenhum endpoint, motor PlantUML, IndexedDB ou outra persistência foi introduzido.

## Fase 4 — Renderização oficial em SVG
Status: concluída, verificada e aprovada para continuidade.

Escopo entregue: endpoint NestJS `POST /render`; motor oficial PlantUML/Graphviz local; renderização automática com debounce de 400 ms; cancelamento e descarte de respostas antigas; erros estruturados; preservação do último SVG válido; estados reais de carregamento e erro; sanitização allowlist; infraestrutura Docker isolada e limitada.

Evidências da fase 4 (2026-10-13, revalidadas em 2026-10-14):
- SVG real produzido pela imagem oficial `plantuml/plantuml-server:jetty-v1.2026.8` e exibido no preview em dark mode com color mapper do motor.
- Erros de include local e remoto retornados de forma estruturada; último SVG válido permaneceu visível no navegador.
- Container confirmado com rede interna sem gateway, raiz somente leitura, capabilities removidas, `no-new-privileges`, 1 CPU, 768 MB e 128 PIDs.
- Contrato validado com smoke test usando renderer controlado, incluindo remoção de `script` e `onload` do SVG.
- `pnpm typecheck`, `pnpm lint`, `pnpm build` e `pnpm test` aprovados; os 2 smoke tests passaram.
- Fluxos de sucesso, atualização automática, tema dark/light e erro com preservação do último SVG foram inspecionados no navegador.

Limites: arquivos continuam apenas em memória; zoom e pan reais permanecem para a Fase 5. O renderer não usa serviços públicos nem permite includes locais/remotos.

## Fase 5 — Navegação do diagrama
Status: concluída, verificada e aprovada para continuidade.

Escopo entregue: `react-zoom-pan-pinch` integrado ao SVG real; zoom por roda centrado no cursor, touchpad e pinch; pan por arraste, botão central e espaço; controles de zoom, reset e Fit to Screen; percentual; fundo pontilhado; centralização inicial; navegação de diagramas grandes; preservação de escala e posição durante atualizações; setas como alternativa de deslocamento por teclado.

Evidências da fase 5 (2026-10-14):
- Zoom por roda e botão, pan por arraste, ativação por botão central e espaço, reset e Fit to Screen verificados no navegador.
- Escala e posição estabilizadas permaneceram idênticas após nova renderização do mesmo SVG.
- Layout e controles inspecionados em dark/light, no viewport mobile atual e em 1584 × 992 CSS pixels.
- Pinch e touchpad habilitados pela integração; o navegador de automação não expõe síntese multitoque para uma validação gestual real.
- `pnpm typecheck`, `pnpm lint`, `pnpm build` e `pnpm test` executados na revisão final.

Limites: transformações não persistem após recarregar a página; não há edição visual de nós, classes ou relacionamentos; navegar não altera o texto nem solicita nova renderização.

## Fase 6 — Persistência e exportação
Status: concluída, verificada e aprovada para continuidade.

Escopo entregue: persistência de documentos, abas e documento ativo em IndexedDB; autosave e recuperação após reload; criação, renomeação e exclusão persistentes; importação de `.puml`, `.plantuml` e `.pu`; exportação do código em `.puml`, do SVG sanitizado e de PNG em escala configurável; tratamento e indicação visual de falhas locais.

Evidências da fase 6 (2026-10-15):
- Edição seguida de autosave e recuperação após recarregar a página verificada no navegador.
- Criação, renomeação e importação persistiram após reload; importação duplicada exibiu erro sem substituir o documento existente.
- Downloads `.puml`, `.svg` e `.png` executados a partir do documento importado; o código exportado corresponde ao original e o SVG não contém controles do canvas.
- PNG em 2× gerado com 492 × 498 px a partir de SVG de 246 × 249 px, confirmando a escala selecionada.
- Typecheck, lint, build de produção e smoke tests do monorepo executados ao final da implementação.

Limites: os dados ficam somente no navegador atual; não há autenticação, banco remoto ou sincronização em nuvem. Transformações do canvas e SVGs renderizados não são persistidos. O navegador de automação não simula falha real de quota ou indisponibilidade do IndexedDB; esses caminhos possuem mensagens e preservam o estado em memória.

## Fase 7 — Projetos modulares e visualização em tela cheia
Status: implementada; verificação automatizada não executada por restrição explícita da fase.

Escopo entregue: importação de pastas com estrutura relativa; árvore de arquivos; arquivo principal independente do arquivo ativo; preview imediato do arquivo selecionado com o principal como fallback; includes relativos aninhados com diagnóstico de arquivo ausente e ciclo; expansão isolada em memória na API; modo expandido e Fullscreen API com `F11`/`Esc`, preservando o canvas.

Limites: a seleção de pasta depende do suporte do navegador a `webkitdirectory`; `F11` pode permanecer reservado pelo navegador ou sistema operacional. Não há edição visual, acesso arbitrário ao filesystem, sincronização remota ou resolução de URLs/includes externos.

## Fase 8 — Projetos independentes e acesso ao sistema de arquivos local
Status: implementada; verificação automatizada não executada por restrição explícita da fase.

Escopo entregue: coleção persistente de projetos independentes; seletor, criação, alternância e fechamento; importação de pasta como novo projeto interno; pasta local via File System Access API; leitura recursiva de PlantUML; handles persistidos no IndexedDB; edição e gravação direta com `Ctrl+S` e Salvar todos; detecção de alteração externa; estados de permissão, arquivo removido e incompatibilidade; renderização restrita aos caminhos relativos do projeto ativo.

Limites: `showDirectoryPicker` depende de navegador compatível e contexto seguro. Criação, renomeação e exclusão direta de arquivos no disco não fazem parte desta fase; essas ações permanecem disponíveis somente em projetos internos do navegador.

## Gate de continuidade
Ao finalizar uma fase, reportar evidências e pendências e aguardar aprovação explícita antes de iniciar a seguinte. Não adicionar recursos para preencher lacunas da especificação.
