import { Observable } from 'rxjs';

export interface OrderServiceClient {
  createOrder(order: any): Observable<any>;
  getOrderById(id: { id: string }): Observable<any>;
  getOrders({}): Observable<any>;
  getOrdersByUser(data: { user_id: string }): Observable<any>;
  deleteOrder(data: { id: string }): Observable<any>;
  getProductOrders(data: { productId: string }): Observable<any>;
  getUserProductOrders(data: {
    userId: string;
    productId: string;
  }): Observable<any>;
}

export interface UserServiceClient {
  createUser(user: any): Observable<any>;
  getUser(data: { id: string }): Observable<any>;
  deleteUser(data: { id: string }): Observable<any>;
  updateUser(data: any): Observable<any>;
  loginUser(data: { email: string; password: string }): Observable<any>;
}

export interface ProductServiceClient {
  getProduct(data: { id: string }): Observable<any>;
  createProduct(product: any): Observable<any>;
  deleteProduct(data: { id: string }): Observable<any>;
  getProducts({}): Observable<any>;
}
