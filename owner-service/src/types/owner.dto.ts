export interface OwnerDto {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterDto {
  email: string;
  name?: string;
  phone: string;
  address?: string;
  password: string;
}

export interface UpdateOwnerDto {
  id: string;
  name?: string;
  phone?: string;
  address?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
