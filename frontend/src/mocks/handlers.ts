import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  http.post('http://localhost:3000/api/auth', async ({ request }) => {
    const body = (await request.json()) as any;
    if (body.documentId === '12345678909' || body.documentId === '12345678000199') {
      return HttpResponse.json({
        token: 'mock-jwt-token-xyz',
        client: {
          id: 'client-uuid-123',
          name: 'Empresa Teste Ltda',
          documentId: body.documentId,
          documentType: body.documentType,
          balance: 150.00,
          planType: 'PREPAID',
          limit: 1000,
          consumed: 50
        }
      });
    }
    return new HttpResponse(JSON.stringify({ message: 'Cliente não encontrado' }), { status: 404 });
  }),

  http.get('http://localhost:3000/api/clients/:id/balance', ({ params }) => {
    const { id } = params;
    if (id === 'client-uuid-123') {
      return HttpResponse.json({
        balance: 150.00,
        planType: 'PREPAID',
        limit: 1000,
        consumed: 50
      });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.get('http://localhost:3000/api/conversations', ({ request }) => {
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    if (clientId === 'client-uuid-123') {
      return HttpResponse.json([
        {
          id: 'conv-1',
          clientId: 'client-uuid-123',
          recipientPhone: '5511999999999',
          recipientName: 'João Silva',
          lastMessageContent: 'Olá, tudo bem?',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        }
      ]);
    }
    return HttpResponse.json([]);
  }),

  http.get('http://localhost:3000/api/conversations/:id/messages', ({ params }) => {
    const { id } = params;
    if (id === 'conv-1') {
      return HttpResponse.json([
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          senderId: 'client-uuid-123',
          recipientPhone: '5511999999999',
          channel: 'WHATSAPP',
          direction: 'outbound',
          content: 'Olá, tudo bem?',
          status: 'delivered',
          timestamp: new Date().toISOString()
        }
      ]);
    }
    return HttpResponse.json([]);
  }),

  http.post('http://localhost:3000/api/messages', async ({ request }) => {
    const body = (await request.json()) as any;
    if (body.content === 'SALDO_INSUFICIENTE') {
      return new HttpResponse(JSON.stringify({ message: 'Saldo insuficiente' }), { status: 402 });
    }
    return HttpResponse.json({
      success: true,
      messageId: 'msg-new-1',
      status: 'queued'
    });
  }),

  http.post('http://localhost:3000/api/messages/bulk', async () => {
    return HttpResponse.json({
      success: true,
      queuedCount: 2,
      newBalance: 140.00
    });
  })
];

export const server = setupServer(...handlers);
