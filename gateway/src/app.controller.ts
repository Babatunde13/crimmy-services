import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './guards/AuthGuard';
import { AuthOwner } from './decorators/user.decorator';
import { OwnerDto } from './types/types';
import {
  GetOwnerByIdDto,
  LoginDto,
  RegisterDto,
  UpdateOwnerDto,
} from './dto/owner.dto';
import {
  CreateProductDto,
  GetProductDto,
  UpdateProductDto,
} from './dto/product.dto';
import {
  CreateOrderDto,
  GetOrderByIdDto,
  UpdateOrderDto,
} from './dto/order.dto';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Owner')
@Controller()
export class OwnerController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Register', description: 'Register a new user' })
  @Post('auth/signup')
  register(@Body() data: RegisterDto) {
    return this.appService.register(data);
  }

  @ApiOperation({ summary: 'Login' })
  @Post('auth/login')
  login(@Body() data: LoginDto) {
    return this.appService.login(data);
  }

  @ApiOperation({ summary: 'Update Owner' })
  @ApiSecurity('bearer')
  @Put('users')
  @UseGuards(AuthGuard)
  updateOwner(@Body() data: UpdateOwnerDto, @AuthOwner('id') id: string) {
    return this.appService.updateOwner(id, data);
  }

  @ApiOperation({ summary: 'Get Auth Owner' })
  @ApiSecurity('bearer')
  @Get('users/profile')
  @UseGuards(AuthGuard)
  getAuthOwner(@AuthOwner() owner: OwnerDto) {
    return owner;
  }

  @ApiOperation({ summary: 'Get Owner By ID' })
  @ApiSecurity('bearer')
  @Get('users/:id')
  getOwner(@Param() data: GetOwnerByIdDto) {
    return this.appService.getOwner(data.id);
  }
}

@ApiTags('Product')
@Controller()
export class ProductController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Get All Products' })
  @Get('products')
  getProducts() {
    return this.appService.getProducts();
  }

  @ApiOperation({ summary: 'Get My Products' })
  @ApiSecurity('bearer')
  @Get('products/mine')
  @UseGuards(AuthGuard)
  getMyProducts(@AuthOwner('id') ownerId: string) {
    return this.appService.getMyProducts(ownerId);
  }

  @ApiOperation({ summary: 'Get Product By ID' })
  @Get('products/:id')
  getProduct(@Param() { id }: GetProductDto) {
    return this.appService.getProduct(id);
  }

  @ApiOperation({ summary: 'Create Product' })
  @ApiSecurity('bearer')
  @Post('products')
  @UseGuards(AuthGuard)
  createProduct(
    @Body() data: CreateProductDto,
    @AuthOwner('id') ownerId: string,
  ) {
    return this.appService.createProduct(ownerId, data);
  }

  @ApiOperation({ summary: 'Delete Product' })
  @ApiSecurity('bearer')
  @Delete('products/:id')
  @UseGuards(AuthGuard)
  deleteProduct(@Param() { id }: GetOwnerByIdDto) {
    return this.appService.deleteProduct(id);
  }

  @ApiOperation({ summary: 'Update Product' })
  @ApiSecurity('bearer')
  @Put('products/:id')
  @UseGuards(AuthGuard)
  updateProduct(
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
    @AuthOwner('id') ownerId: string,
  ) {
    return this.appService.updateProduct(id, ownerId, data);
  }
}

@ApiTags('Order')
@Controller()
export class OrderController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Create Order' })
  @ApiSecurity('bearer')
  @Post('orders')
  @UseGuards(AuthGuard)
  createOrder(@Body() data: CreateOrderDto, @AuthOwner('id') ownerId: string) {
    return this.appService.createOrder(ownerId, data);
  }

  @ApiOperation({ summary: 'Get My Order By ID' })
  @ApiSecurity('bearer')
  @Get('orders/:id')
  @UseGuards(AuthGuard)
  getOrderById(
    @Param() { id }: GetOrderByIdDto,
    @AuthOwner('id') ownerId: string,
  ) {
    return this.appService.getMySingleOrder(id, ownerId);
  }

  @ApiOperation({ summary: 'Get My Orders' })
  @ApiSecurity('bearer')
  @Get('orders')
  @UseGuards(AuthGuard)
  async getOrders(@AuthOwner('id') ownerId: string) {
    return this.appService.getMyOrders(ownerId);
  }

  @ApiOperation({ summary: 'Get Product Orders(for product owner)' })
  @ApiSecurity('bearer')
  @Get('products/:id/orders')
  @UseGuards(AuthGuard)
  getProductOrders(
    @Param() { id: productId }: GetOrderByIdDto,
    @AuthOwner('id') ownerId: string,
  ) {
    return this.appService.getProductOrders(productId, ownerId);
  }

  @ApiOperation({ summary: 'Update Order' })
  @ApiSecurity('bearer')
  @Put('orders/:id')
  @UseGuards(AuthGuard)
  updateOrder(@Param() { id }: GetOrderByIdDto, @Body() data: UpdateOrderDto) {
    return this.appService.updateOrder(id, data);
  }
}
