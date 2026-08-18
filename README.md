# Big Chat Brasil (BCB) - Plataforma de Mensagens

Este repositório contém a solução completa para o desafio **Big Chat Brasil**, desenvolvida com **NestJS**, **Angular**, **PostgreSQL**, **Redis** e **RabbitMQ**.

## 🚀 Como Rodar

A aplicação está totalmente containerizada. Para subir o ambiente completo:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Portas Úteis:
- **Frontend:** [http://localhost:4200](http://localhost:4200)
- **Backend API:** [http://localhost:3000](http://localhost:3000)
- **RabbitMQ Management:** [http://localhost:15672](http://localhost:15672) (guest/guest)
- **PostgreSQL:** localhost:5432

## 🛠 Arquitetura e Decisões Técnicas

1.  **Spec-Driven Development (SDD):** Toda a API e o comportamento das filas foram definidos primeiro no arquivo `/openspec/specification.yaml`.
2.  **Validação Financeira Atômica:** O sistema valida o saldo antes de aceitar a mensagem. Em produção, recomenda-se o uso do script Lua no Redis para garantir atomicidade.
3.  **Priorização de Filas:** Implementamos o suporte a filas `urgent` e `normal` no RabbitMQ, garantindo que mensagens urgentes tenham precedência no processamento.
4.  **Resiliência:** Uso de Dead Letter Queues (DLQ) para mensagens que falham após X tentativas.

## 📁 Estrutura do Projeto

- `/backend`: API NestJS (TypeScript).
- `/frontend`: App Angular com Bootstrap.
- `/openspec`: Especificações formais.
- `/infra`: Arquivos de configuração de infraestrutura (Docker).
### Cenários de Teste (Fase 3)

| Cenário | Entrada (Payload) | Resposta Esperada |
| :--- | :--- | :--- |
| **Saldo Insuficiente** | `{ "senderId": "uuid", "channel": "SMS", ... }` | `402 Payment Required` |
| **Limite Excedido** | `{ "senderId": "uuid", "channel": "WHATSAPP", ... }` | `402 Payment Required` |
| **Envio com Sucesso** | `{ "senderId": "uuid", "channel": "SMS", "content": "Olá" }` | `201 Created` |
| **Get or Create Conv** | Chamada ao `sendMessage` com novo número | Cria nova conversa se não existir |

#### Exemplo de Payload (POST /messages)
```json
{
  "senderId": "d3b07384-d990-4495-a1a8-7469db8d7010",

## 🚀 Execução via Docker (Recomendado)

Para subir todo o ecossistema (App, PostgreSQL, RabbitMQ, Redis e Frontend):

```bash
docker-compose -f docker-compose.dev.yml up --build
```

O backend estará disponível em `http://localhost:3000` e o RabbitMQ Management em `http://localhost:15672`.

## 🛠️ Mensageria e Priorização

O sistema utiliza RabbitMQ para processamento assíncrono com as seguintes características:
- **Exchange**: `bcb.messages.direct`
- **Filas**: 
  - `bcb.messages.urgent` (Prioridade 10)
  - `bcb.messages.normal` (Prioridade 5)
- **Worker**: Implementa lógica Anti-Starvation (3 urgentes para 1 normal).

  "recipientPhone": "5511999999999",
  "recipientName": "João Silva",
  "content": "Sua fatura vence amanhã!",
  "channel": "WHATSAPP",
  "priority": "urgent"
}
```


## 🧪 Testes

Para rodar os testes do backend:
```bash
cd backend
npm run test
```

---
Desenvolvido por Cline AI.
