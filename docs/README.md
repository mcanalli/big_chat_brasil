# Documentação e Governança do Projeto Big Chat Brasil

Este diretório (`./docs`) abriga toda a documentação técnica, arquitetural, especificações de API e guias operacionais do ecossistema **Big Chat Brasil (BCB)**.

---

## Índice de Documentação

### 1. Arquitetura e Diagramas
*   [Arquitetura Geral (ADRs e C4)](./architecture.md): Visão de contêineres e decisões arquiteturais (ADR-001 a ADR-003).
*   [Diagrama de C4 e Fluxo Integrado](./architecture/c4-integrated-flow.md): Fluxo de dados ponta a ponta desde o Frontend até o Worker e SSE.
*   [Diagrama de Sequência de Mensagens](./architecture/sequence-diagram-messages.md): Ciclo de vida detalhado da mensagem (`queued` -> `processing` -> `sent` -> `delivered` -> `read`).
*   [Modelo de Domínio e ER](./architecture/domain-model.md): Entidades relacionais (Clients, Messages, Conversations, Financial Transactions, Pricing).

### 2. Especificações Técnicas e Design Docs
*   [Especificação Técnica Detalhada](./technical-spec.md): Stack tecnológica, versões (NestJS v11, Angular v22, PostgreSQL, Redis, RabbitMQ) e design patterns.
*   [Design Doc - Backend](./design-docs/backend-design-doc.md): Detalhamento do NestJS, TypeORM, filas e concorrência financeira.
*   [Design Doc - Frontend](./design-docs/frontend-design-doc.md): Arquitetura Angular Standalone + Signals, SSE e gerenciamento de estado.

### 3. Microsserviço de Inteligência Artificial
*   [Documentação do AI-Agent (`ai-agent.md`)](./ai-agent.md): Detalhes da integração com o Google Gemini (`gemini-2.5-flash`, `gemini-2.0-flash`), fallbacks e webhooks *inbound*.

### 4. APIs e Guias de Referência
*   [Documentação da API REST](./reference/api-documentation.md): Rotas de Autenticação, Mensagens, Conversas, Clientes e Saldo.
*   [Financeiro e Admin](./api/financial-and-admin.md): Gestão de créditos e transações financeiras.
*   [Guia de Telas do Frontend](./reference/frontend-screens-guide.md): Visão funcional das telas e componentes Angular Material.

### 5. Operações, Banco de Dados e Qualidade
*   [Esquema de Banco de Dados](./extra/database-schema.md): Estrutura de tabelas e índices.
*   [Troubleshooting e Operações](./extra/troubleshooting-and-ops.md): Guia de diagnóstico de containers Docker, filas RabbitMQ e erros de saldo.
*   [Contribuição e Padrões de Código](./extra/contributing-and-standards.md): Convenções e fluxos de commit.
