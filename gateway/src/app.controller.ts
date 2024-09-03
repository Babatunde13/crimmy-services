import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './guards/AuthGuard';
import { AuthUser } from './decorators/user.decorator';

@Controller()
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
  @UseGuards(AuthGuard)
  createProduct(@Body() data: any, @AuthUser('id') userId: string) {
    data.userId = userId;
    return this.appService.createProduct(data);
  }

  @Delete('products/:id')
  @UseGuards(AuthGuard)
  deleteProduct(@Param('id') id: string) {
    return this.appService.deleteProduct(id);
  }

  @Post('auth/signup')
  createUser(@Body() data: any) {
    return this.appService.createUser(data);
  }

  @Post('auth/login')
  loginUser(@Body() data: any) {
    return this.appService.login(data);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.appService.getUser(id);
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard)
  deleteUser(@Param('id') id: string) {
    return this.appService.deleteUser(id);
  }

  @Post('orders')
  @UseGuards(AuthGuard)
  createOrder(@Body() data: any, @AuthUser('id') userId: string) {
    data.userId = userId;
    return this.appService.createOrder(data);
  }

  @Get('orders/:id')
  @UseGuards(AuthGuard)
  getOrderById(@Param('id') id: string) {
    return this.appService.getOrderById(id);
  }

  @Get('orders')
  @UseGuards(AuthGuard)
  async getOrders() {
    return this.appService.getOrders();
  }

  @Delete('orders/:id')
  @UseGuards(AuthGuard)
  deleteOrder(@Param('id') id: string) {
    return this.appService.deleteOrder(id);
  }

  @Get('orders/users/me')
  @UseGuards(AuthGuard)
  getOrdersByUser(@AuthUser('id') user_id: string) {
    return this.appService.getOrdersByUser(user_id);
  }

  @Put('users/')
  @UseGuards(AuthGuard)
  updateUser(@Body() data: any, @AuthUser('id') id: string) {
    return this.appService.updateUser(id, data);
  }

  @Get('products')
  getProducts() {
    return this.appService.getProducts();
  }

  @Get('products/:productId/orders')
  @UseGuards(AuthGuard)
  getProductOrders(@Param('productId') productId: string) {
    return this.appService.getProductOrders(productId);
  }

  @Get('users/products/:productId/orders')
  @UseGuards(AuthGuard)
  getUserProductOrders(
    @AuthUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.appService.getUserProductOrders(userId, productId);
  }
}
