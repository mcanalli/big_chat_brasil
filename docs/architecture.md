# Design Doc - Big Chat Brasil (BCB)

## 1. Visão Geral
A plataforma BCB gerencia mensagens priorizadas com validação financeira em tempo real. O uso de RabbitMQ garante o desacoplamento entre a submissão da mensagem e seu processamento (envio real), enquanto o Redis otimiza a verificação de saldo/limite.

## 2. ADRs (Architecture Decision Records)

### ADR-001: NestJS + Clean Architecture
*   **Contexto:** Necessidade de um backend robusto, tipado e escalável.
*   **Decisão:** Usar NestJS com separação em Domain, Application e Infrastructure.
*   **Consequência:** Facilita testes unitários e troca de provedores de infra (ex: TypeORM).

### ADR-002: RabbitMQ com Consumo Ponderado (Anti-Starvation)
*   **Contexto:** Mensagens urgentes devem ser priorizadas, mas mensagens normais não podem "morrer de fome" (starvation).
*   **Decisão:** Duas filas distintas. O Worker implementará um consumo proporcional (ex: a cada 3 urgentes, processa 1 normal).
*   **Consequência:** Garante o SLA das urgentes sem bloquear o fluxo normal indefinidamente.

### ADR-003: Validação de Saldo com Redis (Atomicidade)
*   **Contexto:** Evitar "double spending" em ambientes com múltiplas instâncias.
*   **Decisão:** O saldo será cacheado no Redis. Operações de débito usarão comandos atômicos (`DECRBY`) ou Lua Scripts para validar e debitar antes de enfileirar.
*   **Consequência:** Alta performance e consistência eventual garantida pela sincronização posterior com Postgres.

## 3. Diagramas Mermaid

### C4 Container
```mermaid
graph TD
    User((Usuário / Empresa))
    Angular[Angular App]
    NestJS[NestJS API]
    Postgres[(PostgreSQL)]
    Redis[(Redis Cache)]
    RabbitMQ[RabbitMQ]
    Worker[NestJS Message Worker]

    User -->|Acessa| Angular
    Angular -->|REST| NestJS
    NestJS -->|Persistência| Postgres
    NestJS -->|Validar Saldo| Redis
    NestJS -->|Publicar| RabbitMQ
    RabbitMQ -->|Consumir| Worker
    Worker -->|Update Status| Postgres
    Worker -->|Notify| Angular
```

### Fluxo de Envio de Mensagem (Sequência)
```mermaid
sequenceDiagram
    participant C as Client (Angular)
    participant A as API (NestJS)
    participant R as Redis
    participant Q as RabbitMQ
    participant W as Worker
    participant P as Postgres

    C->>A: POST /messages (content, urgency)
    A->>R: Check & Decr Balance (Atômico)
    alt Saldo Insuficiente
        A-->>C: 402 Payment Required
    else Saldo OK
        A->>P: Create Message (status: queued)
        A->>Q: Publish Message
        A-->>C: 202 Accepted
    end

    Q->>W: Consume Message
    W->>W: Simulate Delivery
    W->>P: Update Message (status: sent)
    W->>R: Sync Persistent Balance (se necessário)
```

### Diagrama ER
```mermaid
erDiagram
    CLIENT ||--o{ CONVERSATION : has
    CLIENT ||--o{ MESSAGE : owns
    CONVERSATION ||--o{ MESSAGE : contains

    CLIENT {
        uuid id
        string identifier
        enum type
        decimal balance
        decimal limit
    }

    MESSAGE {
        uuid id
        uuid conversation_id
        uuid client_id
        string content
        enum urgency
        enum status
        decimal cost
        timestamp created_at
    }
```
