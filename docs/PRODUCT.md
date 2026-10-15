# PlantUML Studio — Produto

## Objetivo
Editor web de PlantUML com visualização interativa de diagramas, voltado ao fluxo de trabalho de desenvolvedores em desktop.

## Requisitos confirmados
- O código PlantUML é a fonte de verdade.
- A renderização usa o motor oficial PlantUML e produz SVG.
- As transformações de visualização são independentes da renderização.
- A interface prioriza usabilidade, acessibilidade e desempenho.

## Fluxo proposto para o MVP
1. Escrever ou colar código PlantUML no editor.
2. Solicitar a renderização e visualizar o SVG.
3. Receber feedback de processamento e de erros sem perder o texto.
4. Navegar pelo diagrama com zoom, deslocamento e ajuste à área visível.

Esse fluxo é uma base de planejamento; implementar somente o escopo solicitado em cada tarefa.

## Fora do escopo inicial
- Edição visual de nós.
- Autenticação e persistência em banco de dados sem solicitação explícita.

## A definir
Metas mensuráveis de desempenho, navegadores oficialmente suportados e critérios para uma validação final do MVP.

## Fase 1: fundação concluída
Preparar PNPM workspaces, Next.js App Router, NestJS, TypeScript estrito e verificações de compilação/execução. A página inicial e `GET /health` servem somente para comprovar a inicialização dos projetos.

Não implementar editor, canvas, renderização PlantUML, autenticação ou banco nesta fase. As fases seguintes dependem de aprovação explícita.

## Limite da especificação disponível
Este documento consolida os requisitos fornecidos na conversa e nas instruções do projeto. Não foi fornecida uma especificação adicional com seis fases nomeadas. O roadmap distingue a fundação autorizada da sequência proposta; recursos pendentes não são requisitos aprovados.

## Fase 2: Design System e Layout autorizados
Interface com sidebar e explorador demonstrativo, identificação do projeto e ações, área somente leitura preparada para Monaco, preview preparado para SVG, painéis redimensionáveis, controles visuais de zoom, temas dark/light e estados de loading/erro/vazio. Componentes acessíveis e reutilizáveis, com prioridade ao desktop.

Dados demonstrativos compõem apenas a interface. Não há integração PlantUML, persistência, parser ou funcionalidades completas de Monaco. A próxima fase requer aprovação explícita.

## Fase 3: Editor de código autorizado
O Monaco Editor substitui a fonte somente leitura e permite editar múltiplos documentos PlantUML em memória. O fluxo inclui syntax highlighting, autocomplete básico, indentação, atalhos nativos de edição, abas, criação, renomeação, exclusão, documento ativo e indicação de alterações não salvas.

Documentos e checkpoints de salvamento existem somente durante a sessão atual. O preview continua sendo uma ilustração estática independente do texto; não há API de renderização, IndexedDB, sistema de arquivos, autenticação ou banco de dados nesta fase.

## Fase 4: Motor de renderização autorizado
O documento ativo é renderizado automaticamente, após 400 ms sem edição, pelo motor oficial PlantUML com Graphviz em infraestrutura local. A API retorna SVG ou erro estruturado; o frontend descarta respostas obsoletas e preserva o último SVG válido em falhas subsequentes.

O renderizador não usa servidores públicos, não acessa rede nem arquivos locais e roda isolado em Docker. Zoom, pan e persistência continuam fora desta fase.

## Fase 5: Canvas interativo autorizado
O SVG renderizado pode ser navegado sem alterar o código PlantUML ou disparar nova renderização. O canvas oferece zoom centrado no cursor por roda, touchpad e gesto de pinça; pan por arraste, botão central ou espaço + arraste; controles de zoom, reset e ajuste à área; indicador percentual; centralização inicial e preservação da transformação durante atualizações do SVG quando a geometria permitir.

Não há edição visual de classes, nós ou relacionamentos. As transformações existem somente no visualizador e continuam sem persistência.

## Fase 6: Persistência e exportação autorizadas
Os documentos, as abas abertas e o documento ativo são salvos automaticamente em IndexedDB e recuperados após recarregar a página. Criar, importar, renomear, editar e excluir participam do mesmo fluxo local, com feedback explícito de carregamento, salvamento e erro.

O Studio importa arquivos `.puml`, `.plantuml` e `.pu`, exporta o texto original como `.puml`, o último diagrama válido como SVG e uma conversão PNG em escala de 1× a 4×. Os arquivos gráficos contêm somente o diagrama sanitizado, sem controles ou fundo do canvas. Não há autenticação, banco remoto ou sincronização em nuvem.

## Fase 7: Projetos modulares e tela cheia autorizados
O workspace aceita pastas PlantUML, preserva seus caminhos relativos e permite escolher um arquivo principal. `!include`, `!include_once` e `!include_many` são resolvidos contra os arquivos do próprio projeto, inclusive de forma aninhada; arquivos ausentes, caminhos que escapem da raiz e ciclos são apresentados como erros sem alterar as fontes originais.

Selecionar qualquer arquivo no explorador ou em uma aba também o torna o entrypoint temporário do preview, sem alterar a definição de arquivo principal. O principal permanece como fallback do projeto quando não há documento ativo.

O preview pode ocupar toda a interface ou a Fullscreen API do navegador, mantendo o mesmo canvas, zoom, pan e controles. `F11` alterna o modo quando o navegador entrega o atalho à aplicação e `Esc` retorna ao workspace.

## Fase 8: Projetos independentes e acesso ao sistema de arquivos autorizado
O workspace mantém projetos independentes, cada um com ID, nome, origem, documentos, abas, arquivo ativo e arquivo principal próprios. Projetos internos permanecem no IndexedDB; importar uma pasta cria um projeto novo em vez de misturar seus arquivos ao projeto atual.

Em navegadores compatíveis, `showDirectoryPicker` abre uma pasta como projeto local e mantém `FileSystemDirectoryHandle` e `FileSystemFileHandle` no IndexedDB. `Ctrl+S` grava o arquivo ativo e Salvar todos grava as alterações pendentes diretamente nos arquivos originais, mediante permissão. Mudanças externas, remoções, negação de acesso e ausência da API são comunicadas sem sobrescrita silenciosa.
