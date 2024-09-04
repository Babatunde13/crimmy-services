import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import envs from './config/envs';
import {
  OrderController,
  OwnerController,
  ProductController,
} from './app.controller';
import { AppService } from './app.service';
import {
  ORDER_PACKAGE,
  ORDER_SERVICE,
  OWNER_PACKAGE,
  OWNER_SERVICE,
  PRODUCT_PACKAGE,
  PRODUCT_SERVICE,
} from './constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envs],
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: ORDER_SERVICE,
        transport: Transport.GRPC,
        options: {
          url: process.env.ORDER_SERVICE_GRPC_URL,
          package: ORDER_PACKAGE,
          protoPath: join(process.cwd(), 'proto/order.proto'),
        },
      },
      {
        name: OWNER_SERVICE,
        transport: Transport.GRPC,
        options: {
          url: process.env.OWNER_SERVICE_GRPC_URL,
          package: OWNER_PACKAGE,
          protoPath: join(process.cwd(), 'proto/owner.proto'),
        },
      },
      {
        name: PRODUCT_SERVICE,
        transport: Transport.GRPC,
        options: {
          url: process.env.PRODUCT_SERVICE_GRPC_URL,
          package: PRODUCT_PACKAGE,
          protoPath: join(process.cwd(), 'proto/product.proto'),
        },
      },
    ]),
  ],
  providers: [AppService],
  controllers: [OrderController, OwnerController, ProductController],
})
export class AppModule {}
