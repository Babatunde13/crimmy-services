import { Injectable, ValidationPipe, ValidationError } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

type ValidationErrors = {
  [key: string]: string;
};

export class ValidationException extends BadRequestException {
  constructor(errors: ValidationErrors) {
    super(errors);
  }
}

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new ValidationException(this.formatErrors(validationErrors));
      },
      whitelist: true,
      stopAtFirstError: false,
      errorHttpStatusCode: 422,
    });
  }

  private formatErrors(validationErrors: ValidationError[]): ValidationErrors {
    const formattedErrors = {};

    validationErrors.forEach((error) => {
      if (error.children && error.children.length > 0) {
        formattedErrors[error.property] = this.formatErrors(error.children);
        return;
      }
      if (error.constraints) {
        formattedErrors[error.property] = Object.values(error.constraints).join(
          ', ',
        );
      }
    });

    return formattedErrors;
  }
}
