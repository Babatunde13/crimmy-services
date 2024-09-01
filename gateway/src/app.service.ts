import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { ORDER_SERVICE, USER_SERVICE, PRODUCT_SERVICE } from './constants';

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

interface ProductServiceClient {
  getProduct(data: { id: string }): Observable<any>;
  createProduct(product: any): Observable<any>;
  deleteProduct(data: { id: string }): Observable<any>;
  getProducts({}): Observable<any>;
}

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
    return this.productService.getProduct({ id });
  }

  async createProduct(data: any) {
    const userResp = await firstValueFrom(
      this.userService.getUser({ id: data.userId }),
    );
    console.log('User:', userResp);
    if (!userResp || !userResp.user) {
      throw new BadRequestException('User not found');
    }
    data.user = userResp.user;
    return this.productService.createProduct(data);
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
    const userResp = await firstValueFrom(
      this.userService.getUser({ id: data.userId }),
    );
    if (!userResp || !userResp.user) {
      throw new BadRequestException('User not found');
    }
    const productResp = await firstValueFrom(
      this.productService.getProduct({ id: data.productId }),
    );
    if (!productResp || !productResp.product) {
      throw new BadRequestException('Product not found');
    }

    if (
      productResp.product.quantity < data.quantity ||
      productResp.product.quantity === 0
    ) {
      throw new BadRequestException('Product out of stock');
    }
    console.log('Product:', productResp.product);
    console.log('User:', userResp.user);
    console.log('Creating order in gateway:', {
      ...data,
      status: 'pending',
      totalPrice: productResp.product.price * data.quantity,
      product: productResp.product,
      user: userResp.user,
    });
    return this.orderService.createOrder({
      ...data,
      status: 'pending',
      totalPrice: productResp.product.price * data.quantity,
      product: productResp.product,
      user: userResp.user,
    });
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
    console.log('Updating user in gateway service:', id, data);
    return this.userService.updateUser({ ...data, id });
  }

  async getProductOrders(productId: string) {
    return this.orderService.getProductOrders({ productId });
  }
}
