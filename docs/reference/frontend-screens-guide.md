# Guia de Telas e Funcionalidades do Frontend

Este documento descreve a interface do usuário do Big Chat Brasil e suas principais regras de negócio visuais.

## 1. Tela de Login
*   **Acesso**: Tela inicial.
*   **Funcionalidade**: Permite que o cliente entre no sistema utilizando apenas seu documento (CPF/CNPJ).
*   **Regra de Negócio**: O sistema valida se o cliente existe na base de dados para permitir o acesso.

## 2. Dashboard de Chat
*   **Componente**: `ChatComponent`.
*   **Funcionalidade**: Interface principal de conversas.
    *   **Lista de Conversas**: Exibe as conversas ativas com o último conteúdo e contador de mensagens não lidas.
    *   **Janela de Chat**: Exibe o histórico de mensagens enviadas e recebidas.
    *   **Input de Mensagem**: Campo para digitar o conteúdo, com opção de selecionar a prioridade (`Normal` ou `Urgente`).
*   **Regras de UI**:
    *   Mensagens urgentes são destacadas visualmente.
    *   O status da mensagem (Enviado, Entregue, Lido) é atualizado automaticamente via SSE sem necessidade de refresh.

## 3. Diálogo Financeiro (Consumo)
*   **Componente**: `FinanceDialogComponent`.
*   **Funcionalidade**: Exibe a saúde financeira do cliente.
    *   **Pré-pago**: Mostra o saldo disponível.
    *   **Pós-pago**: Mostra o consumo atual versus o limite mensal.
*   **Visualização**: Gráficos ou barras de progresso que indicam o percentual de uso do limite.

## 4. Envio de Mensagens em Massa
*   **Componente**: `BulkMessageDialogComponent`.
*   **Funcionalidade**: Permite o envio de uma única mensagem para múltiplos destinatários.
*   **Entrada**: Lista de números de telefone separados por vírgula ou nova linha.

## 5. Nova Conversa
*   **Componente**: `NewConversationDialogComponent`.
*   **Funcionalidade**: Inicia uma conversa com um número que ainda não está na lista de contatos.

## Regras de Negócio da Interface
*   **Validação de Saldo**: Antes de habilitar o botão de envio, a interface verifica se o cliente possui recursos (opcionalmente, a validação final é sempre do backend).
*   **Sincronização SSE**: Se a conexão com o stream de eventos cair, a interface tenta se reconectar automaticamente para garantir que os status continuem sendo atualizados.
*   **Prioridades**: O sistema de prioridades afeta visualmente a ordenação e o estilo dos itens na lista de mensagens.
