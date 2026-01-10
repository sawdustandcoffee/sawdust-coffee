import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductVariant } from '../types';

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, variant?: ProductVariant) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  isInCart: (productId: number, variantId?: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('sawdust_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to load cart from localStorage', err);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sawdust_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number, variant?: ProductVariant) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.variant?.id === variant?.id
      );

      if (existingIndex >= 0) {
        // Update quantity if item exists
        const newItems = [...prevItems];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      } else {
        // Add new item
        return [...prevItems, { product, variant, quantity }];
      }
    });
  };

  const removeFromCart = (productId: number, variantId?: number) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.product.id === productId && item.variant?.id === variantId)
      )
    );
  };

  const updateQuantity = (productId: number, quantity: number, variantId?: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId && item.variant?.id === variantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      const price = item.product.effective_price || item.product.price;
      const variantModifier = item.variant?.price_modifier || 0;
      const itemPrice = price + variantModifier;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  const isInCart = (productId: number, variantId?: number) => {
    return items.some(
      (item) =>
        item.product.id === productId && item.variant?.id === variantId
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        isInCart,
      }}
    >
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
