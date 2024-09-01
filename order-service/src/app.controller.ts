import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller('order')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('OrderService', 'CreateOrder')
  createOrder(data: any) {
    return this.appService.createOrder(data);
  }

  @GrpcMethod('OrderService', 'GetOrderById')
  getOrderById(data: { id: string }) {
    return this.appService.getOrderById(data.id);
  }

  @GrpcMethod('OrderService', 'GetOrders')
  async getOrders() {
    try {
      const orders = await this.appService.getOrders();
      return {
        orders,
        message: 'Orders retrieved successfully',
        success: true,
      };
    } catch (error) {
      return { message: 'Error retrieving orders', success: false };
    }
  }

  @GrpcMethod('OrderService', 'DeleteOrder')
  deleteOrder(data: { id: string }) {
    return this.appService.deleteOrder(data.id);
  }

  @GrpcMethod('OrderService', 'GetOrdersByUser')
  async getOrdersByUser(data: { user_id: string }) {
    try {
      const orders = await this.appService.getOrdersByUser(data.user_id);
      return {
        orders,
        message: 'Orders for user retrieved successfully',
        success: true,
      };
    } catch (error) {
      return { message: 'Error retrieving orders', success: false };
    }
  }

  @GrpcMethod('OrderService', 'GetProductOrders')
  async getProductOrders(data: { productId: string }) {
    try {
      const orders = await this.appService.getProductOrders(data.productId);
      return {
        orders,
        message: 'Orders for product retrieved successfully',
        success: true,
      };
    } catch (error) {
      return { message: 'Error retrieving orders', success: false };
    }
  }
}
