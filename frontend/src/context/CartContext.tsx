import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductVariant } from '../types';

export interface SelectedOption {
  optionId: number;
  optionName: string;
  valueId?: number;
  value: string;
  priceModifier: number;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  options?: SelectedOption[];
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, variant?: ProductVariant, options?: SelectedOption[]) => void;
  removeFromCart: (productId: number, variantId?: number, options?: SelectedOption[]) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number, options?: SelectedOption[]) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  isInCart: (productId: number, variantId?: number, options?: SelectedOption[]) => boolean;
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

  // Helper function to check if options match
  const optionsMatch = (options1?: SelectedOption[], options2?: SelectedOption[]): boolean => {
    if (!options1 && !options2) return true;
    if (!options1 || !options2) return false;
    if (options1.length !== options2.length) return false;

    return options1.every((opt1) =>
      options2.some(
        (opt2) =>
          opt1.optionId === opt2.optionId &&
          opt1.valueId === opt2.valueId &&
          opt1.value === opt2.value
      )
    );
  };

  const addToCart = (product: Product, quantity: number, variant?: ProductVariant, options?: SelectedOption[]) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.variant?.id === variant?.id &&
          optionsMatch(item.options, options)
      );

      if (existingIndex >= 0) {
        // Update quantity if item exists
        const newItems = [...prevItems];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      } else {
        // Add new item
        return [...prevItems, { product, variant, quantity, options }];
      }
    });
  };

  const removeFromCart = (productId: number, variantId?: number, options?: SelectedOption[]) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.product.id === productId && item.variant?.id === variantId && optionsMatch(item.options, options))
      )
    );
  };

  const updateQuantity = (productId: number, quantity: number, variantId?: number, options?: SelectedOption[]) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId, options);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId && item.variant?.id === variantId && optionsMatch(item.options, options)
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
      const basePrice = parseFloat(item.product.sale_price || item.product.price);
      const variantModifier = item.variant ? parseFloat(item.variant.price_modifier) : 0;
      const optionsModifier = item.options
        ? item.options.reduce((sum, opt) => sum + opt.priceModifier, 0)
        : 0;
      const itemPrice = basePrice + variantModifier + optionsModifier;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  const isInCart = (productId: number, variantId?: number, options?: SelectedOption[]) => {
    return items.some(
      (item) =>
        item.product.id === productId &&
        item.variant?.id === variantId &&
        optionsMatch(item.options, options)
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
