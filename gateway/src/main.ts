import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as morgan from 'morgan';
// import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(morgan('dev'));
  app.enableCors({ preflightContinue: false });
  app.setGlobalPrefix('/api/v1');
  app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalPipes(
  //   new ValidationPipe({ stopAtFirstError: true, errorHttpStatusCode: 422 }),
  // );
  await app.listen(process.env.GATEWAY_PORT);
  console.log(`Gateway is running on: ${await app.getUrl()}`);
}

bootstrap();
