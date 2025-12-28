"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import Header from "./_components/Header";
import CategoryFilter from "./_components/CategoryFilter";
import ProductGrid from "./_components/ProductGrid";
import ProductDetail from "./_components/ProductDetail";
import CartDrawer from "./_components/CartDrawer";
import { PRODUCTS } from "./_components/constants";
import { FiX } from "react-icons/fi";


const Shop = ({ onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState("shop-all");


  const filteredProducts =
    activeCategory === "shop-all"
      ? PRODUCTS
      : activeCategory === "new-arrivals"
        ? PRODUCTS.filter((p) => p.isNew)
        : PRODUCTS.filter(
          (p) => p.category.toLowerCase() === activeCategory
        );

  return (
    <>
      <div className="px-4 md:px-6 py-8 md:py-12 max-w-screen-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 uppercase text-black">
          {activeCategory.replace("-", " ")}
        </h1>
        <p className="text-gray-500 max-w-md text-sm md:text-base leading-relaxed">
          Curated essentials for your workspace. Designed to inspire creativity
          and enhance productivity.
        </p>
      </div>

      <CategoryFilter
        activeSlug={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      <ProductGrid products={filteredProducts} onAddToCart={onAddToCart} />
    </>
  );
};


export default function Page() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("supply-cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (err) {
        console.error("Invalid cart JSON");
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("supply-cart", JSON.stringify(cart));
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
    <>

      <div className="min-h-screen bg-white flex flex-col relative">

        {/* HEADER */}
        <Header
          onCartClick={() => setIsCartOpen(true)}
          cartCount={cartCount}
          setIsOpen={setIsOpen}
        />


        {/* MAIN SHOP PAGE */}
        <main className="grow bg-white">
          <Shop onAddToCart={addToCart} />
        </main>

        {/* FOOTER */}
        <footer className="bg-white border-t border-gray-200 py-12 md:py-20 text-black">
          <div className="px-4 md:px-6 max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-wide text-sm">
                About
              </h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-black">Our Story</a></li>
                <li><a href="#" className="hover:text-black">Careers</a></li>
                <li><a href="#" className="hover:text-black">Press</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-wide text-sm">
                Support
              </h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-black">FAQ</a></li>
                <li><a href="#" className="hover:text-black">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-black">Contact</a></li>
              </ul>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <h4 className="font-bold uppercase tracking-wide text-sm">
                Newsletter
              </h4>
              <p className="text-sm text-gray-500">
                Subscribe for updates, new drops, and insider offers.
              </p>

              <div className="flex gap-2 max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-gray-50 border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                />
                <button className="bg-black text-white px-6 py-2 text-sm font-bold uppercase hover:bg-gray-800 transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="mt-16 px-4 md:px-6 border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
            <p>&copy; 2026 Piyush Borban</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-black">Privacy Policy</a>
              <a href="#" className="hover:text-black">Terms of Service</a>
            </div>
          </div>
        </footer>

        {/* CART DRAWER */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cart}
          onRemoveItem={removeFromCart}
          onUpdateQuantity={updateQuantity}
        />
      </div>
    </>
  );
}
