# PlantUML Studio — Design System

## Direção confirmada
Interface profissional e discreta para desenvolvedores, com prioridade ao desktop, acessibilidade e desempenho. Evitar composição genérica de dashboard.

## Composição inicial proposta
- Área principal dedicada ao editor e ao diagrama.
- Barra de ferramentas compacta com ações relacionadas ao documento e à visualização.
- Estados de vazio, processamento e erro claros, preservando o conteúdo digitado.
- Em larguras menores, manter editor e visualizador acessíveis sem comprimir controles a ponto de prejudicar o uso.

## Convenções
- Separar a tipografia de código da tipografia de controles.
- Usar hierarquia visual consistente e decoração moderada.
- Garantir foco visível, navegação por teclado e nomes acessíveis para botões de ícone.
- Não depender apenas de cor para comunicar estado.
- Respeitar preferências de redução de movimento.
- Manter controles do visualizador independentes do zoom do diagrama.

## Tokens da Fase 2
Referência: [conceito e inventário](./design/PHASE_2.md). Tokens implementados em [globals.css](../apps/web/app/globals.css), escopados por `data-theme`.

| Token | Dark | Light |
| --- | --- | --- |
| Fundo do editor | `#101114` | `#ffffff` |
| Superfícies | `#17181c` | `#f7f8fa` |
| Preview | `#121317` | `#fafbfc` |
| Borda | `#2a2c33` | `#dde0e7` |
| Texto | `#ececf1` | `#20222b` |
| Texto secundário | `#a1a3b0` | `#626677` |
| Acento | `#aa9aff` | `#6550c7` |
| Seleção | `#272631` | `#eeebfa` |
| Erro | `#f0a1aa` | `#ae344c` |

Fontes do sistema: sans-serif para UI e SFMono/Consolas/Liberation Mono para código. UI 13px, controles 12–13px, rótulos auxiliares 11px, título 15px/600; código 13px/24px. Espaçamentos 4/8/12/16/24/32px; bordas de 1px; controles com raio 6px. Ícones SVG de 16px com traço de 1.6 e `currentColor`.

## Layout e interação implementados
- Topbar 56px, statusbar 28px, sidebar inicial 280px (limites 200–360px).
- Editor ocupa inicialmente 50% da área de documento, ajustável entre 35% e 65%.
- Separadores de 8px com indicação de arraste, foco visível, setas, Home e End.
- Abaixo de 1100px, explorador sobreposto e recolhido inicialmente; abaixo de 760px, alternância Código/Preview.
- Tema em memória, iniciado em dark; sem armazenamento local ou cookies.
- Botões reutilizáveis, estados disabled, títulos acessíveis, skip link e foco visível.
- Seleção de arquivos e fechamento da aba afetam somente exemplos em memória.
- Zoom de 50% a 200% do enquadramento automático do exemplo SVG. O botão de ajuste retorna a 100%; não há canvas, pan ou motor PlantUML.
- Estados Exemplo/Carregando/Erro/Vazio selecionáveis. A ação Simular preview carrega o exemplo após 900ms; mudar arquivo/estado cancela o timer anterior.
- Cor/opacidade com transições de 140ms e spinner discreto; animações desativadas sob `prefers-reduced-motion`.

## Fronteiras da demonstração
Fonte exibida somente para leitura, sem Monaco ou parser. SVGs são ilustrações fixas independentes do texto, identificadas como exemplos. Exportação permanece desabilitada; não há salvamento, persistência ou chamadas à API. A indicação de demonstração permanece visível no rodapé.

## Workflow de UI/UX
Usar a skill local [ui-ux](../.agents/skills/ui-ux/SKILL.md) e a skill instalada `frontend-app-builder`. As instruções do projeto e este documento prevalecem sobre os padrões genéricos da skill. Pequenos ajustes dentro do sistema existente não exigem um novo conceito visual.

## Evolução
A página mínima da fundação foi substituída pelo layout demonstrativo da Fase 2, autorizado pelo usuário. Integração do editor e renderização permanecem para fases futuras.
