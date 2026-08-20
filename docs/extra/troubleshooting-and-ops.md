# Guia de Operação e Resolução de Problemas (Troubleshooting)

Este guia auxilia a equipe de operações e desenvolvedores na manutenção do sistema Big Chat Brasil.

## 1. Problemas Comuns e Soluções

### Mensagens presas com status `queued`
*   **Causa**: O Worker pode estar fora do ar ou a fila no RabbitMQ está congestionada.
*   **Solução**:
    1.  Verifique se o container `bcb-worker-dev` está rodando: `docker ps`.
    2.  Acesse o dashboard do RabbitMQ (`localhost:15672`) e verifique se há mensagens acumuladas nas filas `bcb.messages.normal` ou `urgent`.
    3.  Reinicie o worker: `docker restart bcb-worker-dev`.

### Erros de "Saldo Insuficiente" indevidos
*   **Causa**: Dessincronia de cache no Redis ou transações presas.
*   **Solução**: Limpe o cache de preços no Redis: `redis-cli FLUSHALL`. Verifique os logs do backend para erros de deadlock no PostgreSQL.

### SSE não atualiza no Frontend
*   **Causa**: Problemas de proxy/firewall que fecham conexões HTTP long-lived ou falha no serviço de RealTime.
*   **Solução**:
    1.  Verifique se o endpoint `/api/real-time/status-updates` responde no navegador.
    2.  Verifique se o RabbitMQ está entregando os eventos `message.status.updated` para a API.

---

## 2. Operações de Manutenção

### Reprocessamento de Mensagens (DLQ)
Mensagens que excedem 3 retentativas no Worker são marcadas como `failed`. No ambiente de produção, recomenda-se configurar uma **Dead Letter Exchange (DLX)** no RabbitMQ para capturar essas mensagens antes de movê-las para `failed`.

### Limpeza de Dados Antigos
O histórico de mensagens e status (`message_status_history`) pode crescer rapidamente. Recomenda-se uma política de expurgo ou arquivamento para dados com mais de 90 dias.

### Atualização de Preços
Para atualizar um preço sem reiniciar o sistema:
1.  Atualize o valor na tabela `message_pricings`.
2.  O cache no Redis expirará automaticamente (ou pode ser limpo manualmente) e o sistema passará a usar o novo valor.

---

## 3. Comandos Úteis de Diagnóstico

*   **Logs do Backend**: `docker logs -f bcb-backend-dev`
*   **Logs do Worker**: `docker logs -f bcb-worker-dev`
*   **Saúde dos Serviços**: `docker-compose -f docker-compose.dev.yml ps`
