import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import envs from './config/envs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ORDER_PACKAGE,
  ORDER_SERVICE,
  USER_PACKAGE,
  USER_SERVICE,
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
        name: USER_SERVICE,
        transport: Transport.GRPC,
        options: {
          url: process.env.USER_SERVICE_GRPC_URL,
          package: USER_PACKAGE,
          protoPath: join(process.cwd(), 'proto/user.proto'),
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
  controllers: [AppController],
})
export class AppModule {}
