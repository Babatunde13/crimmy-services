import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ProductSchema } from './models/Product';
import envs from './config/envs';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
