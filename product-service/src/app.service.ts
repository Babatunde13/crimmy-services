import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './models/Product';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { status } from '@grpc/grpc-js';
import { CreateProductDto, UpdateProductDto } from './types/product.dto';
import { isValidId, validateCreateProductDto } from './validators/validator';

interface OwnerServiceClient {
  getOwner(data: { id: string }): Observable<any>;
}

@Injectable()
export class AppService {
  private ownerService: OwnerServiceClient;

  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientGrpc,
    @Inject('OWNER_SERVICE') private readonly ownerClient: ClientGrpc,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  onModuleInit() {
    this.ownerService =
      this.ownerClient.getService<OwnerServiceClient>('OwnerService');
  }

  async getProduct(id: string) {
    if (!isValidId(id)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Invalid product ID',
      });
    }

    const product = await this.productModel.findOne({ _id: id }).exec();
    if (!product) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Product not found',
      });
    }
    return product;
  }

  async createProduct(product: CreateProductDto) {
    validateCreateProductDto(product);
    const ownerResp = await firstValueFrom(
      this.ownerService.getOwner({ id: product.ownerId }),
    );
    if (!ownerResp) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Owner not found',
      });
    }
    const createdProduct = new this.productModel({
      ...product,
      owner: ownerResp,
    });
    await createdProduct.save();
    return createdProduct;
  }

  async deleteProduct(id: string) {
    if (!isValidId(id)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Invalid product ID',
      });
    }

    const deletedProduct = await this.productModel.findOneAndDelete({
      _id: id,
    });

    if (!deletedProduct) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Product not found',
      });
    }

    // emit event to product queue so we can remove cache
    await this.amqpConnection.publish('app_events', 'product.deleted', {
      productId: deletedProduct._id,
    });
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
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async getMyProducts(ownerId: string) {
    const products = await this.productModel.find({ ownerId }).exec();
    return {
      products,
      message: 'Owner products retrieved successfully',
      success: true,
    };
  }

  /**
   * Event handler for owner updated event
   * We want to update the product.owner information
   */
  @RabbitSubscribe({
    exchange: 'app_events',
    routingKey: 'owner.updated',
    queue: 'owner_updated_queue',
  })
  async handleOwnerUpdate(msg: any) {
    const { ownerId, owner } = msg;

    await this.productModel.updateMany({ ownerId }, { owner });
  }

  async updateProduct(
    product: UpdateProductDto & { id: string; ownerId: string },
  ) {
    const { id } = product;
    delete product.id;
    const updatedProduct = await this.productModel
      .findOneAndUpdate({ _id: id, ownerId: product.ownerId }, product, {
        new: true,
      })
      .exec();

    // publish to product queue
    await this.amqpConnection.publish('app_events', 'product.updated', {
      productId: updatedProduct._id,
      product: updatedProduct,
    });

    return updatedProduct;
  }

  /**
   * Event handler for decreasing products quantity when order is created
   */
  @RabbitSubscribe({
    exchange: 'app_events',
    routingKey: 'order.created',
    queue: 'order_created_queue',
  })
  async handleProductQuantityUpdated(msg: any) {
    const { products } = msg;

    for (const product of products) {
      await this.productModel.updateOne(
        { _id: product.id },
        { $inc: { quantity: -product.quantity } },
      );
    }
  }
}
