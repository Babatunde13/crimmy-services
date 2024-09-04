import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Owner, OwnerDocument } from './models/Owner';
import {
  validateId,
  validateLogin,
  validateSignup,
  validateUpdateOwner,
} from './validators/validator';
import { LoginDto, RegisterDto, UpdateOwnerDto } from './types/owner.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Owner.name) private ownerModel: Model<OwnerDocument>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async getOwnerById(id: string): Promise<Owner> {
    validateId(id);
    const owner = await this.ownerModel.findOne({ _id: id }).exec();
    return owner;
  }

  async register(owner: RegisterDto): Promise<Owner> {
    validateSignup(owner);
    const emailExists = await this.ownerModel.findOne({ email: owner.email });
    if (emailExists) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Email already exists',
      });
    }

    const phoneExists = await this.ownerModel.findOne({ phone: owner.phone });
    if (phoneExists) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Phone number already exists',
      });
    }
    owner.password = await bcrypt.hash(owner.password, 10);
    const createdOwner = new this.ownerModel(owner);
    await createdOwner.save();

    return createdOwner;
  }

  async updateOwner(data: UpdateOwnerDto): Promise<Owner> {
    validateUpdateOwner(data);
    const update: Partial<Owner> = {};
    if (data.phone) {
      const phoneExists = await this.ownerModel.findOne({
        phone: data.phone,
        _id: { $ne: data.id },
      });
      if (phoneExists) {
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: 'Phone number already exists',
        });
      }
      update.phone = data.phone;
    }

    if (data.address) {
      update.address = data.address;
    }
    if (data.name) {
      update.name = data.name;
    }
    const updatedOwner = await this.ownerModel
      .findOneAndUpdate({ _id: data.id }, update, { new: true })
      .exec();

    await this.amqpConnection.publish('app_events', 'owner.updated', {
      ownerId: updatedOwner._id,
      owner: updatedOwner,
    });

    return updatedOwner;
  }

  async login(data: LoginDto): Promise<Owner> {
    validateLogin(data);
    const owner = await this.ownerModel
      .findOne({ email: data.email })
      .select('+password')
      .exec();
    if (!owner) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Invalid email or password',
      });
    }

    const match = await bcrypt.compare(data.password, owner.password);
    if (!match) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Invalid email or password',
      });
    }

    return owner;
  }
}
