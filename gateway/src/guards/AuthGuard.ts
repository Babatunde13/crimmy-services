import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { OwnerServiceClient } from '../types/types';
import { validateToken } from 'src/utils/tokens';

@Injectable()
export class AuthGuard implements CanActivate {
  private ownerService: OwnerServiceClient;

  constructor(
    @Inject('OWNER_SERVICE') private readonly ownerClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.ownerService =
      this.ownerClient.getService<OwnerServiceClient>('OwnerService');
  }

  private async getOwner(id: string) {
    const owner = await firstValueFrom(
      this.ownerService.getOwner({ id }).pipe(
        catchError(() => {
          throw new HttpException(
            'Unauthorized access',
            HttpStatus.UNAUTHORIZED,
          );
        }),
      ),
    );

    return owner;
  }

  private async validateRequest(request: any) {
    if (!request.headers.authorization) {
      throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
    }
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
    }

    let decoded;
    try {
      decoded = validateToken(token);
    } catch (error) {
      throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
    }
    if (!decoded || !(decoded as any).id) {
      throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
    }

    const owner = await this.getOwner((decoded as any).id);
    if (!owner) {
      throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
    }

    return owner;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const owner = await this.validateRequest(request);
    request.owner = owner;
    return true;
  }
}
