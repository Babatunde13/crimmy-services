import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { ORDER_SERVICE, OWNER_SERVICE, PRODUCT_SERVICE } from './constants';
import { generateToken } from './utils/tokens';
import {
  OrderServiceClient,
  ProductServiceClient,
  OwnerServiceClient,
} from './types/types';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { LoginDto, RegisterDto, UpdateOwnerDto } from './dto/owner.dto';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';

@Injectable()
export class AppService {
  private orderService: OrderServiceClient;
  private ownerService: OwnerServiceClient;
  private productService: ProductServiceClient;

  constructor(
    @Inject(ORDER_SERVICE) private readonly orderClient: ClientGrpc,
    @Inject(OWNER_SERVICE) private readonly ownerClient: ClientGrpc,
    @Inject(PRODUCT_SERVICE) private readonly productClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderService =
      this.orderClient.getService<OrderServiceClient>('OrderService');
    this.ownerService =
      this.ownerClient.getService<OwnerServiceClient>('OwnerService');
    this.productService =
      this.productClient.getService<ProductServiceClient>('ProductService');
  }

  async getProduct(id: string) {
    return this.productService.getProduct({ id }).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }

  async createProduct(ownerId: string, data: CreateProductDto) {
    return this.productService.createProduct({ ...data, ownerId }).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }

  async deleteProduct(id: string) {
    return this.productService.deleteProduct({ id }).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }

  async getProducts() {
    return this.productService.getProducts({}).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }

  async updateProduct(id: string, ownerId: string, data: UpdateProductDto) {
    return this.productService.updateProduct({ ...data, id, ownerId }).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }

  async getMyProducts(ownerId: string) {
    return this.productService.getMyProducts({ id: ownerId }).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }

  async register(data: RegisterDto) {
    return this.ownerService.register(data).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }

  async login(data: LoginDto) {
    const owner = await firstValueFrom(
      this.ownerService.login(data).pipe(
        catchError((error) => {
          if (error.code === 5) {
            throw new NotFoundException(error.message);
          }

          throw new BadRequestException(error.message);
        }),
      ),
    );

    const token = generateToken(owner.id);
    return { owner, token };
  }

  async getOwner(id: string) {
    return this.ownerService.getOwner({ id }).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }

  async updateOwner(id: string, data: UpdateOwnerDto) {
    return this.ownerService.updateOwner({ ...data, id }).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }

  async createOrder(ownerId: string, data: CreateOrderDto) {
    return this.orderService.createOrder({ ...data, ownerId }).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }

  async getMyOrders(ownerId: string) {
    return this.orderService.getMyOrders({ ownerId }).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }

  async getMySingleOrder(id: string, ownerid: string) {
    return this.orderService
      .getMySingleOrder({
        orderId: id,
        ownerId: ownerid,
      })
      .pipe(
        catchError((error) => {
          if (error.code === 5) {
            throw new NotFoundException(error.message);
          }

          throw new BadRequestException(error.message);
        }),
      );
  }

  async getProductOrders(productId: string, ownerId: string) {
    const product = await firstValueFrom(
      this.productService.getProduct({ id: productId }).pipe(
        catchError((error) => {
          if (error.code === 5) {
            throw new NotFoundException(error.message);
          }

          throw new BadRequestException(error.message);
        }),
      ),
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You are not allowed to view orders for this product',
      );
    }

    return this.orderService.getProductOrders({ productId });
  }

  async updateOrder(id: string, data: UpdateOrderDto) {
    return this.orderService.updateOrder({ ...data, id }).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }
}
