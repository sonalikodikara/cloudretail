import { placeOrder } from '../../controllers/order.controller';
import { Order } from '../../models/order.model';
import { ProductService } from '../../services/product.service';

jest.mock('../../models/order.model');
jest.mock('../../services/product.service');

describe('OrderController Unit Tests', () => {

  let req, res;

  beforeEach(() => {
    req = {
      body: {
        product_id: 1,
        quantity: 2,
      },
      user: {
        id: 10,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should place an order successfully when stock is sufficient', async () => {
    ProductService.getProduct.mockResolvedValue({
      id: 1,
      stock: 10,
    });

    Order.create.mockResolvedValue({
      id: 100,
      user_id: 10,
      product_id: 1,
      quantity: 2,
    });

    await placeOrder(req, res);

    expect(ProductService.getProduct).toHaveBeenCalledWith(1);
    expect(Order.create).toHaveBeenCalledWith({
      user_id: 10,
      product_id: 1,
      quantity: 2,
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ id: 100 })
    );
  });

  it('should fail when stock is insufficient', async () => {
    ProductService.getProduct.mockResolvedValue({
      id: 1,
      stock: 1,
    });

    await placeOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Insufficient stock',
    });
  });

  it('should reject invalid quantity', async () => {
    req.body.quantity = 0;

    await placeOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid quantity',
    });
  });

});
