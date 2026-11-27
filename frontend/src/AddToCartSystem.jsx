import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "cafe_cart_v1";
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items]);

  function addToCart(entry) {
    const cartItem = {
      ...entry,
      cartItemId:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `cart_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
    setItems((prev) => [...prev, cartItem]);
  }

  function updateQuantity(cartItemId, nextQty) {
    if (nextQty < 1) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId !== cartItemId) return item;
        const unitPrice = Number(item.unitPrice) || 0;
        return {
          ...item,
          quantity: nextQty,
          totalPrice: unitPrice * nextQty,
        };
      })
    );
  }

  function removeFromCart(cartItemId) {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }

  function clearCart() {
    setItems([]);
  }

  const totalCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const subtotal = items.reduce((sum, item) => {
    const lineTotal =
      item.totalPrice !== undefined
        ? Number(item.totalPrice)
        : (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1);
    return sum + lineTotal;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return ctx;
}