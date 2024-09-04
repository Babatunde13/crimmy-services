export interface CreateProductDto {
  name: string;
  price: number;
  quantity: number;
  description: string;
  images: string[];
  tags: string[];
  category: string;
  ownerId: string;
}

export interface UpdateProductDto {
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
  description?: string;
  images?: string[];
  tags?: string[];
  category?: string;
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
  ownerId: string;
  owner: any;
}
