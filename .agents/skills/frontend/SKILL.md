---
name: frontend
description: Implementar componentes e fluxos Next.js do PlantUML Studio, integrando editor PlantUML e visualizador SVG aos contratos da API.
---

# Frontend do PlantUML Studio

Consulte [AGENTS.md](../../../AGENTS.md), [ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) e [DESIGN_SYSTEM.md](../../../docs/DESIGN_SYSTEM.md).

Implemente em `apps/web` com Next.js App Router e TypeScript estrito. Use componentes cliente nas fronteiras que exigem estado interativo ou APIs do navegador; mantenha detalhes de infraestrutura fora dos componentes de apresentação.

O texto PlantUML permanece a fonte de verdade. Consuma renderização SVG do motor oficial por meio da camada de aplicação. Não crie parser PlantUML nem edição visual de nós. Zoom e deslocamento pertencem ao visualizador e não devem disparar renderização.

Ao integrar requisições, preserve o texto em caso de falha e impeça que uma resposta antiga substitua o resultado de uma edição mais recente. Trate a inserção de SVG conforme a política de segurança definida para a integração.

Coloque em `packages/shared` somente contratos realmente usados por web e API. Não adicione autenticação, persistência ou bibliotecas sem escopo e justificativa.

Para decisões visuais, use também [ui-ux](../ui-ux/SKILL.md). Execute lint, checagem de tipos e testes relevantes disponíveis no pacote alterado; informe quando a infraestrutura de verificação ainda não existir.
