# Registro de Prompts (PROMPTS.md)

### Prompt Final - Fase 4 (Mensageria e Governança)
**Objetivo:** Implementar a integração com RabbitMQ, priorização anti-starvation (3:1), Worker de atualização do ciclo de vida, testes unitários, orquestração Docker e finalização dos arquivos de governança.
**Executado em:** 2026-08-17
**Resultado:** Sistema 100% funcional com mensageria assíncrona, priorização por importância de cliente/mensagem, orquestração Docker simplificada e documentação de projeto completa.
---


Este arquivo documenta a evolução do projeto através dos prompts utilizados.

## Fase 1: Persistência e Domínio

### Prompt 1.0: Inicialização do Projeto
> "Atue como Desenvolvedor Backend Sênior especialista em NestJS e TypeORM. Crie a estrutura de entidades para a Big Chat Brasil seguindo os requisitos: Clients, Conversations, Messages, MessageStatusHistory e FinancialTransactions. Use UUIDs, Enums para tipos e garanta os relacionamentos FK corretos."

### Prompt 1.1: Seeder e Ajustes de Domínio
> "Crie um seeder inicial para popular as tabelas criadas no passo anterior, incluindo pelo menos dois tipos de clientes (pré e pós-pago) e um fluxo de mensagem inicial com histórico e transação financeira."

### Prompt 1.2: Testes e Governança (Fase Atual)
> "Atue como Desenvolvedor Backend Sênior especialista em Jest, NestJS e TypeORM. Objetivo: Adicionar testes unitários para a camada de persistência criada na Fase 1, criar a documentação de arquitetura e inicializar os arquivos de governança: ROADMAP.md, CHANGELOG.md e PROMPTS.md."

### Prompt 2.0: Autenticação, Clientes e Admin Financeiro (Fase 2)
> "Atue como Desenvolvedor Backend Sênior especialista em NestJS, Swagger e Jest. Objetivo: Implementar Autenticação, Gestão de Clientes e Módulo Administrativo Financeiro com Swagger, Testes Unitários e atualização contínua do ROADMAP.md, CHANGELOG.md e PROMPTS.md."

