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

## 🧪 Testes

Para rodar os testes do backend:
```bash
cd backend
npm run test
```

---
Desenvolvido por Cline AI.
