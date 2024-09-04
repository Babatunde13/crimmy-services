import { status } from '@grpc/grpc-js';
import mongoose from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { CreateProductDto, UpdateProductDto } from '../types/product.dto';

export const isValidId = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const validateCreateProductDto = (data: CreateProductDto) => {
  const errors = [];
  if (!data.ownerId || !isValidId(data.ownerId)) {
    errors.push('Invalid owner ID');
  }

  if (!data.name) {
    errors.push('Name is required');
  } else if (data.name.length < 3) {
    errors.push('Name is too short');
  }

  if (!data.price || data.price < 0) {
    errors.push('Invalid price');
  }

  if (!data.quantity || data.quantity < 0) {
    errors.push('Invalid quantity');
  }

  if (!data.description) {
    errors.push('Description is required');
  } else if (data.description.length < 3) {
    errors.push('Description is too short');
  }

  if (!data.images || data.images.length === 0) {
    errors.push('Images are required');
  }

  if (!data.tags || data.tags.length === 0) {
    errors.push('Tags are required');
  }

  if (!data.category) {
    errors.push('Category is required');
  }

  if (errors.length) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: errors.join(', '),
    });
  }
};

export const validateUpdateOrder = (data: UpdateProductDto) => {
  const errors = [];
  if (!isValidId(data.id)) {
    errors.push('Invalid ID');
  }

  if (data.price && data.price < 0) {
    errors.push('Invalid price');
  }

  if (data.quantity && data.quantity < 0) {
    errors.push('Invalid quantity');
  }

  if (data.name && data.name.length < 3) {
    errors.push('Name is too short');
  }

  if (data.description && data.description.length < 3) {
    errors.push('Description is too short');
  }

  if (data.images && data.images.length === 0) {
    errors.push('Images are required');
  }

  if (data.tags && data.tags.length === 0) {
    errors.push('Tags are required');
  }

  if (data.category && data.category.length === 0) {
    errors.push('Category is required');
  }

  if (errors.length) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: errors.join(', '),
    });
  }

  return true;
};
