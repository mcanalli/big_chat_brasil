# AI-Agent Microservice (`ai-agent`)

## Visão Executiva

O microsserviço **`ai-agent`** é um componente baseado em **NestJS** responsável por simular o comportamento de conversação de um cliente real (consumidor final) ao receber mensagens disparadas pela plataforma Big Chat Brasil. 

Quando uma mensagem é enviada pelo backend e atinge o estado `sent`, ela é encaminhada para o `ai-agent`. Utilizando o SDK oficial do Google Generative AI (`@google/generative-ai`), o serviço processa o conteúdo recebido com contexto de persona e gera uma resposta realista que é devolvida de forma assíncrona ao Backend via webhook *inbound* (`POST /api/messages/inbound`).

---

## Stack Tecnológica

*   **Framework**: NestJS v11.x
*   **Linguagem**: TypeScript v5.x
*   **IA SDK**: `@google/generative-ai` v0.24+
*   **Testes**: Jest (com cobertura de testes unitários)

---

## Modelos Suportados e Estratégia de Fallback

O `ai-agent` implementa uma estratégia robusta de tentativa sequencial de múltiplos modelos do Google Gemini, garantindo alta resiliência e disponibilidade mesmo diante de descontinuidades de versão ou limites de cota:

1.  `gemini-2.5-flash` (Principal)
2.  `gemini-2.0-flash` (Alternativo primário)
3.  `gemini-flash-latest` (Fallback genérico)
4.  `gemini-flash-lite-latest` (Fallback leve)

Se todos os modelos falharem ou a chave de API não estiver configurada, o serviço retorna uma resposta de fallback pré-formatada para manter o fluxo do chat intacto.

---

## Fluxo do Webhook Inbound e Payload

### 1. Webhook Recebido pelo AI-Agent
*   **Endpoint**: `POST /generate-response`
*   **Payload de Entrada**:
```json
{
  "clientId": "uuid-do-cliente",
  "senderId": "uuid-do-cliente",
  "recipientPhone": "+5511999998888",
  "recipientName": "João da Silva",
  "content": "Olá João, sua fatura está disponível para pagamento.",
  "channel": "WHATSAPP"
}
```

### 2. Webhook Disparado de Volta para o Backend
Após gerar a resposta com a IA, o microsserviço dispara um POST para a API principal do Backend:
*   **Endpoint**: `POST /api/messages/inbound`
*   **Payload Enviado**:
```json
{
  "clientId": "uuid-do-cliente",
  "from": "+5511999998888",
  "senderName": "João da Silva",
  "content": "Obrigado pelo aviso, vou verificar amanhã.",
  "channel": "WHATSAPP"
}
```

---

## Variáveis de Ambiente

O serviço é configurado através das seguintes variáveis de ambiente (definidas em `.env` ou injetadas via Docker Compose):

| Variável | Descrição | Valor Padrão / Exemplo |
| :--- | :--- | :--- |
| `PORT` | Porta de escuta do serviço | `3001` |
| `BACKEND_URL` | URL base do microsserviço Backend | `http://backend:3000` |
| `GEMINI_API_KEY` | Chave de API oficial do Google Gemini AI | `AIzaSy...` |

---

## Guia de Execução e Testes

### Execução Local (Desenvolvimento)
```bash
# Na raiz do projeto, via Docker Compose:
docker compose -f docker-compose.dev.yml up -d --build ai-agent

# Ou diretamente na pasta ai-agent:
cd ai-agent
npm install
npm run start:dev
```

### Execução de Testes Unitários
```bash
cd ai-agent
npm run test
```
