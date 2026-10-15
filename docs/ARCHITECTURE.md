# PlantUML Studio — Arquitetura

## Limites confirmados
- TypeScript em modo estrito.
- Next.js App Router no frontend e NestJS no backend.
- Separação entre UI, lógica de aplicação e infraestrutura.
- Motor oficial PlantUML; nenhum parser PlantUML próprio.
- SVG como saída de renderização.

## Organização
- `apps/web`: interface Next.js, editor e visualizador.
- `apps/api`: API NestJS e integração com o motor de renderização.
- `packages/shared`: contratos e tipos realmente compartilhados, sem dependências de UI ou do runtime NestJS.

## Fluxo implementado
A interface envia o texto a um caso de uso de renderização. Um adaptador de infraestrutura invoca o motor oficial e devolve SVG ou um erro estruturado. O visualizador controla zoom e deslocamento sem pedir uma nova renderização para cada transformação.

## Cuidados na implementação
- Tratar texto e SVG como entradas não confiáveis; definir limites de tamanho, tempo e inserção segura de SVG.
- Manter includes locais e remotos bloqueados e o renderizador sem acesso direto à rede externa.
- Manter detalhes do motor fora dos componentes de UI.
- Não adicionar abstrações ou dependências sem necessidade demonstrada.

## Decisões pendentes
Metas de qualidade da validação final e navegadores oficialmente suportados. Contratos HTTP, execução do motor oficial, editor, persistência local, projetos modulares, importação/exportação, limites de segurança e navegação foram definidos nas fases 3–7 e estão registrados em [DECISIONS.md](./DECISIONS.md).

## Fundação implementada
- PNPM 12.9.1 com workspaces `apps/*` e `packages/*`, sem orquestrador adicional.
- Node.js 24.19.0 como ambiente de referência; versão em `.nvmrc` e engines limitados à linha 24.
- Next.js 16.4.0 e React 19.3.0 no App Router; página estática mínima, sem design de produto nesta fase.
- NestJS 12.1.2 com adaptador HTTP Express e `GET /health`, retornando `{ "status": "ok" }`.
- TypeScript 5.9.3 com `strict: true` herdado da configuração raiz por todos os pacotes; esta versão é compatível com o intervalo aceito pelo typescript-eslint utilizado.
- ESLint 9 e typescript-eslint para código TypeScript; configuração oficial Next.js para a web.
- API compilada por `tsc`; `tsc-watch` recompila e reinicia o processo em desenvolvimento, preservando metadados de decorators do NestJS.
- Na fundação, shared começou como módulo vazio compilável; desde a Fase 4 contém somente contratos consumidos por web e API, sem dependência dos frameworks.
- Testes de smoke usam `node:test`, iniciam os builds em portas locais temporárias e encerram os processos ao final. Não exigem framework de testes adicional.

## Comandos e execução local
Na raiz, execute `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm build` e `pnpm test`.

`pnpm dev` inicia web em `http://127.0.0.1:3000` e API em `http://127.0.0.1:3001`, mas a renderização exige um motor acessível pela API. Para o fluxo integrado e isolado da Fase 4, use os comandos Docker descritos abaixo. Para iniciar builds de produção separadamente, use `pnpm --filter @plantuml-studio/web start` e `pnpm --filter @plantuml-studio/api start` após `pnpm build`.

A API aceita `PORT`, `HOST`, `WEB_ORIGIN`, `PLANTUML_RENDERER_URL` e `RENDER_TIMEOUT_MS`; por padrão escuta apenas em loopback. A web usa `NEXT_PUBLIC_API_URL` para acessar a API. As variáveis documentadas estão em `.env.example`.

## Dependências e justificativas
- `next`, `react` e `react-dom`: framework web exigido e seu runtime.
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `reflect-metadata` e `rxjs`: runtime e dependências exigidas pelo NestJS.
- TypeScript, tipos de Node/React e ESLint com suas configurações: compilação estrita e análise estática.
- `tsc-watch`: ciclo de recompilação e reinicialização da API em desenvolvimento.

Versões diretas são fixas e a árvore resolvida é registrada no lockfile. O workspace exige um intervalo de 24 horas desde a publicação dos pacotes. Na fundação não havia bibliotecas de editor, canvas, renderização, UI, banco ou autenticação; as dependências de editor e estado foram adicionadas somente após a autorização da fase 3.

