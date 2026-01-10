import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';

interface ComparisonContextType {
  comparisonProducts: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: number) => void;
  clearComparison: () => void;
  isInComparison: (productId: number) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const MAX_COMPARISON_PRODUCTS = 4;
const STORAGE_KEY = 'sawdust_comparison';

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setComparisonProducts(parsed);
      }
    } catch (error) {
      console.error('Failed to load comparison products:', error);
    }
  }, []);

  // Save to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisonProducts));
    } catch (error) {
      console.error('Failed to save comparison products:', error);
    }
  }, [comparisonProducts]);

  const addToComparison = (product: Product) => {
    setComparisonProducts((prev) => {
      // Check if already in comparison
      if (prev.some((p) => p.id === product.id)) {
        return prev;
      }

      // Check if we've reached the limit
      if (prev.length >= MAX_COMPARISON_PRODUCTS) {
        // Remove the oldest product and add the new one
        return [...prev.slice(1), product];
      }

      // Add to comparison
      return [...prev, product];
    });
  };

  const removeFromComparison = (productId: number) => {
    setComparisonProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearComparison = () => {
    setComparisonProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isInComparison = (productId: number): boolean => {
    return comparisonProducts.some((p) => p.id === productId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparisonProducts,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
