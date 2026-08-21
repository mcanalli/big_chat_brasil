import { Controller, Post, Body, Logger } from '@nestjs/common';
import { GenerateResponseDto } from './dtos/generate-response.dto';
import { AiService } from './services/ai.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('generate-response')
  async generateResponse(@Body() dto: GenerateResponseDto) {
    this.logger.log(`Received generate-response request for client ${dto.clientId}, from ${dto.recipientPhone}: "${dto.content}"`);

    // 1. Generate AI response
    const aiReply = await this.aiService.generateReply(dto.content, dto.recipientName);
    this.logger.log(`Generated AI response: "${aiReply}"`);

    // 2. Prepare inbound payload for Backend API
    const backendUrl = process.env.BACKEND_URL || 'http://backend:3000';
    const inboundEndpoint = `${backendUrl}/api/messages/inbound`;

    const inboundPayload = {
      clientId: dto.clientId,
      from: dto.recipientPhone,
      senderName: dto.recipientName || 'Cliente',
      content: aiReply,
      channel: dto.channel || 'WHATSAPP',
    };

    // 3. Dispatch HTTP request to Backend API asynchronously
    this.dispatchToBackend(inboundEndpoint, inboundPayload);

    return {
      success: true,
      aiResponse: aiReply,
    };
  }

  private async dispatchToBackend(url: string, payload: any) {
    try {
      this.logger.log(`Sending inbound webhook to backend at ${url}...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`Backend returned status ${response.status}: ${errText}`);
      } else {
        this.logger.log(`Inbound webhook successfully sent to backend.`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send inbound webhook to backend: ${errorMsg}`);
    }
  }
}
