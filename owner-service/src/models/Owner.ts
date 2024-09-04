import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Owner extends Document {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  address: string;

  @Prop({ select: false })
  password: string;

  @Prop({ default: true })
  active: boolean;
}

export const OwnerSchema = SchemaFactory.createForClass(Owner);

export type OwnerDocument = Owner & Document;