Referências de configuração: [Next.js App Router](https://nextjs.org/docs/app/getting-started/installation) e [NestJS](https://docs.nestjs.com/first-steps).

O Next.js está configurado com `agentRules: false` para preservar a manutenção manual das instruções na raiz, sem gerar instruções adicionais durante `dev`. Apenas o postinstall do resolvedor de lint `unrs-resolver` foi autorizado no workspace.

## Interface da Fase 2
`app/page.tsx` compõe o `WorkspaceShell` cliente. Componentes de explorador, toolbar, editor somente leitura, preview, separadores e controles ficam em `components/studio`; dados demonstrativos em `demo-data.ts`. O editor recebe um arquivo por props e o preview recebe arquivo/estado, mantendo fronteiras explícitas para futura integração.

O estado é local ao React. Nenhuma nova dependência foi adicionada ao monorepo. ResizeObserver mede o espaço do SVG de exemplo; Pointer Events e teclado redimensionam painéis. Os SVGs demonstrativos são ilustrações fixas em JSX, sem parsing, geração dinâmica a partir de texto ou inserção de SVG externo. A política para SVGs reais continua pendente para a fase de renderização.

## Editor da Fase 3
`state/document-store.ts` mantém documentos, conteúdo, checkpoints salvos, abas abertas e documento ativo em um store Zustand sem middleware de persistência. Componentes de UI acionam operações explícitas do store; recarregar a página restaura os exemplos iniciais.

`MonacoCodeEditor` é carregado somente no cliente e usa um modelo Monaco por identificador de documento. Isso preserva seleção, histórico de undo/redo e estado de visualização durante a alternância entre abas. Monaco e seu worker são empacotados localmente; o runtime não depende de CDN.

`plantuml-language.ts` registra apenas configuração de linguagem para edição: tokens, comentários, pares, indentação e snippets. Essa configuração não analisa semanticamente nem renderiza PlantUML e não substitui o motor oficial. O preview da fase 2 continua estático e independente do conteúdo editado.

Dependências justificadas da fase 3:
- `monaco-editor`: editor solicitado e seu worker local.
- `@monaco-editor/react`: fronteira React focada para modelos e ciclo de vida do Monaco.
- `zustand`: estado em memória solicitado para documentos e abas, sem persistência.

## Renderização da Fase 4
`POST /render` recebe `{ source, theme? }` e devolve `RenderSuccess` com SVG sanitizado e duração, ou um `RenderFailure` estruturado. Os contratos compartilhados vivem em `packages/shared`; a entrada aceita no máximo 50.000 bytes, o corpo JSON da API é limitado a 64 KB e cada resposta do motor a 2 MB.

`RenderingService` é o adaptador de infraestrutura NestJS. Ele envia o código em `text/plain` ao servidor oficial PlantUML, usa o mapper `IDENTITY` no tema claro e `LIGTHNESS_INVERSE` no escuro, aborta após 5 segundos e converte falhas de sintaxe, timeout e indisponibilidade em códigos HTTP e de produto explícitos. A inversão por luminosidade no tema escuro mantém contraste também quando a fonte define preenchimentos claros explicitamente. Nenhuma URL fornecida pelo usuário é usada como destino.

O serviço `renderer` de `docker-compose.yml` usa `plantuml/plantuml-server:jetty-v1.2026.8` fixado por digest, que inclui PlantUML e Graphviz. Ele não publica porta, participa apenas de uma rede Docker `internal`, usa `PLANTUML_SECURITY_PROFILE=SANDBOX`, filesystem raiz somente leitura, usuário não-root da imagem, todas as capabilities removidas, `no-new-privileges`, limite de 1 CPU, 768 MB, 128 PIDs e tmpfs limitados. A API aguarda o healthcheck do motor, é sua única ponte e publica somente em loopback.

Antes de devolver o SVG, a API aplica uma allowlist de elementos, atributos e estilos com `sanitize-html`; scripts, eventos, links, recursos externos e CSS com `url()`, `expression()` ou `@import` não atravessam o contrato. O frontend exibe o resultado como `img` com data URL, sem inserir markup SVG no DOM.

`useRenderPreview` separa o ciclo de renderização da UI: debounce de 400 ms, `AbortController`, número sequencial para descartar respostas antigas e cache do último SVG válido por documento e tema. Alterar zoom ou layout não participa desse fluxo. Os controles de navegação permanecem desabilitados até a Fase 5.

Para executar a integração local, use `pnpm renderer:up` e depois inicie apenas a web com `pnpm --filter @plantuml-studio/web dev`. `pnpm renderer:down` encerra a infraestrutura. As variáveis disponíveis estão em `.env.example`.

Dependência justificada da fase 4:
- `sanitize-html` e seus tipos: sanitização server-side por allowlist do SVG não confiável antes da exibição.

## Canvas interativo da Fase 5
`InteractiveCanvas` encapsula `react-zoom-pan-pinch` dentro do preview. A fonte e o ciclo de renderização não conhecem escala nem posição: roda e touchpad aplicam zoom no ponto do cursor, pinch usa os eventos de toque da biblioteca e o pan aceita botão esquerdo, botão central e espaço + arraste. Setas oferecem deslocamento por teclado quando o canvas está focado.

A instância de transformação permanece montada enquanto o SVG válido é atualizado. Escala e posição são reaplicadas após o carregamento da nova imagem; a primeira imagem é centralizada em 100%. Reset centraliza em 100% e Fit to Screen calcula a escala pela dimensão intrínseca do SVG e pela área disponível, entre 10% e 400%. Nenhuma dessas operações altera o documento, chama a API ou participa das dependências de `useRenderPreview`.

Dependência justificada da fase 5:
- `react-zoom-pan-pinch`: primitivas acessíveis por React para transformações, gestos de mouse, touchpad e pinch, sem alterar ou analisar o SVG.

## Persistência e exportação da Fase 6
`state/document-store.ts` continua responsável pelas operações de documento e expõe um snapshot serializável versionado. `application/documents` implementa o adaptador IndexedDB nativo e o ciclo de hidratação/autosave; a UI não conhece transações ou object stores. O snapshot contém documentos, abas abertas e documento ativo, mas não armazena SVG, transformação do canvas ou estado do Monaco.

O autosave usa debounce de 450 ms, grava uma única chave de workspace e atualiza `savedContent` somente quando o conteúdo correspondente foi confirmado pelo IndexedDB. `pagehide` inicia uma última gravação de melhor esforço. Falhas de abertura, leitura, gravação, dados incompatíveis e bloqueio aparecem no editor e na barra de status sem apagar o estado em memória.

`application/export/document-export.ts` concentra exportações executadas pelo navegador. O código é baixado em UTF-8; o SVG é exatamente o último resultado sanitizado recebido da API; o PNG é rasterizado em canvas efêmero entre 1× e 4×, com limites de 16.384 px por lado e 67.108.864 pixels. Controles, fundo pontilhado, zoom e pan não fazem parte dos arquivos gerados.

A importação aceita somente `.puml`, `.plantuml` e `.pu`, respeita o mesmo limite de 50 KB da renderização e reutiliza a validação de nomes do store. IndexedDB, File API, Blob, object URLs e canvas são APIs nativas; nenhuma dependência foi adicionada na Fase 6.

## Projetos modulares e tela cheia da Fase 7
Cada documento possui um `path` relativo persistido e o workspace registra `mainDocumentId`. A importação de diretório usa `webkitRelativePath`, preserva a árvore original e seleciona `main.puml`, `main.plantuml` ou `main.pu` quando presente. O arquivo ativo é o entrypoint temporário do preview; o principal permanece como fallback quando não há documento ativo. Toda alteração no mapa de arquivos renderiza novamente o entrypoint visualizado para manter seus includes atualizados.

`POST /render` permanece compatível com fonte única e também aceita `{ entryPath, files, theme }`. A API normaliza caminhos POSIX, rejeita absolutos, URLs, travessia acima da raiz, duplicatas, projetos acima de 200 arquivos ou 500 KB e expansão acima de 1 MB. Um resolvedor textual limitado às três diretivas de include produz a fonte enviada ao motor oficial; não acessa o filesystem e não interpreta a linguagem PlantUML além dessas diretivas. O sandbox do renderer continua como segunda camada.

O modo expandido mantém `InteractiveCanvas` montado e altera apenas o layout. Quando disponível, `requestFullscreen()` coloca o próprio preview na Fullscreen API; caso seja bloqueado, a mesma ação usa o modo expandido por CSS. A transformação do canvas não entra no store nem no contrato de renderização.

## Projetos independentes e filesystem da Fase 8
`document-store.ts` mantém uma coleção de projetos. Cada projeto encapsula documentos, abas, documento ativo e principal; somente o projeto ativo compõe o payload relativo enviado ao renderizador. Projetos fechados continuam persistidos e podem ser reabertos pelo seletor.

Projetos de origem `browser` usam IndexedDB como armazenamento. Projetos `local` guardam metadados e handles estruturadamente clonáveis no mesmo snapshot, mas o checkpoint `savedContent` representa o arquivo em disco. O autosave preserva o estado de edição no IndexedDB sem marcar alterações locais como gravadas.

`local-file-system.ts` isola `showDirectoryPicker`, leitura recursiva, permissões e escrita. Antes de gravar, compara `lastModified` e o conteúdo conhecido; divergência externa interrompe o salvamento. Handles e caminhos absolutos nunca entram no contrato da API: o backend recebe apenas o mapa de caminhos relativos do projeto ativo.
