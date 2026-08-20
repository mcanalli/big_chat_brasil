# Esquema do Banco de Dados (ERD & Dicionário)

O Big Chat Brasil utiliza o PostgreSQL como banco de dados relacional principal. Abaixo está a descrição das tabelas e o diagrama de relacionamento.

## 1. Diagrama ERD

```mermaid
erDiagram
    CLIENTS ||--o{ MESSAGES : "envia"
    CLIENTS ||--o{ CONVERSATIONS : "possui"
    CLIENTS ||--o{ RECIPIENTS : "cadastra"
    CLIENTS ||--o{ FINANCIAL_TRANSACTIONS : "gera"
    CONVERSATIONS ||--o{ MESSAGES : "agrupa"
    MESSAGES ||--o{ MESSAGE_STATUS_HISTORY : "registra"
    RECIPIENTS ||--o{ CONVERSATIONS : "participa"

    CLIENTS {
        uuid id PK
        string name
        string documentId
        enum documentType
        enum planType
        decimal balance
        decimal limit
        decimal consumed
        boolean active
        timestamp createdAt
    }

    MESSAGES {
        uuid id PK
        uuid conversationId FK
        uuid senderId FK
        string recipientPhone
        enum channel
        enum direction
        enum type
        text content
        enum status
        enum priority
        decimal cost
        timestamp timestamp
        timestamp updatedAt
    }

    CONVERSATIONS {
        uuid id PK
        uuid clientId FK
        uuid recipientId FK
        string recipientPhone
        string recipientName
        text lastMessageContent
        timestamp lastMessageTime
        integer unreadCount
    }

    MESSAGE_STATUS_HISTORY {
        uuid id PK
        uuid messageId FK
        enum status
        text details
        timestamp timestamp
    }

    MESSAGE_PRICINGS {
        uuid id PK
        string channel
        string priority
        decimal cost
    }
```

## 2. Dicionário de Dados

### Tabela `clients`
Armazena os dados dos clientes da plataforma (empresas ou pessoas físicas).
*   `id`: Identificador único UUID.
*   `planType`: Define se o cliente é **pré-pago** (usa `balance`) ou **pós-pago** (usa `limit`/`consumed`).
*   `documentId`: CPF ou CNPJ único.

### Tabela `messages`
Registro principal de cada disparo de mensagem efetuado.
*   `status`: Reflete o estado atual (`queued`, `processing`, `sent`, `delivered`, `read`, `failed`).
*   `cost`: O valor debitado do cliente no momento do envio.

### Tabela `message_status_history`
Auditoria completa de cada transição de status de uma mensagem. Permite rastrear exatamente quando uma mensagem foi entregue ou lida.

### Tabela `message_pricings`
Tabela de configuração de custos.
*   `channel`: Tipo de canal (ex: WHATSAPP, SMS).
*   `priority`: Nível de prioridade (ex: normal, urgente).
*   `cost`: Valor em reais por mensagem.

### Tabela `conversations`
Agrupamento lógico de mensagens para exibição no formato de chat (threads).
