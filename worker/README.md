# Worker Service - Big Chat Brasil

## Visão Geral

O **Worker** é um microsserviço dedicado em **NestJS** que atua como consumidor assíduo das filas do **RabbitMQ**. Sua principal responsabilidade é retirar mensagens das filas (`bcb.messages.normal` e `bcb.messages.urgent`), processar o envio simulado para operadoras/gateways de SMS e WhatsApp, e avançar o ciclo de vida da mensagem.

---

## Filas e Estratégias de Processamento (*Bulk* & Prioridade)

1.  **Fila de Alta Prioridade (`bcb.messages.urgent`)**: Processadas com preferência de atendimento para garantir SLA rigoroso em mensagens críticas.
2.  **Fila Convencional (`bcb.messages.normal`)**: Processadas em paralelo com priorização proporcional anti-starvation.
3.  **Filas de Envio em Lote (*Bulk*)**: O worker suporta o consumo assíncrono de lotes de mensagens provenientes de campanhas, garantindo distribuição controlada e resiliência a picos de tráfego.

---

## Estratégias de Re-tentativa (*Retry*) e Confiabilidade

*   **ACK/NACK Manual**: As mensagens só recebem confirmação de entrega (`ACK`) no RabbitMQ após a persistência bem-sucedida do estado no PostgreSQL.
*   **Backoff Exponencial**: Em caso de falhas transitórias de conexão com o banco ou provedores, o worker aplica lógica de re-tentativa com intervalo progressivo antes de mover a mensagem para o estado `failed`.

---

## Comandos de Execução e Teste

```bash
# Execução via Docker Compose (recomendado)
docker compose -f docker-compose.dev.yml up -d --build worker

# Execução local
cd backend
npm run start:dev:worker
```
