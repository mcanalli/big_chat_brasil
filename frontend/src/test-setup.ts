import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock global para EventSource (SSE)
class MockEventSource {
  url: string;
  readyState = 1;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onopen: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  close() {
    this.readyState = 2;
  }

  // Método auxiliar para disparar mensagens mockadas nos testes
  public simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }

  public simulateError(error: any) {
    if (this.onerror) {
      this.onerror(error);
    }
  }
}

vi.stubGlobal('EventSource', MockEventSource);
