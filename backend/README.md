# Backend API - Big Chat Brasil

## Visão Geral

O **Backend** do Big Chat Brasil é construído em **NestJS (v11)** utilizando TypeORM para persistência em PostgreSQL, Redis para cache/locks e RabbitMQ para mensageria assíncrona. Ele expõe a API RESTful principal para o Frontend Angular e gerencia o controle financeiro, saldos e conversas.

---

## Rotas REST Principais

### Autenticação (`/api/auth`)
*   `POST /api/auth/login`: Autenticação de usuário/cliente e emissão de token JWT.

### Mensagens (`/api/messages`)
*   `POST /api/messages`: Envio de nova mensagem (valida saldo/crédito, debita de forma atômica, persiste com status `queued` e publica no RabbitMQ).
*   `POST /api/messages/bulk`: Envio em lote (*bulk*) de mensagens.
*   `POST /api/messages/inbound`: Endpoint webhook que recebe respostas de clientes (processadas pelo `ai-agent`).
*   `GET /api/messages`: Lista de mensagens.

### Conversas (`/api/conversations`)
*   `GET /api/conversations`: Lista todas as conversas ativas do cliente.
*   `POST /api/conversations`: Inicia ou obtém uma conversa com um destinatário.

### Gestão de Clientes e Saldo (`/api/clients`)
*   `GET /api/clients/:id/balance`: Consulta o saldo atual e limite de crédito do cliente.
*   `POST /api/clients/:id/balance`: Adiciona créditos ou gerencia saldo (pré-pago / pós-pago).

---

## Modelo de Dados e Controle de Saldos

*   **Tipos de Cliente**: `PREPAID` (Pré-pago, exige saldo positivo) e `POSTPAID` (Pós-pago, utiliza limite de crédito).
*   **Transações Financeiras**: Cada envio de mensagem gera uma transação financeira atômica (`financial_transactions`) rastreando o custo por canal e prioridade (`message_pricings`).
*   **Concorrência**: Uso de locks pessimistas (`pessimistic_write`) no PostgreSQL e Redis para evitar *double-spending* em envios simultâneos.

---

## Comandos de Execução e Teste

```bash
# Instalação de dependências
npm install

# Desenvolvimento (watch mode)
npm run start:dev

# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura de testes
npm run test:cov
```
