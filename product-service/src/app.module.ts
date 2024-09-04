import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ProductSchema } from './models/Product';
import envs from './config/envs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envs],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.PRODUCT_SERVICE_DB_URL),
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
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
        name: 'OWNER_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: process.env.OWNER_SERVICE_GRPC_URL,
          package: 'owner',
          protoPath: join(process.cwd(), 'proto/owner.proto'),
        },
      },
      {
        name: 'ORDER_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: process.env.ORDER_SERVICE_GRPC_URL,
          package: 'order',
          protoPath: join(process.cwd(), 'proto/order.proto'),
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
