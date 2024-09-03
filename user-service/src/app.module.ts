import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UserSchema } from './models/User';
import envs from './config/envs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envs],
    }),
    MongooseModule.forRoot(process.env.USER_SERVICE_DB_URL),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
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
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: process.env.ORDER_SERVICE_GRPC_URL,
          package: 'order',
          protoPath: join(process.cwd(), 'proto/order.proto'),
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
