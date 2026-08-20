import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Worker');
  
  // Criamos o contexto da aplicação para acessar serviços e repositórios se necessário,
  // mas aqui usamos o padrão de microserviço do NestJS para consumir a fila.
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://bcb_mq_user:bcb_mq_password@localhost:5672'],
      queue: 'bcb.messages.normal',
      noAck: false, // Habilita confirmação manual (ack/nack)
      queueOptions: {
        durable: true,
        arguments: {
          'x-max-priority': 5,
        },
      },
    },
  });

  // Podemos registrar múltiplos consumers se necessário ou usar o QueueModule já existente
  await app.listen();
  logger.log('Message Worker is running and consuming queues...');
}

bootstrap();
