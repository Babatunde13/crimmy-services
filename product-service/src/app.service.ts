import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './models/Product';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async getProduct(id: string) {
    const product = await this.productModel.findById(id).exec();
    return { product };
  }

  async createProduct(product: any) {
    const createdProduct = new this.productModel(product);
    await createdProduct.save();

    return createdProduct;
  }

  async deleteProduct(id: string) {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
    return deletedProduct;
  }

  async getProducts() {
    const products = await this.productModel.find().exec();
    return {
      products,
      message: 'Products retrieved successfully',
      success: true,
    };
  }

  /**
   * Event handler for user updated event
   * We want to update the product.user information
   */
  @RabbitSubscribe({
    exchange: 'app_events',
    routingKey: 'user.updated',
    queue: 'user_updated_queue',
  })
  async handleUserUpdate(msg: any) {
    const { userId, user } = msg;
    console.log('Message:', msg);

    await this.productModel.updateMany({ userId }, { user });
  }

  async updateProduct(id: string, product: any) {
    console.log('Updating product order in order-service:', id, product);
    delete product.id;
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, product, { new: true })
      .exec();

    // publish to product queue
    this.amqpConnection.publish('app_events', 'product.updated', {
      productId: updatedProduct._id,
      product: updatedProduct,
    });

    return updatedProduct;
  }

  /**
   * Event handler for decreasing product quantity when order is created
   */
  @RabbitSubscribe({
    exchange: 'app_events',
    routingKey: 'order.created',
    queue: 'order_created_queue',
  })
  async handleProductQuantityUpdated(msg: any) {
    const { productId, quantity } = msg;
    console.log('Message:', msg);

    await this.productModel.updateOne(
      { _id: productId },
      { $inc: { quantity: -quantity } },
    );
  }
}
