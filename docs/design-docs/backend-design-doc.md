# Design Doc - Backend (NestJS)

Este documento descreve as decisões de design e a arquitetura técnica do backend do Big Chat Brasil.

## 1. Arquitetura em Camadas

O sistema segue uma estrutura inspirada em Clean Architecture e Domain-Driven Design (DDD), organizada em:

*   **Domain**: Contém as entidades de negócio (`entities/`), enums e interfaces. É o núcleo do sistema, independente de frameworks externos.
*   **Application**: Contém os serviços (`services/`) que implementam os casos de uso. Orquestra a lógica de negócio, interações com repositórios e serviços de infraestrutura.
*   **Infrastructure**: Implementações técnicas de detalhes externos:
    *   **Database**: Repositórios TypeORM, Migrations e Seeders.
    *   **Queue**: Integração com RabbitMQ (Producers e Consumers).
    *   **Cache**: Gerenciamento de cache e locks via Redis.
    *   **RealTime**: Implementação de SSE (Server-Sent Events).
*   **Presentation**: Porta de entrada da aplicação, contendo os Controllers REST e DTOs (Data Transfer Objects) para validação de entrada.

## 2. Estratégia de Mensageria (RabbitMQ & Workers)

O sistema utiliza um modelo baseado em eventos para o processamento de mensagens em massa:

*   **Produtor (API)**: Ao receber um pedido de envio, a API valida os pré-requisitos e coloca a mensagem em uma fila.
*   **Consumidor (Worker)**: Um processo separado consome as mensagens. Isso permite que a API responda rapidamente ao usuário enquanto o trabalho pesado ocorre em background.
*   **Priorização**: Utilização de diferentes tópicos/filas para separar mensagens urgentes de normais, permitindo escalonamento diferenciado.
*   **Resiliência**: Implementação de confirmação manual (Ack), lógica de retentativa (3 tentativas) e suporte a Dead Letter Queues (DLQ) para mensagens que falham persistentemente.

## 3. Comunicação em Tempo Real (SSE)

Em vez de WebSockets tradicionais, optou-se por **Server-Sent Events (SSE)** para o status das mensagens:

*   **Eficiência**: SSE é mais leve que WebSockets para fluxos unidirecionais (servidor -> cliente).
*   **Integração com Filas**: O `RealTimeController` atua como uma ponte, escutando uma fila de "atualização de status" no RabbitMQ e empurrando esses eventos para o stream SSE aberto pelos clientes.

## 4. Persistência e Consistência

*   **Database**: PostgreSQL 15.
*   **TypeORM**: Utilizado como ORM.
*   **Locks Pessimistas**: Em operações críticas como débito de saldo em contas pré-pago, utiliza-se `pessimistic_write` para garantir consistência em ambientes de alta concorrência.
*   **Transacionalidade**: O uso de `QueryRunner` garante que a criação da mensagem e o débito do saldo ocorram de forma atômica.

## 5. Estratégia de Cache (Redis)

O Redis é utilizado para:
1.  **Cache de Preços**: Evitar consultas constantes ao banco para obter o custo de cada canal/prioridade.
2.  **Locking Distribuído**: (Planejado/Estruturado) para garantir que processos de worker não processem a mesma mensagem simultaneamente.
