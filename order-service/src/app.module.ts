import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { OrderSchema } from './models/Order';
import envs from './config/envs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envs],
    }),
    MongooseModule.forRoot(process.env.ORDER_SERVICE_DB_URL),
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'app_events',
          type: 'topic',
        },
      ],
      connectionInitOptions: { wait: false, timeout: 10000 },
      uri: process.env.RABBITMQ_URL,
    }),
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      }),
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: process.env.USER_SERVICE_GRPC_URL,
          package: 'user',
          protoPath: join(process.cwd(), 'proto/user.proto'),
        },
      },
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: process.env.PRODUCT_SERVICE_GRPC_URL,
          package: 'product',
          protoPath: join(process.cwd(), 'proto/product.proto'),
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
