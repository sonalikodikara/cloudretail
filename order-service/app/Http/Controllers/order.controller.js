import { Order } from '../models/order.model';
import { ProductService } from '../services/product.service';

export const placeOrder = async (req, res) => {
  const { product_id, quantity } = req.body;
  const userId = req.user.id;

  if (quantity <= 0) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  // Check stock via product service
  const product = await ProductService.getProduct(product_id);

  if (product.stock < quantity) {
    return res.status(400).json({ message: 'Insufficient stock' });
  }

  const order = await Order.create({
    user_id: userId,
    product_id,
    quantity,
  });

  return res.status(201).json(order);
};
