# Design Doc - Frontend (Angular)

Este documento detalha a arquitetura e os padrões utilizados no desenvolvimento do frontend do Big Chat Brasil.

## 1. Arquitetura Angular

O projeto utiliza **Angular 22+** (versão de ponta) com foco em performance e modernidade:

*   **Componentes Standalone**: Redução de boilerplate eliminando a necessidade de NgModules pesados.
*   **Features/Core/Shared**:
    *   **Core**: Serviços globais, interceptores, guards e modelos de dados compartilhados.
    *   **Features**: Módulos funcionais (ex: Chat, Login, Admin).
    *   **Components**: Componentes reutilizáveis (diálogos, botões, cards).
*   **Signals**: Utilização de Angular Signals para gerenciamento de estado reativo, proporcionando atualizações de UI mais granulares e eficientes.

## 2. Gerenciamento de Estado e Reatividade

*   **SSE (Server-Sent Events)**: O `RealTimeService` mantém uma conexão ativa com o backend para receber atualizações de status. Essas atualizações são processadas via RxJS e integradas ao estado da aplicação.
*   **Polling (Fallback)**: Embora o SSE seja a via principal, a arquitetura está preparada para implementar estratégias de polling caso a conexão SSE falhe.
*   **RxJS**: Utilizado intensivamente para lidar com fluxos assíncronos de mensagens e eventos em tempo real.

## 3. Interface e Experiência do Usuário (UX)

*   **Angular Material**: Base de componentes para garantir consistência visual e acessibilidade.
*   **Design Responsivo**: Layout estruturado para funcionar em diferentes tamanhos de tela.
*   **Visualização de Prioridades**: Uso de cores e ícones para diferenciar mensagens `normais` de `urgentes`.
*   **Modais de Negócio**:
    *   **Financeiro**: Visualização de saldo, consumo e limites.
    *   **Envio em Massa**: Interface para upload/entrada de múltiplos destinatários.

## 4. Estilização

*   **SCSS**: Pré-processador utilizado para modularização de estilos.
*   **Tematização**: Estrutura preparada para suportar Light/Dark mode através de variáveis CSS integradas ao Angular Material.

## 5. Fluxos de Dados Principais

1.  **Envio de Mensagem**: Componente -> Service (HTTP POST) -> Backend.
2.  **Recebimento de Status**: Backend (SSE) -> RealTimeService -> ChatService (Update Signal/Observable) -> UI Update.
3.  **Gestão de Sessão**: AuthGuard + JWT Interceptor para segurança em todas as requisições.
