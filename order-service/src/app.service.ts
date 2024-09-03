import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { status } from '@grpc/grpc-js';
import { Order, OrderDocument } from './models/Order';

interface UserServiceClient {
  createUser(user: any): Observable<any>;
  getUser(data: { id: string }): Observable<any>;
  deleteUser(data: { id: string }): Observable<any>;
  updateUser(data: any): Observable<any>;
}

interface ProductServiceClient {
  getProduct(data: { id: string }): Observable<any>;
  createProduct(product: any): Observable<any>;
  deleteProduct(data: { id: string }): Observable<any>;
  getProducts({}): Observable<any>;
}

@Injectable()
export class AppService {
  private userService: UserServiceClient;
  private productService: ProductServiceClient;

  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientGrpc,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientGrpc,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  onModuleInit() {
    this.userService =
      this.userClient.getService<UserServiceClient>('UserService');
    this.productService =
      this.productClient.getService<ProductServiceClient>('ProductService');
  }

  async createOrder(order: any) {
    const userResp = await firstValueFrom(
      this.userService.getUser({ id: order.userId }),
    );
    if (!userResp || !userResp.user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      });
    }
    let product: any = await this.cacheManager.get(
      `product_${order.productId}`,
    );
    if (!product) {
      const productResp = await firstValueFrom(
        this.productService.getProduct({ id: order.productId }),
      );
      if (!productResp || !productResp.product) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Product not found',
        });
      }
      product = productResp.product;
    }

    if (product.quantity < order.quantity || product.quantity <= 0) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'Product out of stock',
      });
    }
    order.status = 'pending';
    order.totalPrice = product.price * order.quantity;
    order.product = product;
    order.user = userResp.user;
    const createdOrder = await this.orderModel.create(order);

    product.quantity -= order.quantity;
    await this.cacheManager.set(`product_${order.productId}`, product);
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

    await this.orderModel.updateMany({ productId }, { product });
    await this.cacheManager.set(`product_${productId}`, product);
  }

  async getProductOrders(productId: string) {
    const orders = await this.orderModel.find({ productId }).exec();
    return orders;
  }

  async getUserProductOrders(userId: string, productId: string) {
    const orders = await this.orderModel.find({ userId, productId }).exec();
    return orders;
  }
}
