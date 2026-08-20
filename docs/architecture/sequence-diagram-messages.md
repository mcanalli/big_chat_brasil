# Diagrama de Sequência de Mensagens

Este diagrama detalha o ciclo de vida completo de uma mensagem, incluindo o tratamento de prioridades e a comunicação assíncrona.

```mermaid
sequenceDiagram
    participant U as Usuário (Frontend)
    participant A as API (NestJS)
    participant R as Redis
    participant P as PostgreSQL
    participant Q as RabbitMQ
    participant W as Worker
    participant S as SSE (Real-time Stream)

    U->>A: POST /api/messages (content, priority, etc.)
    activate A
    A->>P: Inicia Transação SQL
    A->>P: SELECT Client (Pessimistic Lock)
    A->>R: Get Pricing (Cache)
    A->>P: Valida Saldo/Consumo
    A->>P: INSERT Message (status: 'queued')
    A->>P: UPDATE Client Balance/Consumed
    A->>P: Commit Transação
    A->>Q: Emit 'bcb.messages.[priority]'
    deactivate A
    A-->>U: 201 Created (Message ID)

    Note over Q,W: Processamento Assíncrono

    Q->>W: Consume Message
    activate W
    W->>P: UPDATE Message (status: 'processing')
    W->>Q: Emit 'message.status.updated' (processing)
    Q-->>A: Listen Event
    A-->>S: Push Event to Client
    S-->>U: Update UI (Status: Processing)
    
    W->>W: Simula Chamada Provedor (1s)
    
    W->>P: UPDATE Message (status: 'sent')
    W->>Q: Emit 'message.status.updated' (sent)
    Q-->>A: Listen Event
    A-->>S: Push Event to Client
    S-->>U: Update UI (Status: Sent)
    deactivate W

    Note over W: Ciclo de Vida Simulado (SimulatorService)
    
    loop Ciclo de Status
        W->>P: UPDATE Message (delivered / read)
        W->>Q: Emit 'message.status.updated'
        Q-->>A: Listen Event
        A-->>S: Push Event to Client
        S-->>U: Update UI (Status Change)
    end
```

### Destaques do Processo

*   **Priorização**: Mensagens marcadas como `urgente` são enviadas para a routing key `bcb.messages.urgent`, enquanto mensagens padrão vão para `bcb.messages.normal`. O Worker está configurado para observar ambos os padrões, permitindo que a infraestrutura do RabbitMQ gerencie a distribuição.
*   **Anti-Starvation**: O Worker monitora o tempo de espera das mensagens na fila `normal`. Se uma mensagem exceder 30 segundos, o sistema registra um aviso (log) para intervenção ou ajuste de escala.
*   **Concorrência**: O uso de `pessimistic_write` no banco de dados durante o débito de saldo garante que múltiplos envios simultâneos do mesmo cliente não resultem em saldo negativo.
*   **Persistência**: Todas as mudanças de estado são registradas na tabela `message_status_history` para fins de auditoria e rastreabilidade.
