import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '../types/order.dto';

class ProductOrderSchema {
  @Prop({ type: Types.ObjectId, required: true })
  id: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true, type: Types.ObjectId })
  owner: Types.ObjectId;

  @Prop([{ type: ProductOrderSchema }])
  products: ProductOrderSchema[];

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  amount: number;

  @Prop({
    default: 'Pending',
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
  })
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

  @Prop()
  shippingAddress?: string;

  @Prop()
  billingAddress?: string;

  @Prop({ enum: ['Credit Card', 'PayPal', 'Bank Transfer'] })
  paymentMethod: 'Credit Card' | 'PayPal' | 'Bank Transfer';

  @Prop({ enum: ['Paid', 'Pending', 'Failed'], default: 'Pending' })
  paymentStatus: 'Paid' | 'Pending' | 'Failed';

  @Prop()
  deliveryDate: Date;

  @Prop()
  customerNotes: string;

  @Prop({ type: Object })
  productsCache: Record<string, Product>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

export interface OrderDocument extends Order, Document {}
