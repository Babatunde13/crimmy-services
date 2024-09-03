import mongoose, { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './models/Product';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { status } from '@grpc/grpc-js';

interface OrderServiceClient {
  createOrder(order: any): Observable<any>;
  getOrderById(id: { id: string }): Observable<any>;
  getOrders({}): Observable<any>;
  getOrdersByUser(data: { user_id: string }): Observable<any>;
  deleteOrder(data: { id: string }): Observable<any>;
  getProductOrders(data: { productId: string }): Observable<any>;
}

interface UserServiceClient {
  createUser(user: any): Observable<any>;
  getUser(data: { id: string }): Observable<any>;
  deleteUser(data: { id: string }): Observable<any>;
  updateUser(data: any): Observable<any>;
}

@Injectable()
export class AppService {
  private orderService: OrderServiceClient;
  private userService: UserServiceClient;

  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientGrpc,
    @Inject('USER_SERVICE') private readonly userClient: ClientGrpc,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  onModuleInit() {
    this.orderService =
      this.orderClient.getService<OrderServiceClient>('OrderService');
    this.userService =
      this.userClient.getService<UserServiceClient>('UserService');
  }

  async getProduct(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Invalid product ID',
      });
    }

    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Product not found',
      });
    }
    return { product };
  }

  async createProduct(product: any) {
    const userResp = await firstValueFrom(
      this.userService.getUser({ id: product.userId }),
    );
    if (!userResp || !userResp.user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      });
    }
    product.user = userResp.user;
    const createdProduct = new this.productModel(product);
    await createdProduct.save();

    return createdProduct;
  }

  async deleteProduct(id: string) {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
    return deletedProduct;
  }

  async getProducts() {
    try {
      const products = await this.productModel.find().exec();
      return {
        products,
        message: 'Products retrieved successfully',
        success: true,
      };
    } catch (error) {
      console.error('Error retrieving products:', error);
      return {
        message: 'Error retrieving products',
        success: false,
      };
    }
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

    await this.productModel.updateMany({ userId }, { user });
  }

  async updateProduct(id: string, product: any) {
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
