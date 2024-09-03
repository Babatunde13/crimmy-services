import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
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
