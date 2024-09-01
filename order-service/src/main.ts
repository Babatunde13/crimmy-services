import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  console.log('RABBITMQ_URL', process.env.RABBITMQ_URL);
  console.log('ORDER_SERVICE_GRPC_URL', process.env.ORDER_SERVICE_GRPC_URL);
  console.log('ORDER_SERVICE_DB_URL', process.env.ORDER_SERVICE_DB_URL);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: process.env.ORDER_SERVICE_GRPC_URL,
        package: 'order',
        protoPath: join(process.cwd(), 'proto/order.proto'),
      },
    },
  );

  await app.listen();
}

bootstrap();
