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
        url: process.env.PRODUCT_SERVICE_GRPC_URL,
        package: 'product',
        protoPath: join(process.cwd(), 'proto/product.proto'),
      },
    },
  );

  await app.listen();
  console.log(
    'Product service is running on:',
    process.env.PRODUCT_SERVICE_GRPC_URL,
  );
}

bootstrap();
