# Documentação da API (REST & SSE)

Esta seção detalha os endpoints disponíveis na API NestJS do Big Chat Brasil.

## 1. Autenticação (Auth)

### Login
*   **URL**: `POST /api/auth`
*   **Descrição**: Realiza o login do cliente através do documento (CPF/CNPJ).
*   **Payload**:
    ```json
    { "document": "string" }
    ```
*   **Respostas**:
    *   `200 OK`: Retorna os dados do cliente e token (se implementado).
    *   `404 Not Found`: Cliente não encontrado.

---

## 2. Mensagens (Messages)

### Enviar Mensagem
*   **URL**: `POST /api/messages`
*   **Descrição**: Envia uma mensagem individual.
*   **Payload**:
    ```json
    {
      "senderId": "uuid",
      "recipientPhone": "string",
      "content": "string",
      "priority": "normal" | "urgente",
      "channel": "WHATSAPP" | "SMS"
    }
    ```

### Enviar Mensagens em Massa
*   **URL**: `POST /api/messages/bulk`
*   **Descrição**: Envia múltiplas mensagens de uma só vez.
*   **Payload**:
    ```json
    {
      "senderId": "uuid",
      "recipients": ["string"],
      "content": "string",
      "priority": "normal" | "urgente"
    }
    ```

### Relatório de Mensagens
*   **URL**: `GET /api/messages/report`
*   **Query Params**: `startDate`, `endDate`, `status`, `senderId`, `page`, `limit`.
*   **Descrição**: Retorna uma lista paginada de mensagens filtradas.

### Histórico de Status
*   **URL**: `GET /api/messages/:id/history`
*   **Descrição**: Retorna todos os eventos de mudança de status de uma mensagem específica.

---

## 3. Clientes (Clients)

### Obter Dados do Cliente
*   **URL**: `GET /api/clients/:id`

### Obter Saldo e Consumo
*   **URL**: `GET /api/clients/:id/balance`
*   **Resposta**:
    ```json
    {
      "balance": number,
      "consumed": number,
      "limit": number,
      "planType": "prepaid" | "postpaid"
    }
    ```

---

## 4. Atualizações em Tempo Real (SSE)

### Stream de Status
*   **URL**: `GET /api/real-time/status-updates`
*   **Descrição**: Estabelece uma conexão Server-Sent Events para receber notificações de mudança de status em tempo real.
*   **Evento**: `message.status.updated`
*   **Dados do Evento**:
    ```json
    {
      "messageId": "uuid",
      "status": "processing" | "sent" | "delivered" | "read" | "failed",
      "timestamp": "ISO8601"
    }
    ```

---

## 5. Códigos de Status HTTP

*   `200 OK`: Requisição bem-sucedida.
*   `201 Created`: Recurso criado com sucesso (usado no envio de mensagens).
*   `400 Bad Request`: Erro de validação nos dados enviados.
*   `402 Payment Required`: Saldo insuficiente ou limite excedido.
*   `404 Not Found`: Recurso não encontrado.
*   `500 Internal Server Error`: Erro inesperado no servidor.
