# Big Chat Brasil (BCB) - Plataforma de Mensagens

## 1. Visão Geral do Projeto
O **Big Chat Brasil** é uma plataforma de chat e mensageria em tempo real de alto desempenho. A solução foi projetada para simular o ciclo completo de entrega de mensagens, oferecendo gestão robusta de saldo/créditos por tipo de cliente (pré-pago e pós-pago), priorização inteligente de envios (filas diferenciadas para mensagens urgentes e normais) e automação de conversação via Inteligência Artificial (**Google Gemini**).

## 2. Arquitetura & Tecnologias Utilizadas

O sistema utiliza uma arquitetura orientada a eventos (Event-Driven) com microsserviços desacoplados:

*   **Frontend**: Angular v22.x (Standalone Components, Signals, RxJS, Angular Material, SSE Client, Testes via Vitest + MSW).
*   **Backend**: NestJS (TypeScript, TypeORM, SSE/Server-Sent Events para atualizações em tempo real).
*   **Worker**: NestJS Microservice (Consumidor de filas RabbitMQ dedicado ao processamento de mensagens e simulação de ciclo de vida).
*   **AI-Agent**: Microsserviço NestJS integrando o Google GenAI SDK (`gemini-2.5-flash`, `gemini-2.0-flash`) para simulação de respostas de clientes.
*   **Banco de Dados & Cache**: PostgreSQL (Persistência relacional) e Redis (Cache de alta performance e controle de concorrência).
*   **Mensageria / Event Broker**: RabbitMQ (Gerenciamento de filas de processamento e distribuição de eventos).

### Diagrama de Arquitetura (C4 Simplificado)
```mermaid
graph TD
    FE["Frontend (Angular v22)"] <-->|REST e SSE| API["Backend API (NestJS)"]
    API <-->|SQL| DB[("PostgreSQL")]
    API <-->|Cache & Lock| RD[("Redis")]
    API -->|Queue (Normal/Urgent)| RMQ{"RabbitMQ"}
    RMQ --> WK["Worker Process"]
    WK <-->|SQL| DB
    WK -->|Dispatch Inbound| AI["AI-Agent (Gemini SDK)"]
    AI -->|Webhook Inbound| API
```

## 3. Pré-requisitos
Antes de começar, certifique-se de ter instalado em sua máquina:
*   **Docker Engine 20.10+** e **Docker Compose v2+**.
*   **Git**.

## 4. Guia Rápido de Execução (Passo a Passo)

Siga os comandos abaixo para clonar e subir a aplicação completa utilizando Docker Compose:

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/big-chat-brasil.git
cd big-chat-brasil

# 2. Criar arquivo de variáveis de ambiente
cp .env.example .env

# 3. Subir todos os containers
docker compose -f docker-compose.dev.yml up -d --build
```

## 5. Mapeamento de Serviços e Portas

Após a execução, os serviços estarão disponíveis nos seguintes endereços:

| Serviço | URL / Acesso | Credenciais (Padrão) |
| :--- | :--- | :--- |
| **Frontend Web** | [http://localhost:4200](http://localhost:4200) | - |
| **API Backend** | [http://localhost:3000](http://localhost:3000) | - |
| **Swagger UI (Docs API)** | [http://localhost:3000/api/docs](http://localhost:3000/api/docs) | - |
| **AI-Agent Service** | [http://localhost:3001](http://localhost:3001) | - |
| **Painel RabbitMQ** | [http://localhost:15672](http://localhost:15672) | `guest` / `guest` |
| **PostgreSQL** | `localhost:5432` | `bcb_user` / `bcb_password` |
| **Redis** | `localhost:6379` | - |

## 6. Configuração de Variáveis de Ambiente (`./backend/.env`)

O projeto utiliza o arquivo `.env` (apontado pelo Docker Compose para o backend e microsserviços) contendo chaves cruciais:
*   `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
*   `REDIS_HOST`, `REDIS_PORT`
*   `RABBITMQ_URI`
*   `GEMINI_API_KEY` (Chave de API do Google GenAI para o `ai-agent`)
*   `BACKEND_URL` (`http://backend:3000`)

## 7. Pipeline de CI/CD (GitHub Actions)
O workflow de CI (`.github/workflows/ci-tests.yml`) executa automaticamente em todo Pull Request e Push para a branch `main`:
1.  **Testes do Backend & Worker**: Executa Jest com validação de cobertura.
2.  **Testes do AI-Agent**: Executa Jest injetando chaves de teste para o SDK do Gemini.
3.  **Testes do Frontend**: Executa Vitest com MSW garantindo alta cobertura (+92%).

## 8. Documentação Detalhada (`./docs`)
Para informações técnicas aprofundadas, consulte:
*   [Inventário da Pasta Docs](./docs/README.md)
*   [Arquitetura e Fluxo de Dados](./docs/architecture.md)
*   [Documentação do AI-Agent](./docs/ai-agent.md)
*   [Documentação da API REST](./docs/reference/api-documentation.md)
*   [Guia de Telas e Reatividade Frontend](./docs/reference/frontend-screens-guide.md)

---
Desenvolvido como parte do desafio técnico Big Chat Brasil.

