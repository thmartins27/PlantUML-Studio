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

## Fluxo proposto
A interface envia o texto a um caso de uso de renderização. Um adaptador de infraestrutura invoca o motor oficial e devolve SVG ou um erro estruturado. O visualizador controla zoom e deslocamento sem pedir uma nova renderização para cada transformação.

## Cuidados na implementação
- Tratar texto e SVG como entradas não confiáveis; definir limites de tamanho, tempo e inserção segura de SVG.
- Definir a política de includes e acesso a recursos externos antes de expor o renderizador.
- Manter detalhes do motor fora dos componentes de UI.
- Não adicionar abstrações ou dependências sem necessidade demonstrada.

## Decisões pendentes
Contratos HTTP de produto, estratégia de execução do motor oficial, biblioteca do editor e estratégia de testes das funcionalidades futuras. Registrar decisões aceitas em [DECISIONS.md](./DECISIONS.md).

## Fundação implementada
- PNPM 12.9.1 com workspaces `apps/*` e `packages/*`, sem orquestrador adicional.
- Node.js 24.19.0 como ambiente de referência; versão em `.nvmrc` e engines limitados à linha 24.
- Next.js 16.4.0 e React 19.3.0 no App Router; página estática mínima, sem design de produto nesta fase.
- NestJS 12.1.2 com adaptador HTTP Express e `GET /health`, retornando `{ "status": "ok" }`.
- TypeScript 5.9.3 com `strict: true` herdado da configuração raiz por todos os pacotes; esta versão é compatível com o intervalo aceito pelo typescript-eslint utilizado.
- ESLint 9 e typescript-eslint para código TypeScript; configuração oficial Next.js para a web.
- API compilada por `tsc`; `tsc-watch` recompila e reinicia o processo em desenvolvimento, preservando metadados de decorators do NestJS.
- Shared é um módulo vazio compilável, sem contratos especulativos e sem dependência dos frameworks.
- Testes de smoke usam `node:test`, iniciam os builds em portas locais temporárias e encerram os processos ao final. Não exigem framework de testes adicional.

## Comandos e execução local
Na raiz, execute `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm build` e `pnpm test`.

`pnpm dev` inicia web em `http://127.0.0.1:3000` e API em `http://127.0.0.1:3001`. Para iniciar builds de produção separadamente, use `pnpm --filter @plantuml-studio/web start` e `pnpm --filter @plantuml-studio/api start` após `pnpm build`.

A API aceita `PORT` e `HOST`; por padrão escuta apenas em loopback. A web aceita as opções do CLI Next.js. Não há integração web/API, CORS, acesso externo ou configuração de implantação nesta fase.

## Dependências e justificativas
- `next`, `react` e `react-dom`: framework web exigido e seu runtime.
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `reflect-metadata` e `rxjs`: runtime e dependências exigidas pelo NestJS.
- TypeScript, tipos de Node/React e ESLint com suas configurações: compilação estrita e análise estática.
- `tsc-watch`: ciclo de recompilação e reinicialização da API em desenvolvimento.

Versões diretas são fixas e a árvore resolvida é registrada no lockfile. O workspace exige um intervalo de 24 horas desde a publicação dos pacotes. Não há bibliotecas de editor, canvas, renderização, UI, banco ou autenticação.

Referências de configuração: [Next.js App Router](https://nextjs.org/docs/app/getting-started/installation) e [NestJS](https://docs.nestjs.com/first-steps).

O Next.js está configurado com `agentRules: false` para preservar a manutenção manual das instruções na raiz, sem gerar instruções adicionais durante `dev`. Apenas o postinstall do resolvedor de lint `unrs-resolver` foi autorizado no workspace.

## Interface da Fase 2
`app/page.tsx` compõe o `WorkspaceShell` cliente. Componentes de explorador, toolbar, editor somente leitura, preview, separadores e controles ficam em `components/studio`; dados demonstrativos em `demo-data.ts`. O editor recebe um arquivo por props e o preview recebe arquivo/estado, mantendo fronteiras explícitas para futura integração.

O estado é local ao React. Nenhuma nova dependência foi adicionada ao monorepo. ResizeObserver mede o espaço do SVG de exemplo; Pointer Events e teclado redimensionam painéis. Os SVGs demonstrativos são ilustrações fixas em JSX, sem parsing, geração dinâmica a partir de texto ou inserção de SVG externo. A política para SVGs reais continua pendente para a fase de renderização.
