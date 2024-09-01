import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './models/Order';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async createOrder(order: any) {
    console.log('Creating order in order-service:', order);
    const createdOrder = new this.orderModel(order);
    await createdOrder.save();

    this.amqpConnection.publish('app_events', 'order.created', {
      productId: order.productId,
      quantity: order.quantity,
    });
    return createdOrder;
  }

  async getOrderById(id: string) {
    const order = await this.orderModel.findById(id).exec();
    return { order };
  }

  async deleteOrder(id: string) {
    const deletedOrder = await this.orderModel.findByIdAndDelete(id).exec();
    return { order: deletedOrder };
  }

  async getOrders() {
    const orders = await this.orderModel.find().exec();
    console.log('Orders:', orders);
    return orders;
  }

  async getOrdersByUser(user_id: string) {
    const orders = await this.orderModel.find({ userId: user_id }).exec();
    return orders;
  }

  /**
   * Event handler for user updated event
   * We want to update the order information
   */
  @RabbitSubscribe({
    exchange: 'app_events',
    routingKey: 'user.updated',
    queue: 'user_updated_queue',
  })
  async handleUserUpdate(msg: any) {
    const { userId, user } = msg;
    console.log('Message:', msg);

    await this.orderModel.updateMany({ userId }, { user });
  }

  /**
   * Event handler for product updated event
   * We want to update the order information
   */
  @RabbitSubscribe({
    exchange: 'app_events',
    routingKey: 'product.updated',
    queue: 'product_updated_queue',
  })
  async handleProductUpdate(msg: any) {
    const { productId, product } = msg;
    console.log('Message:', msg);

    await this.orderModel.updateMany({ productId }, { product });
  }

  async getProductOrders(productId: string) {
    const orders = await this.orderModel.find({ productId }).exec();
    return orders;
  }
}
