"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";

const CartDrawer = ({ isOpen, onClose, cartItems, onRemoveItem, onUpdateQuantity }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    // Mock checkout process and redirect
    setTimeout(() => {
      router.replace("/checkout");
    }, 1000);
  };

  const drawerRef = useRef(null);
  const backdropRef = useRef(null);
  const itemRefs = useRef({}); // holds refs for individual items

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Animate opening
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        drawerRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.35, ease: "power3.out" }
      );

      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  // Close animation
  const handleClose = () => {
    setIsClosing(true);

    gsap.to(drawerRef.current, {
      x: "100%",
      duration: 0.3,
      ease: "power3.in",
      onComplete: () => {
        setIsClosing(false);
        onClose();
      }
    });

    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in"
    });
  };

  // Remove item animation
  const handleRemove = (id) => {
    const el = itemRefs.current[id];

    if (el) {
      gsap.to(el, {
        opacity: 0,
        y: -20,
        duration: 0.25,
        ease: "power2.out",
        onComplete: () => {
          onRemoveItem(id);
        }
      });
    }
  };

  // Quantity update animation
  const handleQuantityUpdate = (id, newQty, oldQty) => {
    if (newQty === 0) {
      handleRemove(id);
      return;
    }

    onUpdateQuantity(id, newQty);

    const el = itemRefs.current[id];

    if (el) {
      gsap.fromTo(
        el,
        { scale: 1 },
        { scale: 1.05, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.inOut" }
      );
    }
  };

  // Fade items in when drawer opens
  useEffect(() => {
    if (isOpen) {
      Object.values(itemRefs.current).forEach((el, index) => {
        if (!el) return;

        gsap.fromTo(
          el,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.25,
            delay: index * 0.08,
            ease: "power2.out"
          }
        );
      });
    }
  }, [isOpen, cartItems]);

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end text-black">

      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white z-10">
          <h2 className="text-lg font-bold uppercase tracking-wide">
            Cart ({cartItems.reduce((a, c) => a + c.quantity, 0)})
          </h2>

          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">Your cart is empty.</div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                ref={(el) => (itemRefs.current[item.id] = el)}
                className="flex gap-4 group"
              >
                <div className="w-20 h-20 bg-gray-100 shrink-0 relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-sm uppercase tracking-wide">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.category} — {item.color}
                      </p>
                    </div>
                    <p className="font-medium text-sm">
                      ${item.price * item.quantity}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center border border-gray-200 rounded-sm">
                      <button
                        onClick={() => handleQuantityUpdate(item.id, item.quantity - 1, item.quantity)}
                        className="px-2 py-1 text-xs hover:bg-gray-50 w-7 h-7 flex items-center justify-center text-gray-600"
                      >
                        -
                      </button>

                      <span className="px-1 text-xs font-medium w-6 text-center select-none tabular-nums">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => handleQuantityUpdate(item.id, item.quantity + 1, item.quantity)}
                        className="px-2 py-1 text-xs hover:bg-gray-50 w-7 h-7 flex items-center justify-center text-gray-600"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-xs text-gray-400 hover:text-red-600 uppercase tracking-wider font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 z-10">
          <div className="flex justify-between mb-4 text-sm font-bold">
            <span>Subtotal</span>
            <span>${subtotal}</span>
          </div>

          <p className="text-xs text-gray-500 mb-6">
            Shipping, taxes, and discounts calculated at checkout.
          </p>

          <button
            className="w-full bg-black text-white py-4 font-bold uppercase text-sm tracking-widest hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            disabled={cartItems.length === 0 || isCheckingOut}
            onClick={handleCheckout}
          >
            {isCheckingOut ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Checkout"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
