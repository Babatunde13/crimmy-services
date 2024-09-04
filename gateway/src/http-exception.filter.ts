import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationException } from './custom-validation-pipe';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    if (exception instanceof ValidationException) {
      response.status(exception.getStatus()).json({
        success: false,
        error: exception.getResponse(),
        message: 'Validation failed',
      });

      return;
    } else if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();
      const message = this.transformMessage(exception.getResponse());
      response.status(httpStatus).json({
        success: false,
        message,
      });

      return;
    } else {
      const { message, status } = this.parseUnhandleException();
      response.status(status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message,
      });
    }
  }

  private transformMessage(message: string | object): string {
    if (typeof message === 'string') {
      return message;
    }

    //validation pipe error
    if (Array.isArray(message['message'])) {
      return message['message'][0];
    }
    return message['message'] || 'An unknown error occured';
  }

  private parseUnhandleException(): {
    message: string;
    status: number;
  } {
    return {
      message: 'An unknown error occured',
      status: HttpStatus.BAD_REQUEST,
    };
  }
}
