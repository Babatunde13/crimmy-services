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

  @GrpcMethod('OrderService', 'GetMySingleOrder')
  getOrderById(data: { orderId: string; ownerId: string }) {
    return this.appService.getMySingleOrder(data.orderId, data.ownerId);
  }

  @GrpcMethod('OrderService', 'GetMyOrders')
  async getMyOrders(data: { ownerId: string }) {
    try {
      const orders = await this.appService.getMyOrders(data.ownerId);
      return {
        orders,
        message: 'Orders retrieved successfully',
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

  @GrpcMethod('OrderService', 'UpdateOrder')
  async updateOrder(data: any) {
    return this.appService.updateOrder(data);
  }
}
