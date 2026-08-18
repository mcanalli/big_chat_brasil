# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [1.3.0-phase4] - 2026-08-17
### Adicionado
- Integração robusta com RabbitMQ (Exchange `bcb.messages.direct`).
- Filas de prioridade: `bcb.messages.urgent` e `bcb.messages.normal`.
- Worker `MessageConsumer` com lógica de priorização Anti-Starvation (3:1).
- Fluxo de ciclo de vida da mensagem: `queued -> processing -> sent -> delivered`.
- Endpoint `GET /queue/status` para monitoramento de filas.
- Orquestração completa via Docker Compose para desenvolvimento.
- Testes unitários para toda a camada de mensageria e worker.

### Alterado
- `MessageService` agora publica mensagens no broker após persistência.
- Docker Compose atualizado para incluir RabbitMQ com Management UI.
- Cobertura de testes unitários expandida para atingir metas de governança.


O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0-phase3] - 2026-08-17

### Adicionado
- Módulo de Mensageria (`MessageModule`) com `MessageService` e `ConversationService`.
- Controllers para `/messages` e `/conversations`.
- Validação de saldo pré-pago e limite pós-pago com HTTP 402.
- Lógica de "Get or Create" para conversas.
- Relatórios paginados com filtros de data, status e cliente.
- Histórico de auditoria de status para mensagens.
- Testes unitários abrangendo cenários financeiros e de fluxo.



## [1.1.0-phase2] - 2026-08-17

### Adicionado
- Módulo de Autenticação (`AuthModule`) com login administrativo.
- Módulo de Clientes (`ClientModule`) com gestão de saldo e planos.
- Módulo Administrativo (`AdminModule`) para controle financeiro.
- DTOs com validação (`class-validator`) e documentação Swagger (`@ApiProperty`).
- Documentação OpenAPI disponível em `/api/docs`.
- Testes unitários para `AuthService`, `ClientService` e `AdminService`.
- Guia de faturamento em `docs/api/financial-and-admin.md`.

## [1.0.0-phase1] - 2026-08-17

### Adicionado
- Camada de persistência com TypeORM e PostgreSQL.
- Entidades de domínio: `Client`, `Conversation`, `Message`, `MessageStatusHistory`, `FinancialTransaction`.
- Relacionamentos (Foreign Keys) e índices otimizados.
- Seeder inicial para popular o banco de dados com dados de teste.
- Testes unitários para entidades e seeder.
- Documentação de arquitetura com diagramas Mermaid.
- Arquivos de governança: `ROADMAP.md`, `CHANGELOG.md`, `PROMPTS.md`.
