"use client";

import React, { useState, useEffect } from "react";
import Header from "../_components/Header";
import ProductDetail from "../_components/ProductDetail";
import CartDrawer from "../_components/CartDrawer";

export default function ProductDetailPage() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cart, setCart] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load cart from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem("supply-cart");
            if (saved) {
                try {
                    setCart(JSON.parse(saved));
                } catch (err) {
                    console.error("Invalid cart JSON");
                }
            }
        }
    }, []);

    // Save cart to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem("supply-cart", JSON.stringify(cart));
        }
    }, [cart]);

    const addToCart = (product, quantity, openCart) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);

            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [...prev, { ...product, quantity }];
        });

        if (openCart) setIsCartOpen(true);
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id, quantity) => {
        if (quantity <= 0) return removeFromCart(id);

        setCart((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

    return (
        <div className="w-full h-screen box-border overflow-hidden">
            <div className="min-h-screen bg-white flex flex-col relative">

                {/* HEADER */}
                <Header
                    onCartClick={() => setIsCartOpen(true)}
                    cartCount={cartCount}
                    setIsOpen={setIsOpen}
                />

                {/* MAIN DETAIL PAGE */}
                <main className="grow bg-white">
                    <ProductDetail onAddToCart={addToCart} />
                </main>

                {/* CART DRAWER */}
                <CartDrawer
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    cartItems={cart}
                    onRemoveItem={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                />
            </div>
        </div>
    );
}
