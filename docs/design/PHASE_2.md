# Fase 2 — Referência visual e inventário

## Conceito
[Conceito principal](./phase-2-concept.png), gerado com Image Gen integrado. Direção adotada para implementação nesta tarefa, sem etapa separada de aprovação de conceito solicitada. Resolução nativa: 1584 × 992.

Brief: ferramenta desktop inspirada em VS Code, Linear e Excalidraw; barra superior, explorador, fonte somente leitura, preview SVG de demonstração, divisores e controles de zoom. Grafite neutro, violeta discreto, tipografia de interface 13px e código monoespaçado. Sem marketing, cards decorativos, imagens de produto ou integração PlantUML.

## Inventário antes da implementação
- Composição: barra 56px; explorador próximo de 19% da tela, ajustável; área restante dividida em editor e preview em proporção 50/50; rodapé 28px. Painéis contínuos separados por bordas finas.
- Dark: fundo `#101114`, superfície `#17181c`, preview `#121317`, borda `#2a2c33`, texto `#ececf1`, secundário `#a1a3b0`, violeta `#aa9aff`.
- Light: branco real `#ffffff` no editor, superfícies `#f7f8fa`, preview `#fafbfc`, borda `#dde0e7`, texto `#20222b`, secundário `#626677`, violeta `#6550c7`. Mesma geometria; sem tintura creme.
- Tipografia: sans do sistema, controles 12–13px, título 15px/600; código 13px/24px; diagramas 13px. Sem fontes remotas.
- Espaçamento: 4, 8, 12, 16, 24 e 32px; controles de 32px, linhas de arquivo 36px; raios 6px. Transições de cor/opacidade de 140ms, respeitando reduced motion.
- Ícones: SVG nativo 16px, viewBox 24, stroke 1.6, currentColor, sem preenchimento; código, arquivo, pasta, chevron, painel, sol/lua, exportar, play, fechar, informação, menos/mais, enquadrar, alerta e documento vazio.
- Componentes: WorkspaceShell, Toolbar, FileExplorer, EditorPanel, PreviewPanel, SplitHandle, IconButton, Icon e diagramas demonstrativos. Dados de exemplo separados da UI.
- Sem raster em produção: o conceito é referência documental; diagrama SVG é uma ilustração fixa de demonstração, não calculada a partir de PlantUML.

## Texto e estados permitidos
Texto-base do conceito: PlantUML Studio; Workspace de exemplo; Exportar; Simular preview; EXPLORADOR; diagramas; autenticacao.puml; componentes.puml; novo-diagrama.puml; Ambiente de demonstração; Arquivos não são salvos; Somente leitura; Visualização; SVG demonstrativo; Exemplo estático · sem renderização PlantUML; Monaco Editor será integrado na próxima fase; Modo demonstração; PlantUML; UTF-8; 100%.

Extensões necessárias para os estados solicitados: seletor Estado do preview com Exemplo/Carregando/Erro/Vazio; Carregando demonstração; Não foi possível exibir o preview; Erro simulado. Nenhuma requisição foi enviada; Voltar ao exemplo; Nenhum diagrama para visualizar; Selecione um exemplo para explorar a interface; Abrir exemplo; Selecione um arquivo; abas Código/Preview no mobile; contagem de linhas de exemplo. Rótulos acessíveis e tooltips podem explicar ações e limites.

## Interações e limites
Selecionar arquivos troca apenas dados demonstrativos; fechar aba mostra estado vazio; pasta e sidebar recolhem. Divisores respondem a pointer e setas/Home/End, com limites e foco visível. Tema é estado em memória. Zoom limita-se ao SVG demonstrativo; ajuste usa a área disponível. Simular preview apresenta loading e retorna ao SVG estático; o seletor permite manter cada estado para inspeção. Exportar fica desabilitado com explicação. Sem armazenamento, chamadas de API, parser ou Monaco.

## Adaptação e desvios intencionais
Abaixo de 1100px, sidebar recolhida por padrão; pode abrir sobre o conteúdo. Abaixo de 760px, Código/Preview alternam sem comprimir dois painéis. A textura irregular no explorador da imagem gerada é um artefato e será substituída pela superfície plana especificada. Acrescentar o seletor de estados é necessário para verificar os estados solicitados. Desenhos estáticos e seu texto são dados de exemplo, não saída do motor PlantUML. Botões de fechar, alternar sidebar e voltar ao exemplo têm comportamento local real.
