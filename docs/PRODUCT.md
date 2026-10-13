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
Editor de código, renderização automática ou manual, importação/exportação e recuperação local de documentos.

## Fase 1: fundação concluída
Preparar PNPM workspaces, Next.js App Router, NestJS, TypeScript estrito e verificações de compilação/execução. A página inicial e `GET /health` servem somente para comprovar a inicialização dos projetos.

Não implementar editor, canvas, renderização PlantUML, autenticação ou banco nesta fase. As fases seguintes dependem de aprovação explícita.

## Limite da especificação disponível
Este documento consolida os requisitos fornecidos na conversa e nas instruções do projeto. Não foi fornecida uma especificação adicional com seis fases nomeadas. O roadmap distingue a fundação autorizada da sequência proposta; recursos pendentes não são requisitos aprovados.

## Fase 2: Design System e Layout autorizados
Interface com sidebar e explorador demonstrativo, identificação do projeto e ações, área somente leitura preparada para Monaco, preview preparado para SVG, painéis redimensionáveis, controles visuais de zoom, temas dark/light e estados de loading/erro/vazio. Componentes acessíveis e reutilizáveis, com prioridade ao desktop.

Dados demonstrativos compõem apenas a interface. Não há integração PlantUML, persistência, parser ou funcionalidades completas de Monaco. A próxima fase requer aprovação explícita.
