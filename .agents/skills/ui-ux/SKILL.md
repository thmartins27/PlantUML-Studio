---
name: ui-ux
description: Projetar e ajustar interfaces e fluxos de UI/UX do PlantUML Studio, incluindo layouts, componentes visuais, navegação, controles do canvas e interações.
---

# UI/UX do PlantUML Studio

Leia [AGENTS.md](../../../AGENTS.md), [PRODUCT.md](../../../docs/PRODUCT.md) e [DESIGN_SYSTEM.md](../../../docs/DESIGN_SYSTEM.md) antes de alterar a interface.

Use a skill instalada `frontend-app-builder` para tarefas visuais conforme solicitado pelo usuário. Em caso de conflito, siga as instruções do projeto e seu design system. Preserve Next.js App Router e o fluxo de editor/visualizador; não adote um template de dashboard ou outra stack por padrão da skill.

Para novas superfícies ou redesigns, aplique o workflow de conceito e comparação visual da skill. Para pequenos ajustes no sistema existente, trabalhe diretamente com os componentes e tokens vigentes. Não invente tokens aprovados quando o documento os marcar como pendentes.

Verifique foco, teclado, nomes acessíveis, contraste, estados de erro/processamento e legibilidade em desktop e larguras menores. Mantenha o zoom do diagrama separado dos controles. Relate as verificações executadas e limitações observadas.

## Fluxo e consistência visual
Antes de implementar, avalie o fluxo de interação: tarefa principal, sequência de ações, foco, feedback e recuperação de erros. Use padrões de interação do VS Code e Excalidraw como referências para ferramentas de desenvolvedor, adaptando-os ao escopo do produto sem copiar funcionalidades não solicitadas.

Priorize layouts desktop-first com painéis divididos responsivos, espaçamento e tipografia consistentes. Considere temas claro e escuro ao definir tokens e estados; siga as escolhas específicas do design system. Garanta que os controles de zoom, deslocamento e ajuste do canvas sejam fáceis de descobrir e utilizáveis por teclado.

Não crie padrões de landing page, seções de marketing ou cards decorativos de dashboard.

Após implementar, inspecione a interface renderizada e percorra o fluxo afetado. Identifique e corrija inconsistências visuais ou de usabilidade dentro do escopo, incluindo painéis, foco e temas implementados. Se não for possível renderizar a aplicação, reporte a limitação sem declarar validação visual concluída.
