# PlantUML Studio — Roadmap

Apenas a fase 1 está autorizada. As seis fases abaixo organizam os requisitos disponíveis; nomes, ordem e critérios das fases 2–6 são propostas a confirmar, pois não foi fornecida uma lista original de seis fases. Critérios não aprovados não autorizam funcionalidades adicionais.

## Fase 1 — Fundação do projeto
Status: concluída e verificada; aguardando aprovação para a fase 2.

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

Limitações: ESLint 9 marcado deprecated, mantido por compatibilidade com os plugins atuais do Next.js; inspeção por Git indisponível porque a pasta não é reconhecida como repositório. Não houve validação visual de produto, pois esta fase contém apenas bootstrap.

## Fase 2 — Estrutura da interface
Status: proposta, não iniciada; requer aprovação.

Critérios propostos: definir tokens e layout conforme o design system; estabelecer áreas do editor/visualizador e navegação; inspecionar fluxo, foco, teclado e adaptação de painéis. Não introduzir padrões de marketing ou dashboard decorativo.

## Fase 3 — Edição de código PlantUML
Status: proposta, não iniciada; requer aprovação.

Critérios propostos: escolher e justificar editor; permitir edição do texto como fonte de verdade; preservar conteúdo durante erros; confirmar o fluxo de solicitação de renderização antes de integrar a API. Sem parser próprio ou edição visual de nós.

## Fase 4 — Renderização oficial em SVG
Status: proposta, não iniciada; requer aprovação.

Critérios propostos: definir integração e limites do motor oficial; estabelecer contrato e erros; produzir SVG a partir do texto e apresentar feedback; verificar entradas inválidas, timeout, política de recursos externos e inserção segura do SVG.

## Fase 5 — Navegação do diagrama
Status: proposta, não iniciada; requer aprovação.

Critérios propostos: confirmar e implementar zoom, deslocamento e ajuste à área visível; manter transformações independentes do texto e da renderização; verificar descoberta dos controles e alternativas por teclado. Sem edição visual de nós.

## Fase 6 — Validação do MVP
Status: proposta, não iniciada; requer aprovação.

Critérios propostos: verificar fluxo integrado de edição/renderização/navegação; executar lint, typecheck, testes relevantes e build; inspecionar acessibilidade, adaptação visual e comportamento de erros; acordar e medir metas de desempenho e navegadores suportados; registrar limitações.

## Gate de continuidade
Ao finalizar uma fase, reportar evidências e pendências e aguardar aprovação explícita antes de iniciar a seguinte. Não adicionar recursos para preencher lacunas da especificação.
