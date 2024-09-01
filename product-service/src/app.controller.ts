import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller('product')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('ProductService', 'GetProduct')
  getProduct(data: { id: string }) {
    return this.appService.getProduct(data.id);
  }

  @GrpcMethod('ProductService', 'CreateProduct')
  createProduct(data: any) {
    return this.appService.createProduct(data);
  }

  @GrpcMethod('ProductService', 'DeleteProduct')
  deleteProduct(data: { id: string }) {
    return this.appService.deleteProduct(data.id);
  }

  @GrpcMethod('ProductService', 'GetProducts')
  getProducts() {
    return this.appService.getProducts();
  }
}
