# Modelo de Domínio

Este documento descreve o modelo de domínio e a estrutura de persistência da plataforma Big Chat Brasil (BCB).

## Diagrama ER (Mermaid)

```mermaid
erDiagram
    CLIENT ||--o{ CONVERSATION : "possui"
    CLIENT ||--o{ FINANCIAL_TRANSACTION : "realiza"
    CLIENT ||--o{ MESSAGE : "envia"
    CONVERSATION ||--o{ MESSAGE : "agrupa"
    MESSAGE ||--o{ MESSAGE_STATUS_HISTORY : "possui"

    CLIENT {
        uuid id PK
        string name
        string documentId UK
        enum documentType
        enum planType
        decimal balance
        decimal limit
        decimal consumed
        boolean active
        timestamp createdAt
    }

    CONVERSATION {
        uuid id PK
        uuid clientId FK
        string recipientPhone
        string recipientName
        text lastMessageContent
        timestamp lastMessageTime
        integer unreadCount
        timestamp updatedAt
    }

    MESSAGE {
        uuid id PK
        uuid conversationId FK
        uuid senderId FK
        string recipientPhone
        enum channel
        text content
        timestamp timestamp
        enum priority
        enum status
        decimal cost
    }

    MESSAGE_STATUS_HISTORY {
        uuid id PK
        uuid messageId FK
        enum status
        timestamp timestamp
        text details
    }

    FINANCIAL_TRANSACTION {
        uuid id PK
        uuid clientId FK
        enum type
        decimal amount
        decimal previousBalance
        decimal newBalance
        text description
        timestamp timestamp
    }
```

## Descrição Técnica das Tabelas

### 1. Clients (`clients`)
Armazena os dados cadastrais e de faturamento dos clientes.
- **FKs:** Nenhuma.
- **Índices:** `documentId` (Unique).

### 2. Conversations (`conversations`)
Agrupa as mensagens trocadas entre um cliente e um destinatário final.
- **FKs:** 
    - `clientId` -> `clients(id)` (ON DELETE CASCADE).

### 3. Messages (`messages`)
Registro individual de cada mensagem enviada.
- **FKs:**
    - `conversationId` -> `conversations(id)` (ON DELETE CASCADE).
    - `senderId` -> `clients(id)` (ON DELETE RESTRICT).

### 4. Message Status History (`message_status_history`)
Auditoria de todas as mudanças de estado de uma mensagem (queued, sent, delivered, etc).
- **FKs:**
    - `messageId` -> `messages(id)` (ON DELETE CASCADE).

### 5. Financial Transactions (`financial_transactions`)
Histórico de movimentações financeiras para controle de saldo e consumo.
- **FKs:**
    - `clientId` -> `clients(id)` (ON DELETE RESTRICT).
