# Big Chat Brasil (BCB) - Plataforma de Mensagens

Este repositório contém a solução completa para o desafio **Big Chat Brasil**, desenvolvida com uma arquitetura moderna e escalável utilizando **NestJS**, **Angular 17+**, **PostgreSQL**, **Redis** e **RabbitMQ**.

## 🚀 Como Rodar

### Pré-requisitos
- Docker e Docker Compose instalados.

### Execução via Docker (Recomendado)
Para subir todo o ecossistema (App, PostgreSQL, RabbitMQ, Redis e Frontend):

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Portas Úteis:
- **Frontend:** [http://localhost:4200](http://localhost:4200)
- **Backend API:** [http://localhost:3000/api](http://localhost:3000/api)
- **Swagger Docs:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **RabbitMQ Management:** [http://localhost:15672](http://localhost:15672) (guest/guest)

---

## 🛠 Tecnologias Utilizadas

### Backend
- **NestJS**: Framework Node.js para aplicações eficientes e escaláveis.
- **TypeORM**: ORM para interação com PostgreSQL.
- **RabbitMQ**: Message Broker para processamento assíncrono e priorização de mensagens.
- **Redis**: Cache para gestão de saldo e controle de concorrência.
- **Swagger**: Documentação automatizada da API.

### Frontend
- **Angular 17+**: Framework web com as últimas funcionalidades.
- **Signals**: Gestão de estado reativa e performática.
- **Angular Material**: Biblioteca de componentes UI moderna.
- **SASS/SCSS**: Estilização avançada.

---

## 🧪 Como Testar a Autenticação

A autenticação é baseada no documento do cliente (CPF ou CNPJ). Ao iniciar a aplicação, o banco de dados é populado automaticamente com os seguintes usuários de teste:

1.  **Cliente Pré-pago (Empresa Alpha)**
    - **Documento (CPF):** `11111111111`
    - **Saldo Inicial:** R$ 10,00
2.  **Cliente Pós-pago (Empresa Beta)**
    - **Documento (CNPJ):** `22222222222222`
    - **Limite:** R$ 50,00

### Passos para o Fluxo E2E:
1.  Acesse `http://localhost:4200`.
2.  Informe um dos documentos acima no campo de login.
3.  No chat, selecione o contato "João Silva".
4.  Envie mensagens alternando entre **Normal** e **Urgente ⚡**.
5.  Abra o menu (clicando no nome/saldo) e explore o **Envio em Massa** e o painel **Financeiro**.
6.  **Teste de Saldo Insuficiente:** Tente realizar disparos em massa que excedam seu saldo/limite para ver a validação em tempo real.

---

## 📁 Estrutura do Projeto

- `/backend`: API NestJS (TypeScript).
- `/frontend`: App Angular 17 com Material e Signals.
- `/openspec`: Especificações formais da API (OpenAPI 3.0).
- `/infra`: Arquivos de configuração de infraestrutura (Docker).

## 🛠️ Mensageria e Priorização

O sistema utiliza RabbitMQ para processamento assíncrono:
- **Exchange**: `bcb.messages.direct`
- **Filas**: 
  - `bcb.messages.urgent` (Prioridade 10)
  - `bcb.messages.normal` (Prioridade 5)
- **Worker**: Implementa lógica Anti-Starvation (garante que mensagens normais não fiquem presas se houver excesso de urgentes).

---
Desenvolvido com excelência técnica para o desafio Big Chat Brasil.
