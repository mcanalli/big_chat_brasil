# AI-Agent Service - Big Chat Brasil

## Visão Executiva

O **AI-Agent** é o microsserviço inteligente do Big Chat Brasil construído em **NestJS** que integra o **Google GenAI SDK** para simular conversas realistas com clientes finais através de modelos **Google Gemini** (`gemini-2.5-flash`, `gemini-2.0-flash`).

---

## Modelos Suportados

*   `gemini-2.5-flash` (Principal)
*   `gemini-2.0-flash` (Alternativo)
*   `gemini-flash-latest` / `gemini-flash-lite-latest` (Fallbacks)

---

## Comandos de Execução e Teste

```bash
# Execução via Docker Compose
docker compose -f docker-compose.dev.yml up -d --build ai-agent

# Execução local
cd ai-agent
npm install
npm run start:dev

# Testes unitários
npm run test
```
