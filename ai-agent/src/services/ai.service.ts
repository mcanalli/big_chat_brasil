import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = (globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }).process?.env?.GEMINI_API_KEY || '';
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set or empty. AI calls might fail.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateReply(incomingContent: string, recipientName?: string): Promise<string> {
    const clientName = recipientName || 'Cliente';
    const systemPrompt = `Você é ${clientName}, um cliente real conversando em um chat (WhatsApp/SMS) com uma empresa. 
Você acabou de receber uma mensagem da empresa. 
Assuma o papel de ${clientName} e responda à mensagem de forma natural, realista, cordial e sucinta, exatamente como um cliente respondendo à empresa. 
Evite respostas longas ou robóticas. Responda apenas com o texto da sua resposta como cliente.`;

    const userPrompt = `Mensagem enviada pela empresa para você (${clientName}): "${incomingContent}"`;

    const modelsToTry = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest'];

    for (const modelName of modelsToTry) {
      try {
        this.logger.log(`Attempting generation with model: ${modelName}`);
        const model = this.genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const text = response.text()?.trim();

        if (text) {
          this.logger.log(`AI generated response successfully using ${modelName}`);
          return text;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Failed with model ${modelName}: ${errorMessage}`);
      }
    }

    // Fallback if all models fail or API key is missing
    this.logger.error('All Gemini models failed or API key missing. Returning fallback response.');
    return `Olá! Recebi sua mensagem: "${incomingContent}". Em breve retorno.`;
  }
}

