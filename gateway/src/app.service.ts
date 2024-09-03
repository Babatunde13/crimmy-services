import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { ORDER_SERVICE, USER_SERVICE, PRODUCT_SERVICE } from './constants';
import { generateToken } from './utils/tokens';
import {
  OrderServiceClient,
  ProductServiceClient,
  UserServiceClient,
} from './types/interfaces';

@Injectable()
export class AppService {
  private orderService: OrderServiceClient;
  private userService: UserServiceClient;
  private productService: ProductServiceClient;

  constructor(
    @Inject(ORDER_SERVICE) private readonly orderClient: ClientGrpc,
    @Inject(USER_SERVICE) private readonly userClient: ClientGrpc,
    @Inject(PRODUCT_SERVICE) private readonly productClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderService =
      this.orderClient.getService<OrderServiceClient>('OrderService');
    this.userService =
      this.userClient.getService<UserServiceClient>('UserService');
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

  loginUser(data: any) {
    return this.userService.loginUser(data).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }

  async login(data: any) {
    const user = await firstValueFrom(this.loginUser(data));
    delete user.password;
    const token = generateToken(user.id);
    return { user, token };
  }

  async createProduct(data: any) {
    return this.productService.createProduct(data).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }

  async deleteProduct(id: string) {
    return this.productService.deleteProduct({ id });
  }

  async getProducts() {
    return this.productService.getProducts({});
  }

  async createUser(data: any) {
    return this.userService.createUser(data);
  }

  async deleteUser(id: string) {
    return this.userService.deleteUser({ id });
  }

  async getUser(id: string) {
    return this.userService.getUser({ id });
  }

  async getOrders() {
    return this.orderService.getOrders({});
  }

  async createOrder(data: any) {
    return this.orderService.createOrder(data).pipe(
      catchError((error) => {
        if (error.code === 5) {
          throw new NotFoundException(error.message);
        }

        throw new BadRequestException(error.message);
      }),
    );
  }

  async deleteOrder(id: string) {
    return this.orderService.deleteOrder({ id });
  }

  async getOrdersByUser(user_id: string) {
    return this.orderService.getOrdersByUser({ user_id });
  }

  async getOrderById(id: string) {
    return this.orderService.getOrderById({ id });
  }

  async updateUser(id: string, data: any) {
    return this.userService.updateUser({ ...data, id });
  }

  async getProductOrders(productId: string) {
    return this.orderService.getProductOrders({ productId });
  }

  async getUserProductOrders(userId: string, productId: string) {
    return this.orderService.getUserProductOrders({ userId, productId });
  }
}
