# Roadmap - Big Chat Brasil (BCB)

Este roadmap descreve as fases de desenvolvimento da plataforma de mensageria omnicanal.

## Fase 1: Persistência & Domínio [CONCLUÍDA]
- [x] Definição das entidades TypeORM (Client, Conversation, Message, etc).
- [x] Configuração de relacionamentos e chaves estrangeiras.
- [x] Implementação de JSDoc para documentação técnica.
- [x] Criação de Seeder inicial para ambiente de desenvolvimento.
- [x] Testes unitários da camada de domínio.

## Fase 2: Autenticação & Gestão Financeira [CONCLUÍDA]
- [x] Implementação de autenticação administrativa (Mock Auth).
- [x] Módulo de gestão de clientes (CRUD completo).
- [x] Módulo administrativo financeiro (Créditos, Limites, Conversão de Plano).
- [x] Documentação OpenAPI/Swagger integrada.
- [x] Testes unitários para Services (Auth, Client, Admin).
- [x] Documentação detalhada de regras financeiras.

## Fase 3: Mensageria & Regras de Negócio [CONCLUÍDA]
- [x] Service de envio de mensagens (WhatsApp/SMS).
- [x] Orquestração de conversas e threads (Get or Create).
- [x] Validação financeira rigorosa (Saldo/Limite).
- [x] Relatórios de mensagens e auditoria de status.
- [x] Testes unitários de mensagens e conversas.

## Fase 4: RabbitMQ & Priorização [CONCLUÍDA]
- [x] Integração com RabbitMQ para filas de processamento.
- [x] Lógica de priorização de mensagens (urgent vs normal) - Anti-Starvation (3:1).
- [x] Worker de ciclo de vida completo e histórico de status.
- [x] Orquestração Docker completa (Postgres, Redis, RabbitMQ).
- [x] Testes unitários com cobertura global expandida.
- [x] Finalização dos arquivos de governança.


