import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { status } from '@grpc/grpc-js';
import { Order, OrderDocument } from './models/Order';
import { CreateOrderDto, Product } from './types/order.dto';
import {
  isValidId,
  validateCreateOrder,
  validateUpdateOrder,
} from './validators/validator';

export interface OwnerServiceClient {
  getOwner(data: { id: string }): Observable<any>;
}

interface ProductServiceClient {
  getProduct(data: { id: string }): Observable<Product>;
}

@Injectable()
export class AppService {
  private ownerService: OwnerServiceClient;
  private productService: ProductServiceClient;
  TTL = 1000 * 60 * 60 * 24;

  constructor(
    @Inject('OWNER_SERVICE') private readonly ownerClient: ClientGrpc,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientGrpc,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  onModuleInit() {
    this.ownerService =
      this.ownerClient.getService<OwnerServiceClient>('OwnerService');
    this.productService =
      this.productClient.getService<ProductServiceClient>('ProductService');
  }

  async createOrder(order: CreateOrderDto) {
    validateCreateOrder(order);
    const owner = await firstValueFrom(
      this.ownerService.getOwner({ id: order.ownerId }).pipe(
        catchError(() => {
          throw new RpcException({
            code: status.NOT_FOUND,
            message: 'Owner not found',
          });
        }),
      ),
    );
    if (!owner) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Owner not found',
      });
    }
    const productCacheMap: { [key: string]: Product } = {};
    let totalPrice = 0;
    let totalQuantity = 0;
    for (const product of order.products) {
      let productCache = await this.cacheManager.get<Product>(
        `product_${product.id}`,
      );
      if (!productCache) {
        productCache = await firstValueFrom(
          this.productService.getProduct({ id: product.id }).pipe(
            catchError(() => {
              throw new RpcException({
                code: status.NOT_FOUND,
                message: `Product ${product.id} not found`,
              });
            }),
          ),
        );

        if (!productCache) {
          throw new RpcException({
            code: status.NOT_FOUND,
            message: `Product ${product.id} not found`,
          });
        }

        delete productCache.owner;
      }

      if (
        productCache.quantity < product.quantity ||
        productCache.quantity <= 0
      ) {
        throw new RpcException({
          code: status.FAILED_PRECONDITION,
          message: `Product ${productCache.name} out of stock`,
        });
      }

      productCache.id = product.id;
      productCacheMap[product.id] = { ...productCache };
      productCache.quantity -= product.quantity;
      await this.cacheManager.set(
        `product_${product.id}`,
        productCache,
        this.TTL,
      );

      totalPrice += productCache.price * product.quantity;
      totalQuantity += product.quantity;
    }

    const createdOrder = await this.orderModel.create({
      ...order,
      quantity: totalQuantity,
      amount: totalPrice,
      productsCache: productCacheMap,
      owner: order.ownerId,
    });

    await this.amqpConnection.publish('app_events', 'order.created', {
      products: order.products,
    });

    return createdOrder;
  }
  async getMySingleOrder(id: string, ownerId: string) {
    if (!id || !ownerId || !isValidId(id) || !isValidId(ownerId)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Invalid order ID or owner ID',
      });
    }

    const order = await this.orderModel.findOne({ _id: id, owner: ownerId });
    return order;
  }

  async getMyOrders(ownerId: string) {
    const orders = await this.orderModel.find({ owner: ownerId }).exec();
    return orders;
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
  async handleProductUpdate(msg: { productId: string; product: Product }) {
    const { productId, product } = msg;

    const orders = await this.orderModel
      .find({ 'products.id': productId })
      .exec();
    for (const order of orders) {
      const productsCache = order.productsCache;
      productsCache[productId] = product;
      await this.cacheManager.set(`product_${productId}`, product, this.TTL);
      order.productsCache = productsCache;
      await order.save();
    }
  }

  /**
   * Event handler for product deleted event
   * We want to update the order information
   */
  @RabbitSubscribe({
    exchange: 'app_events',
    routingKey: 'product.deleted',
    queue: 'product_deleted_queue',
  })
  async handleProductDeletion(msg: { productId: string }) {
    const { productId } = msg;

    await this.cacheManager.del(`product_${productId}`);
  }

  async getProductOrders(productId: string) {
    const orders = await this.orderModel
      .find({ 'products.id': productId })
      .exec();
    return orders;
  }

  async updateOrder(order: any) {
    validateUpdateOrder(order);
    const updatedOrder = await this.orderModel
      .findOneAndUpdate({ _id: order.id }, order, { new: true })
      .exec();
    return updatedOrder;
  }
}
