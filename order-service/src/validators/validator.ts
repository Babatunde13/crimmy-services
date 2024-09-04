import { status } from '@grpc/grpc-js';
import mongoose from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { CreateOrderDto, UpdateOrderDto } from '../types/order.dto';

export const isValidId = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const validateCreateOrder = (order: CreateOrderDto) => {
  const errors = [];
  if (!isValidId(order.ownerId)) {
    errors.push('Invalid owner ID');
  }

  if (!order.products || order.products.length === 0) {
    errors.push('Order must have at least one product');
  }

  let idx = 0;
  for (const product of order.products) {
    if (!isValidId(product.id)) {
      errors.push(`Invalid product ID at index ${idx + 1}`);
    }

    if (!product.quantity || product.quantity < 1) {
      errors.push(`Invalid quantity at index ${idx + 1}`);
    }

    idx++;
  }

  if (!order.shippingAddress) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: 'Shipping address is required',
    });
  }

  if (!order.billingAddress) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: 'Billing address is required',
    });
  }
  if (
    !order.deliveryDate ||
    isNaN(Date.parse(order.deliveryDate)) ||
    new Date(order.deliveryDate) < new Date()
  ) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: 'Invalid delivery date',
    });
  }

  if (
    order.paymentMethod &&
    !['Credit Card', 'PayPal', 'Bank Transfer'].includes(order.paymentMethod)
  ) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: 'Invalid payment method',
    });
  }
};

export const validateUpdateOrder = (data: UpdateOrderDto) => {
  const errors = [];
  if (!isValidId(data.id)) {
    errors.push('Invalid ID');
  }

  if (
    data.status &&
    !['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(data.status)
  ) {
    errors.push('Invalid status');
  }

  if (
    data.paymentStatus &&
    !['Paid', 'Pending', 'Failed'].includes(data.paymentStatus)
  ) {
    errors.push('Invalid payment status');
  }

  if (errors.length) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: errors.join(', '),
    });
  }

  return true;
};
