'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export interface CartItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
  stock?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      
      let newItems: CartItem[];
      if (existingItem) {
        // If item exists, increase quantity
        newItems = state.items.map(item =>
          item._id === action.payload._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If item doesn't exist, add new item
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
        isOpen: true // Auto-open cart when item is added
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item._id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        // If quantity is 0 or negative, remove item
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: id });
      }

      const newItems = state.items.map(item =>
        item._id === id ? { ...item, quantity } : item
      );

      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen
      };

    case 'SET_CART_OPEN':
      return {
        ...state,
        isOpen: action.payload
      };

    case 'LOAD_CART':
      const total = action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: action.payload,
        total,
        itemCount
      };

    default:
      return state;
  }
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  total: 0,
  itemCount: 0
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Load cart from localStorage on mount (only if authenticated)
  useEffect(() => {
    if (session) {
      const savedCart = localStorage.getItem('shopping-cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    } else {
      // Clear cart if user is not authenticated
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [session]);

  // Save cart to localStorage whenever it changes (only if authenticated)
  useEffect(() => {
    if (session) {
      localStorage.setItem('shopping-cart', JSON.stringify(state.items));
    }
  }, [state.items, session]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    // Check if user is authenticated
    if (!session && status !== 'loading') {
      // Redirect to login page with return URL and message
      const currentPath = window.location.pathname;
      const loginUrl = `/login?message=${encodeURIComponent('Sepete ürün eklemek için giriş yapmalısınız')}&callbackUrl=${encodeURIComponent(currentPath)}`;
      router.push(loginUrl);
      return;
    }

    // Only add to cart if user is authenticated
    if (session) {
      dispatch({ type: 'ADD_ITEM', payload: item });
    }
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const setCartOpen = (open: boolean) => {
    dispatch({ type: 'SET_CART_OPEN', payload: open });
  };

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    setCartOpen
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 