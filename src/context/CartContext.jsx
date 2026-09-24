import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { shopService } from '../services/shopService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const calculateCount = (cartData) => {
    if (!cartData || !cartData.items || !Array.isArray(cartData.items)) return 0;
    return cartData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setCartCount(0);
      return null;
    }
    try {
      setIsLoading(true);
      const res = await shopService.getCart();
      const cartData = res.data;
      setCart(cartData);
      setCartCount(calculateCount(cartData));
      return cartData;
    } catch {
      setCart(null);
      setCartCount(0);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1, showToast = true) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      return false;
    }
    try {
      await shopService.addToCart(productId, quantity);
      await refreshCart();
      if (showToast) {
        toast.success('Added to cart!');
      }
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item to cart');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await shopService.updateCartItem(itemId, quantity);
      setCart(res.data);
      setCartCount(calculateCount(res.data));
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await shopService.removeCartItem(itemId);
      setCart(res.data);
      setCartCount(calculateCount(res.data));
      toast.success('Item removed from cart');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item');
      return false;
    }
  };

  const clearCartState = () => {
    setCart(null);
    setCartCount(0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        isLoading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
