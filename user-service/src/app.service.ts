import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './models/User';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).exec();
    return { user };
  }

  async createUser(user: any) {
    user.password = await bcrypt.hash(user.password, 10);
    const createdUser = new this.userModel(user);
    await createdUser.save();

    return createdUser;
  }

  async deleteUser(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    return deletedUser;
  }

  async updateUser(id: string, user: any) {
    console.log('Updating user in user-service:', id, user);
    delete user.id;
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, user, { new: true })
      .exec();

    delete updatedUser.password;
    // publish to user queue
    this.amqpConnection.publish('app_events', 'user.updated', {
      userId: updatedUser._id,
      user: updatedUser,
    });

    return updatedUser;
  }
}
