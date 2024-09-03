import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop()
  name: string;

  @Prop()
  price: number;

  @Prop()
  quantity: number;

  @Prop()
  description: string;

  @Prop()
  images: string[];

  @Prop()
  tags: string[];

  @Prop()
  category: string;

  @Prop()
  userId: string;

  @Prop({ type: Object })
  user: any;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

export type ProductDocument = Product & Document;
