import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api/v1/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  getHello() {
    return { message: 'Hello World!' };
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.appService.getProduct(id);
  }

  @Post('products')
  createProduct(@Body() data: any) {
    return this.appService.createProduct(data);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.appService.deleteProduct(id);
  }

  @Post('auth/signup')
  createUser(@Body() data: any) {
    return this.appService.createUser(data);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.appService.getUser(id);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.appService.deleteUser(id);
  }

  @Post('orders')
  createOrder(@Body() data: any) {
    return this.appService.createOrder(data);
  }

  @Get('orders/:id')
  getOrderById(@Param('id') id: string) {
    return this.appService.getOrderById(id);
  }

  @Get('orders')
  getOrders() {
    return this.appService.getOrders();
  }

  @Delete('orders/:id')
  deleteOrder(@Param('id') id: string) {
    return this.appService.deleteOrder(id);
  }

  @Get('orders/users/:user_id')
  getOrdersByUser(@Param('user_id') user_id: string) {
    return this.appService.getOrdersByUser(user_id);
  }

  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() data: any) {
    console.log('Updating user in gateway:', id, data);
    return this.appService.updateUser(id, data);
  }

  @Get('products')
  getProducts() {
    return this.appService.getProducts();
  }

  @Get('products/:productId/orders')
  getProductOrders(@Param('productId') productId: string) {
    return this.appService.getProductOrders(productId);
  }
}
