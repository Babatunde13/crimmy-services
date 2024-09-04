import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ProductOrderDto {
  @ApiProperty()
  @IsString()
  @IsMongoId()
  id: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.trim())
  shippingAddress: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.trim())
  billingAddress: string;

  @ApiProperty()
  @IsDate({ message: 'Delivery date must be a valid date' })
  @Transform(({ value }) => new Date(value))
  deliveryDate: string;

  @ApiProperty()
  @IsString()
  @IsEnum(['Credit Card', 'PayPal', 'Bank Transfer'], {
    message:
      'Payment method must be either Credit Card, PayPal or Bank Transfer',
  })
  paymentMethod: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.trim())
  customerNotes?: string;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => ProductOrderDto)
  products: ProductOrderDto[];
}

export class UpdateOrderDto {
  @ApiProperty()
  @IsString()
  @IsEnum(['Pending', 'Shipped', 'Delivered', 'Cancelled'], {
    message: 'Status must be either Pending, Shipped, Delivered or Cancelled',
  })
  status: string;

  @ApiProperty()
  @IsString()
  @IsEnum(['Paid', 'Pending', 'Failed'], {
    message: 'Payment status must be either Paid, Pending or Failed',
  })
  paymentStatus: string;
}

export class GetOrderByIdDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
