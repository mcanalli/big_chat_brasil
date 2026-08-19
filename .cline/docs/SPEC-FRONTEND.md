# SPEC-FRONTEND: Arquitetura Frontend Angular 17+

## 1. Tecnologias Core
- **Angular 17+**: Uso de Standalone Components e Control Flow Syntax.
- **State Management**: Angular Signals (para reatividade fina).
- **UI Framework**: Angular Material.
- **HTTP Client**: Injeção baseada em funções (`provideHttpClient`).

## 2. Estrutura de Componentes (Standalone)

### 2.1 Layout
- `ShellComponent`: Sidebar de navegação e Header com saldo.
- `BalanceWidget`: Componente no header que reflete o `balanceSignal`.

### 2.2 Chat
- `ChatComponent`: Container principal.
- `ConversationList`: Lista de conversas ordenadas por `lastMessageTime`.
- `MessageHistory`: Lista de mensagens com diferenciação visual entre `inbound` e `outbound`.
- `ChatInput`: Campo de texto com seleção de canal (WhatsApp/SMS).

### 2.3 Bulk Sender
- `BulkUploadComponent`: Drag & drop de CSV/Lista de números.

## 3. Gerenciamento de Estado (Signals)

### 3.1 `AuthStore` (Signal-based Service)
- `currentUser`: Signal do cliente logado.

### 3.2 `ChatStore`
- `conversations`: Signal array das conversas ativas.
- `activeConversationId`: Signal da conversa selecionada.
- `messages`: Signal calculado/buscado da thread ativa.

### 3.3 `PollingStore`
- `balance`: Signal atualizado a cada X segundos via `timer` do RxJS convertido para Signal.

## 4. Serviços e Guards
- `AuthService`: Login e gestão de JWT.
- `ChatService`: Métodos `getConversations()`, `getMessages()`, `sendMessage()`.
- `AuthGuard`: Proteção de rotas autenticadas.

## 5. Contratos de Interface (Frontend Models)
```typescript
export interface Recipient {
  id: string;
  phone: string;
  name?: string;
}

export interface Message {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: Date;
  status: string;
}
```
