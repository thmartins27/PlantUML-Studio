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
| Fases futuras do MVP | Fase 2 autorizada; confirmar escopo das fases 3–6 | Antes de cada fase |
| Design system | Tokens e comportamento implementados na Fase 2; avaliar feedback visual | Revisão da Fase 2 |
| Editor | Biblioteca, recursos e modo de disparo da renderização | Antes da fase 3 |
| Motor oficial | Processo Java, serviço ou outra integração oficial; implantação e dependências | Antes da fase 4 |
| Contrato de renderização | Endpoint, erros, limites, timeout e cancelamento | Antes da fase 4 |
| Segurança de renderização | Includes, rede, recursos locais e inserção segura de SVG | Antes da fase 4 |
| Navegação | Gestos, limites de zoom, atalhos e ajuste à área visível | Antes da fase 5 |
| Dados locais e arquivos | Necessidade de importação, exportação ou recuperação local | Somente se solicitados |
| Qualidade do MVP | Navegadores suportados e metas mensuráveis de desempenho | Antes da fase 6 |

Autenticação, persistência em banco e edição visual de nós permanecem fora do escopo; esta lista não autoriza sua inclusão.

Limitação de D010: ESLint 9.39.1 é marcado como deprecated no registro, mas os plugins React, import e a11y da configuração Next.js consultada ainda não declaram suporte ao ESLint 10. Atualizar quando houver compatibilidade, sem suprimir os avisos de peers.

## Decisões da Fase 2
- **D014 — Layout demonstrativo autorizado:** implementar sidebar, áreas de código e preview, redimensionamento, temas e estados; não iniciar a Fase 3.
- **D015 — Sem dependências adicionais:** React, CSS, Pointer Events, ResizeObserver e SVG nativo cobrem o escopo atual. Monaco não foi instalado; apenas sua futura área foi preparada.
- **D016 — Exemplos explícitos:** fonte somente leitura e SVGs fixos independentes. Não representam renderização PlantUML nem persistência. Exportação permanece desabilitada.
- **D017 — Estado transitório:** tema, seleção, zoom e dimensões ficam em memória; recarregar restaura a demonstração inicial.
- **D018 — Adaptação de painéis:** desktop com separadores acessíveis; explorer sobreposto em larguras intermediárias; abas Código/Preview em telas estreitas.

D012 descreve a entrega histórica da fundação; D014 autoriza sua substituição pelo layout desta fase, mantendo a API sem novas funcionalidades.
