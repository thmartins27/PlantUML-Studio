---
name: code-quality
description: Implementar ou revisar código TypeScript, React, Next.js e NestJS do PlantUML Studio, verificando correção, responsabilidades e regressões.
---

# Qualidade de código do PlantUML Studio

Leia [AGENTS.md](../../../AGENTS.md), [ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) e [DECISIONS.md](../../../docs/DECISIONS.md). Delimite a revisão ao escopo solicitado e às dependências diretamente afetadas.

Verifique TypeScript estrito, separação entre UI/aplicação/infraestrutura, contratos entre web e API e uso do motor oficial. Nas alterações de renderização, examine erros, respostas fora de ordem, limites operacionais e tratamento seguro de SVG conforme a arquitetura definida.

Prefira correções simples. Não introduza abstrações, dependências ou refatorações sem relação com a tarefa. Não altere testes para ocultar falhas.

Descubra os comandos reais nos pacotes existentes. Execute lint, checagem de tipos e testes relevantes para as mudanças. Não invente comandos ou declare sucesso de verificações não executadas. Em mudanças apenas documentais, verifique estrutura, referências e consistência; explique a ausência de checks de aplicação.

Em revisões, relate problemas concretos com impacto e localização, diferenciando falhas verificadas de riscos que ainda exigem confirmação. No resumo de implementação, indique arquivos alterados, resultados de verificação e pendências.

## Implementação e revisão
Antes de implementar, inspecione as convenções existentes nos arquivos e pacotes afetados. Preserve TypeScript estrito e responsabilidades claras, com funções pequenas e coesas, tratamento explícito de erros e lógica de negócio testável fora da UI e da infraestrutura.

Aplique SOLID quando adequado ao problema. Mantenha dependências mínimas e justificadas. Não introduza padrões arquiteturais ou abstrações sem necessidade demonstrada, nem refatore código sem relação com o pedido.

Não altere contratos de API silenciosamente: identifique consumidores afetados, explicite a mudança e mantenha contratos compartilhados e usos consistentes com o escopo autorizado.

Após implementar, execute checagem de tipos, lint e testes relevantes usando os comandos existentes; revise os arquivos alterados e reporte problemas não resolvidos. Diferencie verificações aprovadas, falhas e verificações bloqueadas ou indisponíveis.
