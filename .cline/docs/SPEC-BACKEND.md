# SPEC-BACKEND: Auditoria e Evolução do Backend

## 1. Entidades e Modelo de Dados

### 1.1 Nova Entidade: `RecipientEntity`
Representa o contato final que interage com o cliente.
- `id`: UUID (PK)
- `clientId`: UUID (FK para Client)
- `phone`: string (E.164 format)
- `name`: string (nullable)
- `createdAt`: timestamp
- `updatedAt`: timestamp

### 1.2 Atualização: `MessageEntity`
- Adição de `direction`: enum (`inbound`, `outbound`).
- Adição de `type`: enum (`text`, `media`).
- Relacionamento opcional com `RecipientEntity`.

### 1.3 Atualização: `ConversationEntity`
- Link formal com `RecipientEntity` em vez de apenas campos de texto.
- `unreadCount`: integer (contador de mensagens não lidas pelo cliente).

## 2. Novos Endpoints

### 2.1 Inbound Webhook
`POST /webhooks/inbound`
- **Objetivo**: Receber mensagens do provedor (Mock/Gateway).
- **Fluxo**:
  1. Identificar o cliente pelo Token/API Key.
  2. Localizar/Criar o `Recipient` pelo telefone de origem.
  3. Criar/Atualizar a `Conversation`.
  4. Salvar a `Message` com `direction = inbound`.
  5. Notificar o sistema (via Queue/Event).

### 2.2 Bulk Message (Refinamento)
`POST /messages/bulk`
- Garantir processamento assíncrono via BullMQ/Queue.
- Retornar um `bulkId` para acompanhamento do status da fila.

### 2.3 Polling de Saldo e Fila
`GET /clients/me/status`
- Retorna `{ balance, consumed, limit, queuedMessagesCount }`.

## 3. Fluxo de Fila
- As mensagens de entrada (`inbound`) devem entrar em uma fila de processamento para garantir que picos de tráfego não derrubem o webhook.
