'use client';

import { useState } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

interface AddToCartProps {
  product: Product;
}

export default function AddToCart({ product }: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);

  const addToCart = () => {
    // Get existing cart from localStorage
    const existingCart = localStorage.getItem('cart');
    const cart = existingCart ? JSON.parse(existingCart) : [];

    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex((item: any) => item._id === product._id);

    if (existingItemIndex > -1) {
      // Update quantity if product exists
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new product if it doesn't exist
      cart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity,
      });
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Show success message
    alert('Product added to cart!');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="text-gray-600">
          Quantity:
        </label>
        <input
          type="number"
          id="quantity"
          min="1"
          max={product.stock}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="border rounded px-2 py-1 w-20"
        />
      </div>
      <button
        onClick={addToCart}
        disabled={product.stock === 0}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Add to Cart
      </button>
    </div>
  );
} 