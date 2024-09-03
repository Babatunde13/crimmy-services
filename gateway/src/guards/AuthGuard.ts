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
import { UserServiceClient } from '../types/interfaces';
import { validateToken } from 'src/utils/tokens';

@Injectable()
export class AuthGuard implements CanActivate {
  private userService: UserServiceClient;

  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService =
      this.userClient.getService<UserServiceClient>('UserService');
  }

  private async getUser(id: string) {
    const userResp = await firstValueFrom(
      this.userService.getUser({ id }).pipe(
        catchError(() => {
          throw new HttpException(
            'Unauthorized access',
            HttpStatus.UNAUTHORIZED,
          );
        }),
      ),
    );

    return userResp?.user;
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

    const user = await this.getUser((decoded as any).id);
    if (!user) {
      throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = await this.validateRequest(request);
    request.user = user;
    return true;
  }
}
