import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';
import { RegisterDto, UpdateOwnerDto } from './types/owner.dto';

@Controller('owner')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('OwnerService', 'Register')
  async register(data: RegisterDto) {
    return this.appService.register(data);
  }

  @GrpcMethod('OwnerService', 'GetOwner')
  getOwnerById(data: { id: string }) {
    return this.appService.getOwnerById(data.id);
  }

  @GrpcMethod('OwnerService', 'UpdateOwner')
  updateOwner(data: UpdateOwnerDto) {
    return this.appService.updateOwner(data);
  }

  @GrpcMethod('OwnerService', 'Login')
  login(data: any) {
    return this.appService.login(data);
  }
}
