import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ClientEntity } from '../../../domain/entities/client.entity';
import { ConversationEntity } from '../../../domain/entities/conversation.entity';
import { MessageEntity } from '../../../domain/entities/message.entity';
import { MessageStatusHistoryEntity } from '../../../domain/entities/message-status-history.entity';
import { FinancialTransactionEntity } from '../../../domain/entities/financial-transaction.entity';

@Injectable()
export class InitialSeeder {
  constructor(private dataSource: DataSource) {}

  async seed() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verificar/Criar Cliente 1 (Pré-pago)
      let client1 = await queryRunner.manager.findOne(ClientEntity, {
        where: { documentId: '11111111111' },
      });

      if (!client1) {
        client1 = queryRunner.manager.create(ClientEntity, {
          name: 'Empresa Alpha',
          documentId: '11111111111',
          documentType: 'CPF',
          planType: 'prepaid',
          balance: 10.0,
          limit: 0,
          consumed: 0,
          active: true,
        });
        await queryRunner.manager.save(client1);
      }

      // 2. Verificar/Criar Cliente 2 (Pós-pago)
      let client2 = await queryRunner.manager.findOne(ClientEntity, {
        where: { documentId: '22222222222222' },
      });

      if (!client2) {
        client2 = queryRunner.manager.create(ClientEntity, {
          name: 'Empresa Beta',
          documentId: '22222222222222',
          documentType: 'CNPJ',
          planType: 'postpaid',
          balance: 0,
          limit: 50.0,
          consumed: 0,
          active: true,
        });
        await queryRunner.manager.save(client2);
      }

      // 3. Verificar/Criar Conversa Inicial para o Cliente 1
      let conversation = await queryRunner.manager.findOne(ConversationEntity, {
        where: { clientId: client1.id, recipientPhone: '5511999999999' },
      });

      if (!conversation) {
        conversation = queryRunner.manager.create(ConversationEntity, {
          clientId: client1.id,
          recipientPhone: '5511999999999',
          recipientName: 'João Silva',
          lastMessageContent: 'Olá, bem-vindo à Empresa Alpha!',
          lastMessageTime: new Date(),
          unreadCount: 0,
        });
        await queryRunner.manager.save(conversation);

        // 4. Mensagem Inicial
        const message = queryRunner.manager.create(MessageEntity, {
          conversationId: conversation.id,
          senderId: client1.id,
          recipientPhone: '5511999999999',
          channel: 'WHATSAPP',
          content: 'Olá, bem-vindo à Empresa Alpha!',
          status: 'sent',
          cost: 0.5,
          priority: 'normal',
        });
        await queryRunner.manager.save(message);

        // 5. Histórico de Status da Mensagem
        const history = queryRunner.manager.create(MessageStatusHistoryEntity, {
          messageId: message.id,
          status: 'sent',
          details: 'Mensagem enviada com sucesso via seeder.',
        });
        await queryRunner.manager.save(history);

        // 6. Registro Financeiro (Débito da mensagem e Carga Inicial)
        const transactionLoad = queryRunner.manager.create(FinancialTransactionEntity, {
          clientId: client1.id,
          type: 'CREDIT_PURCHASE',
          amount: 10.5,
          previousBalance: 0,
          newBalance: 10.5,
          description: 'Carga inicial de créditos',
        });
        await queryRunner.manager.save(transactionLoad);

        const transactionDebit = queryRunner.manager.create(FinancialTransactionEntity, {
          clientId: client1.id,
          type: 'MESSAGE_DEBIT',
          amount: 0.5,
          previousBalance: 10.5,
          newBalance: 10.0,
          description: `Débito de envio WhatsApp: ${message.id}`,
        });
        await queryRunner.manager.save(transactionDebit);
      }

      await queryRunner.commitTransaction();
      console.log('Seeder executado com sucesso!');
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Erro ao executar seeder:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}