# Especificação Técnica Detalhada

Este documento consolida os detalhes técnicos da stack tecnológica e padrões de projeto utilizados no Big Chat Brasil.

## 1. Stack Tecnológica e Versões

### Backend
*   **Framework**: NestJS v11.x.
*   **Linguagem**: TypeScript v5.x.
*   **ORM**: TypeORM v0.3.x.
*   **Microserviços**: NestJS Microservices (RabbitMQ Transport).
*   **Documentação**: Swagger/OpenAPI.

### Frontend
*   **Framework**: Angular v22.x (Standalone Components & Signals).
*   **UI Library**: Angular Material v22.x.
*   **Reatividade**: RxJS v7.8.
*   **Estilos**: SCSS.

### Infraestrutura & Serviços
*   **Database**: PostgreSQL 15 (Relacional).
*   **Cache/Lock**: Redis 7 (In-memory).
*   **Message Broker**: RabbitMQ 3.12 (AMQP).
*   **Containerização**: Docker e Docker Compose.

---

## 2. Design Patterns Utilizados

*   **Repository Pattern**: Isolamento da lógica de acesso a dados (TypeORM Repositories).
*   **Dependency Injection**: Gerenciamento de dependências nativo do NestJS e Angular.
*   **Event-Driven Architecture**: Comunicação assíncrona entre API e Worker via RabbitMQ.
*   **Pub/Sub**: Distribuição de atualizações de status de mensagens.
*   **Observer Pattern**: Utilizado via RxJS e SSE para atualizações reativas no frontend.
*   **Pessimistic Locking**: Controle de concorrência no banco de dados para operações financeiras.
*   **Factory Pattern**: Utilizado na criação de instâncias de microserviços e conexões.

---

## 3. Estrutura de Infraestrutura

### PostgreSQL (Esquema Principal)
*   `clients`: Dados cadastrais e controle financeiro.
*   `messages`: Registro principal de mensagens enviadas/recebidas.
*   `message_status_history`: Auditoria de cada mudança de estado.
*   `conversations`: Agrupamento de mensagens por contato.
*   `message_pricings`: Tabela de custos por canal e prioridade.

### Redis
*   **Estratégia de Cache**: TTL (Time-To-Live) curto para preços, garantindo que mudanças na tabela de preços sejam refletidas rapidamente sem sobrecarregar o DB.
*   **Atomicidade**: Uso de comandos atômicos do Redis para contadores e locks rápidos.

### RabbitMQ
*   **Exchanges**: `amq.topic` (ou padrão do NestJS).
*   **Filas**:
    *   `bcb.messages.normal`: Mensagens de baixa prioridade.
    *   `bcb.messages.urgent`: Mensagens de alta prioridade.
    *   `message.status.updated`: Fila de retorno para eventos de status.
*   **Configurações**: Filas duráveis e mensagens persistentes para evitar perda de dados.

### Worker
*   **Consumo Concorrente**: Configurado para processar múltiplas mensagens simultaneamente, respeitando os limites do sistema.
*   **Anti-Starvation**: Lógica implementada para garantir que mensagens na fila normal não fiquem presas indefinidamente atrás de picos de mensagens urgentes.
