import { Observable } from 'rxjs';
import { CreateOrderDto, UpdateOrderDto } from '../dto/order.dto';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';

export interface OwnerDto {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  category: string;
  images: string[];
  quantity: number;
  ownerId: string;
  owner: OwnerDto;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDto {
  id: string;
  ownerId: string;
  quantity: number;
  status: string;
  products: { id: string; quantity: number }[];
  amount: number;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryDate: Date;
  customerNotes: string;
  productsCache: Record<string, ProductDto>;
  createdAt: Date;
  updatedAt: Date;
}

interface RegisterDto {
  email: string;
  name?: string;
  phone: string;
  address?: string;
  password: string;
}

interface UpdateOwnerDto {
  id: string;
  name?: string;
  phone?: string;
  address?: string;
}

interface LoginDto {
  email: string;
  password: string;
}

export interface OrderServiceClient {
  createOrder(order: CreateOrderDto & { ownerId: string }): Observable<any>;
  getMyOrders(data: { ownerId: string }): Observable<any>;
  updateOrder(order: UpdateOrderDto & { id: string }): Observable<any>;
  getMySingleOrder(data: { ownerId: string; orderId: string }): Observable<any>;
  getProductOrders(data: { productId: string }): Observable<any>;
}

export interface OwnerServiceClient {
  register(data: RegisterDto): Observable<OwnerDto>;
  getOwner(data: { id: string }): Observable<OwnerDto>;
  updateOwner(data: UpdateOwnerDto): Observable<OwnerDto>;
  login(data: LoginDto): Observable<OwnerDto>;
}

export interface ProductServiceClient {
  getProduct(data: { id: string }): Observable<any>;
  createProduct(
    product: CreateProductDto & { ownerId: string },
  ): Observable<any>;
  deleteProduct(data: { id: string }): Observable<any>;
  getProducts({}): Observable<any>;
  getMyProducts(data: { id: string }): Observable<any>;
  updateProduct(
    product: UpdateProductDto & { id: string; ownerId: string },
  ): Observable<any>;
}
