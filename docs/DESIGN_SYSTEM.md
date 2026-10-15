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
A página mínima da fundação foi substituída pelo layout demonstrativo da Fase 2, autorizado pelo usuário. Ao concluir essa fase, editor e renderização ainda permaneciam para fases futuras.

## Evolução da Fase 3
- Monaco ocupa a área existente do editor sem alterar as proporções dos painéis.
- Abas abertas rolam horizontalmente e indicam o documento ativo e alterações não salvas.
- O explorador preserva a hierarquia compacta e expõe ações acessíveis de criar, renomear e excluir.
- Diálogos de gerenciamento reutilizam cores, tipografia, bordas, raios e foco do sistema existente.
- O atalho `Ctrl/Cmd+S` e o botão de salvar criam apenas um checkpoint na sessão; não comunicam persistência permanente.
- Em mobile, Monaco e preview continuam alternados pelas abas Código/Preview, sem comprimir os dois painéis.

## Evolução da Fase 4
- O preview troca os estados demonstrativos por estados reais de aguardando, renderizando, sucesso e erro.
- Durante uma atualização, o último SVG permanece visível com um indicador discreto; em erro, um painel acessível explica a falha e oferece nova tentativa.
- O motor usa identidade de cores no tema claro e inversão por luminosidade no escuro, preservando contraste inclusive sobre cores explícitas sem filtros CSS no SVG.
- SVGs são mostrados como imagens sanitizadas; nenhum markup retornado é injetado diretamente no DOM.
- Os controles de zoom continuam visíveis para preservar o layout, mas ficam desabilitados até a Fase 5.

## Evolução da Fase 5
- O fundo pontilhado existente passa a identificar a superfície navegável, sem competir com o diagrama.
- A barra flutuante preserva geometria, tokens e ícones da Fase 2; contém zoom out, percentual, zoom in, reset e Fit to Screen.
- Zoom varia de 10% a 400%; reset retorna ao centro em 100% e Fit to Screen nunca amplia um diagrama acima de 100%.
- O cursor usa `grab`/`grabbing`, imagens não são arrastáveis e o canvas mantém foco visível e deslocamento por setas.
- A primeira imagem é centralizada. Atualizações preservam escala e posição quando possível, inclusive durante loading ou erro com último SVG válido.
- Gestos e animações são suaves, mas as transições são removidas quando `prefers-reduced-motion` está ativo.

## Evolução da Fase 6
- A topbar identifica o workspace como local e reúne exportações em um popover compacto, sem transformar a interface em um gerenciador de arquivos genérico.
- O explorador oferece importação ao lado da criação e comunica sucesso ou falha junto ao contexto dos documentos.
- Editor e statusbar distinguem carregando, salvando, salvo e erro com texto e indicador visual; cor nunca é o único sinal.
- O botão Salvar e `Ctrl/Cmd+S` acionam gravação real no IndexedDB; o autosave permanece o comportamento padrão.
- Exportação de PNG mantém a escolha de escala ao lado da ação. Opções gráficas ficam desabilitadas enquanto não houver SVG válido.
- SVG e PNG usam apenas o diagrama sanitizado. Fundo pontilhado, toolbar, controles e transformação atual do canvas permanecem exclusivos da interface.

## Evolução da Fase 7
- O explorador usa árvore compacta de pastas e arquivos, preservando recuos, estados de expansão e ações acessíveis no padrão já existente.
- O arquivo principal recebe selo textual e ação própria; selecionar outro arquivo atualiza editor e preview sem mover esse selo. O cabeçalho do preview identifica o caminho atualmente visualizado.
- Importar pasta ocupa a mesma barra compacta das ações de arquivo e reporta limites ou conflitos junto ao explorador.
- Tela cheia é uma ação do canvas e permanece na barra flutuante ao lado de Fit to Screen; sem diagrama, o mesmo controle fica no canto do preview.
- No modo expandido, chrome global, editor e sidebar desaparecem; fundo, SVG e controles mantêm os mesmos tokens e não recriam o canvas.

## Evolução da Fase 8
- O explorador inicia com um seletor compacto de projeto, selo textual de origem e ações acessíveis para abrir pasta, importar pasta, criar e fechar projeto.
- Projetos locais usam o rótulo `local`; projetos persistidos somente no IndexedDB usam `navegador`. A distinção nunca depende apenas de cor.
- Abas, seleção, árvore e arquivo principal exibem somente o estado do projeto ativo.
- O editor diferencia alteração pendente, salvamento no navegador e gravação no disco; projetos locais oferecem Salvar todos ao lado de `Ctrl+S`.
- Navegadores incompatíveis recebem orientação para Importar Pasta sem ocultar o restante do fluxo.
