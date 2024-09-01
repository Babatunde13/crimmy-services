import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller('user')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: any) {
    return this.appService.createUser(data);
  }

  @GrpcMethod('UserService', 'GetUser')
  getUser(data: any) {
    return this.appService.getUserById(data.id);
  }

  @GrpcMethod('UserService', 'DeleteUser')
  deleteUser(data: any) {
    return this.appService.deleteUser(data.id);
  }

  @GrpcMethod('UserService', 'UpdateUser')
  updateUser(data: any) {
    return this.appService.updateUser(data.id, data);
  }
}
