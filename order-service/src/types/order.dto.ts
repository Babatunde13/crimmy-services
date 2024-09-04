export interface ProductOrderDto {
  id: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  images: string[];
  tags: string[];
  category: string;
  owner: string;
}

export interface OrderDto {
  owner: string;
  products: ProductOrderDto[];
  quantity: number;
  amount: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress?: string;
  billingAddress?: string;
  paymentMethod: 'Credit Card' | 'PayPal' | 'Bank Transfer';
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  deliveryDate: Date;
  customerNotes: string;
  productsCache: Map<string, Product>;
}

export interface CreateOrderDto {
  ownerId: string;
  shippingAddress: string;
  billingAddress: string;
  deliveryDate?: string;
  paymentMethod: 'Credit Card' | 'PayPal' | 'Bank Transfer';
  customerNotes?: string;
  products: ProductOrderDto[];
}

export interface UpdateOrderDto {
  id: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
}
