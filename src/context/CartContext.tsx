import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, Service, DiscountCode } from '../types';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from './AuthContext';

interface CartState {
  items: CartItem[];
  subtotal: number;
  discountCode: DiscountCode | null;
  discountAmount: number;
  total: number;
  isLoading: boolean;
  error: string | null;
}

interface CartContextType extends CartState {
  addToCart: (service: Service, scheduledDate?: string, scheduledTime?: string) => Promise<void>;
  updateCartItem: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyDiscountCode: (code: string) => Promise<boolean>;
  removeDiscountCode: () => void;
  loadCart: () => Promise<void>;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_ITEMS' }
  | { type: 'SET_DISCOUNT_CODE'; payload: DiscountCode | null }
  | { type: 'CALCULATE_TOTALS' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_ITEMS':
      return { ...state, items: action.payload, isLoading: false };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload], isLoading: false };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        isLoading: false
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        isLoading: false
      };
    case 'CLEAR_ITEMS':
      return { ...state, items: [], isLoading: false };
    case 'SET_DISCOUNT_CODE':
      return { ...state, discountCode: action.payload };
    case 'CALCULATE_TOTALS':
      const subtotal = state.items.reduce((sum, item) => {
        return sum + (item.service?.price || 0) * item.quantity;
      }, 0);

      let discountAmount = 0;
      if (state.discountCode && subtotal >= state.discountCode.minOrderAmount) {
        if (state.discountCode.discountType === 'percentage') {
          discountAmount = (subtotal * state.discountCode.discountValue) / 100;
          if (state.discountCode.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, state.discountCode.maxDiscountAmount);
          }
        } else {
          discountAmount = state.discountCode.discountValue;
        }
      }

      const total = Math.max(0, subtotal - discountAmount);

      return {
        ...state,
        subtotal,
        discountAmount,
        total
      };
    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  subtotal: 0,
  discountCode: null,
  discountAmount: 0,
  total: 0,
  isLoading: false,
  error: null,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  useEffect(() => {
    dispatch({ type: 'CALCULATE_TOTALS' });
  }, [state.items, state.discountCode]);

  const loadCart = async () => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // For development, load from localStorage
      const cartKey = `cart_${user.id}`;
      const existingCart = localStorage.getItem(cartKey);
      const items: CartItem[] = existingCart ? JSON.parse(existingCart) : [];
      
      dispatch({ type: 'SET_ITEMS', payload: items });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const addToCart = async (service: Service, scheduledDate?: string, scheduledTime?: string) => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // For development, use localStorage instead of Supabase
      const cartKey = `cart_${user.id}`;
      const existingCart = localStorage.getItem(cartKey);
      let cartItems: CartItem[] = existingCart ? JSON.parse(existingCart) : [];
      
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.serviceId === service.id);
      
      if (existingItem) {
        // Update quantity
        existingItem.quantity += 1;
        existingItem.updatedAt = new Date().toISOString();
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
        dispatch({ type: 'UPDATE_ITEM', payload: { id: existingItem.id, quantity: existingItem.quantity } });
      } else {
        // Add new item
        const newItem: CartItem = {
          id: crypto.randomUUID(),
          userId: user.id,
          serviceId: service.id,
          quantity: 1,
          scheduledDate,
          scheduledTime,
          service: service,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        cartItems.push(newItem);
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
        dispatch({ type: 'ADD_ITEM', payload: newItem });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const updateCartItem = async (id: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (quantity <= 0) {
        await removeFromCart(id);
        return;
      }

      // For development, update in localStorage
      if (user) {
        const cartKey = `cart_${user.id}`;
        const existingCart = localStorage.getItem(cartKey);
        let cartItems: CartItem[] = existingCart ? JSON.parse(existingCart) : [];
        
        const itemIndex = cartItems.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          cartItems[itemIndex].quantity = quantity;
          cartItems[itemIndex].updatedAt = new Date().toISOString();
          localStorage.setItem(cartKey, JSON.stringify(cartItems));
        }
      }
      
      dispatch({ type: 'UPDATE_ITEM', payload: { id, quantity } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // For development, remove from localStorage
      if (user) {
        const cartKey = `cart_${user.id}`;
        const existingCart = localStorage.getItem(cartKey);
        let cartItems: CartItem[] = existingCart ? JSON.parse(existingCart) : [];
        
        cartItems = cartItems.filter(item => item.id !== id);
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
      }
      
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // For development, clear localStorage
      const cartKey = `cart_${user.id}`;
      localStorage.removeItem(cartKey);
      
      dispatch({ type: 'CLEAR_ITEMS' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const applyDiscountCode = async (code: string): Promise<boolean> => {
    try {
      // For development, use dummy discount codes
      let discountCode: DiscountCode | null = null;
      
      if (code === 'SAVE10') {
        discountCode = {
          id: crypto.randomUUID(),
          code: 'SAVE10',
          discountType: 'percentage',
          discountValue: 10,
          minOrderAmount: 50,
          maxDiscountAmount: 50,
          usageLimit: 100,
          usedCount: 0,
          isActive: true,
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        };
      } else if (code === 'FLAT20') {
        discountCode = {
          id: crypto.randomUUID(),
          code: 'FLAT20',
          discountType: 'fixed',
          discountValue: 20,
          minOrderAmount: 100,
          maxDiscountAmount: 20,
          usageLimit: 50,
          usedCount: 0,
          isActive: true,
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        };
      }
      
      if (!discountCode) {
        dispatch({ type: 'SET_ERROR', payload: 'Invalid or expired discount code' });
        return false;
      }

      if (state.subtotal < discountCode.minOrderAmount) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: `Minimum order amount of ₹${discountCode.minOrderAmount} required` 
        });
        return false;
      }

      dispatch({ type: 'SET_DISCOUNT_CODE', payload: discountCode });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      return false;
    }
  };

  const removeDiscountCode = () => {
    dispatch({ type: 'SET_DISCOUNT_CODE', payload: null });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        applyDiscountCode,
        removeDiscountCode,
        loadCart,
        clearError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};