'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Load cart items from localStorage
    const cart = localStorage.getItem('cart');
    if (cart) {
      const items = JSON.parse(cart);
      setCartItems(items);
      // Calculate total
      const cartTotal = items.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
      setTotal(cartTotal);
    }
  }, []);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    const updatedItems = cartItems.map((item) =>
      item._id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    // Recalculate total
    const newTotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(newTotal);
  };

  const removeItem = (itemId: string) => {
    const updatedItems = cartItems.filter((item) => item._id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    // Recalculate total
    const newTotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(newTotal);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid gap-4">
        {cartItems.map((item) => (
          <div
            key={item._id}
            className="border rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <p className="text-gray-600">${item.price}</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item._id, parseInt(e.target.value))
                }
                className="border rounded px-2 py-1 w-20"
              />
              <button
                onClick={() => removeItem(item._id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-right">
        <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
        <Link
          href="/checkout"
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 inline-block"
        >
          Sepeti Onayla
        </Link>
      </div>
    </div>
  );
} 