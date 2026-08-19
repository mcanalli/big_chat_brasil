# PROPOSAL: Big Chat Brasil (BCB) Evolution

## 1. Resumo Executivo
Este documento propõe a evolução da plataforma Big Chat Brasil (BCB) de um sistema de disparo de mensagens unidirecional para uma plataforma de comunicação bidirecional completa. O foco é permitir que os clientes não apenas enviem mensagens (SMS/WhatsApp), mas também recebam respostas, gerenciem seus contatos (Recipients) e monitorem seu saldo em tempo real.

## 2. Justificativa das Mudanças
Atualmente, o sistema trata destinatários de forma volátil (apenas número de telefone nas tabelas de mensagens). A introdução de uma entidade de `Recipient` (Contato) permitirá:
- Histórico rico por contato.
- Gestão de nomes e metadados.
- Melhor organização de conversas (Threads).
- Suporte a mensagens recebidas (`inbound`) via Webhooks.

## 3. Análise de Impacto
- **Backend**: Alteração no esquema de banco de dados (TypeORM) e novos endpoints de integração.
- **Frontend**: Adoção de arquitetura reativa com Angular Signals para garantir que o saldo e as novas mensagens sejam refletidos instantaneamente na UI.
- **Negócio**: Aumento do valor agregado da plataforma, permitindo atendimento ao cliente e não apenas marketing/notificação.

## 4. Escopo do Planejamento
- Auditoria do backend para inclusão de fluxos de entrada.
- Definição de arquitetura frontend moderna (Angular 17+).
- Especificação de contratos de API para polling e webhooks.
