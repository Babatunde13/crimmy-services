import { RpcException } from '@nestjs/microservices';
import { LoginDto, RegisterDto, UpdateOwnerDto } from '../types/owner.dto';
import { status } from '@grpc/grpc-js';
import mongoose from 'mongoose';

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isPhone = (phone: string) => {
  // phone should start with 0 or +234 the next two digits shoukb be
  // 80, 80, 91, 91, 70, 71
  const phoneRegex = /^(0|\+234)(80|81|90|91|70|71)\d{8}$/;
  return phoneRegex.test(phone);
};

const isValidId = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// password should contain at least 8 to 50 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;
export const validateSignup = (data: RegisterDto) => {
  const errors = [];
  if (!data.email) {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Email is invalid');
  }

  if (!data.phone) {
    errors.push('Phone is required');
  } else if (!isPhone(data.phone)) {
    errors.push('Phone is invalid');
  }

  if (!passwordRegex.test(data.password)) {
    errors.push('Password is invalid');
  }

  if (data.name && data.name.length < 3) {
    errors.push('Name is too short');
  }

  if (data.address && data.address.length < 3) {
    errors.push('Address is too short');
  }

  if (errors.length) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: errors.join(', '),
    });
  }

  return true;
};

export const validateLogin = (data: LoginDto) => {
  const errors = [];
  if (!data.email) {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Email is invalid');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  if (errors.length) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: errors.join(', '),
    });
  }

  return true;
};

export const validateUpdateOwner = (data: UpdateOwnerDto) => {
  const errors = [];
  if (!isValidId(data.id)) {
    errors.push('Invalid ID');
  }
  if (data.phone && !isPhone(data.phone)) {
    errors.push('Phone is invalid');
  }

  if (data.name && data.name.length < 3) {
    errors.push('Name is too short');
  }

  if (data.address && data.address.length < 3) {
    errors.push('Address is too short');
  }

  if (errors.length) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: errors.join(', '),
    });
  }

  return true;
};

export const validateId = (id: string) => {
  if (!isValidId(id)) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: 'Invalid ID',
    });
  }

  return true;
};
