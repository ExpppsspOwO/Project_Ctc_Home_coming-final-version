import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // ลองดึงข้อมูลจาก LocalStorage ตอนเริ่ม (เผื่อ Refresh หน้าแล้วของไม่หาย)
  const [cart, setCart] = useState(() => {
      const savedCart = localStorage.getItem('my_cart');
      return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isOpen, setIsOpen] = useState(false);

  // ทุกครั้งที่ cart เปลี่ยน ให้บันทึกลง LocalStorage
  useEffect(() => {
      localStorage.setItem('my_cart', JSON.stringify(cart));
  }, [cart]);

  // 1. เพิ่มสินค้า
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => 
          item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsOpen(true);
  };

  // 2. ✅ (ใหม่) อัปเดตจำนวนสินค้า (+ หรือ -)
  const updateQuantity = (id, type) => {
    setCart(prev => prev.map(item => {
        if (item._id === id) {
            const newQty = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
            // ถ้าลดจนเหลือ 0 ให้คงไว้ที่ 1 (หรือจะให้ลบเลยก็ได้ แต่มักจะให้กดถังขยะแยกดีกว่า)
            return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
    }));
  };

  // 3. ลบสินค้า
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  // 4. ✅ (ใหม่) เคลียร์ตะกร้า (ใช้ตอนสั่งซื้อสำเร็จ)
  const clearCart = () => {
      setCart([]);
      localStorage.removeItem('my_cart');
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, isOpen, setIsOpen, totalPrice, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};