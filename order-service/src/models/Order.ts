import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Order {
  @Prop()
  quantity: number;

  @Prop()
  userId: string;

  @Prop()
  productId: string;

  @Prop({ type: Object })
  user: any;

  @Prop({ type: Object })
  product: any;

  @Prop()
  status: string;

  @Prop()
  totalPrice: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

export interface OrderDocument extends Order, Document {}
