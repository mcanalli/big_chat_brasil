# Diagrama C4 (Nível 3 - Componentes)

Este diagrama detalha a arquitetura interna do sistema Big Chat Brasil, destacando os componentes do Backend (NestJS), Frontend (Angular), Worker e suas interações com serviços de infraestrutura.

```mermaid
graph TB
    subgraph Frontend_Angular [Frontend Angular]
        UI[Interface do Usuário - Material UI]
        RealTimeService_FE[RealTimeService - SSE Client]
        ChatService[ChatService - API Client]
    end

    subgraph Backend_NestJS [Backend NestJS - API]
        Controller[Controllers - REST]
        MessageService[MessageService - Business Logic]
        RTController[RealTimeController - SSE Server]
        QueueService[QueueService - RabbitMQ Producer]
        TypeORM_API[TypeORM - Persistência]
    end

    subgraph Backend_NestJS_Worker [Backend NestJS - Worker]
        Consumer[MessageConsumer - RabbitMQ Consumer]
        Simulator[MessageSimulatorService - Lifecycle]
        TypeORM_Worker[TypeORM - Persistência]
        QueueService_Worker[QueueService - Status Producer]
    end

    subgraph Infrastructure [Infraestrutura]
        PostgreSQL[(PostgreSQL - DB)]
        Redis[(Redis - Cache/Locks)]
        RabbitMQ{RabbitMQ - Message Broker}
    end

    %% Relacionamentos
    UI --> ChatService
    UI --> RealTimeService_FE
    ChatService --> Controller
    RealTimeService_FE <.. RTController : "SSE (Status Updates)"
    
    Controller --> MessageService
    MessageService --> QueueService
    MessageService --> TypeORM_API
    MessageService --> Redis : "Check Balance/Locks"
    
    QueueService --> RabbitMQ : "Publish (Normal/Urgent)"
    RabbitMQ --> Consumer : "Consume"
    
    Consumer --> TypeORM_Worker
    Simulator --> TypeORM_Worker
    Simulator --> QueueService_Worker
    QueueService_Worker --> RabbitMQ : "Publish (Status Update)"
    RabbitMQ ..> RTController : "Listen (Status Updates)"
    
    TypeORM_API --> PostgreSQL
    TypeORM_Worker --> PostgreSQL
```

### Descrição dos Componentes

1.  **Frontend Angular**: Interface reativa utilizando Material UI. Consome a API REST para envio de mensagens e gerencia um stream SSE para atualizações em tempo real.
2.  **Backend NestJS (API)**: Porta de entrada do sistema. Gerencia autenticação, regras de negócio, persistência inicial e delega o processamento pesado para as filas.
3.  **Backend NestJS (Worker)**: Processo isolado que consome as filas do RabbitMQ, realiza o processamento das mensagens e simula o ciclo de vida (entregue/lido).
4.  **PostgreSQL**: Base de dados relacional para persistência de mensagens, clientes, transações e histórico.
5.  **Redis**: Utilizado para caching (ex: tabelas de preços) e controle de concorrência/bloqueios.
6.  **RabbitMQ**: Broker de mensagens que garante o desacoplamento entre a API e o Worker, além de gerenciar a priorização de mensagens.
