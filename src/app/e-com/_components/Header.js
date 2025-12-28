
"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const Header = ({ onCartClick, cartCount, setIsOpen: setNavOpen }) => {
  const marqueeRef = useRef(null);
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const menuRef = useRef(null);
  const accountRef = useRef(null);
  const cartRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter();

  useEffect(() => {
    // Marquee scroll
    gsap.to(marqueeRef.current, {
      xPercent: -50,
      repeat: -1,
      duration: 25,
      ease: "linear",
    });

    // --- HOVER LOGIC FIXED FOR NEXT.JS ---
    const addHover = (element) => {
      if (!element) return;

      const enter = () => gsap.to(element, { scale: 1.05, duration: 0.2 });
      const leave = () => gsap.to(element, { scale: 1, duration: 0.2 });

      element.addEventListener("mouseenter", enter);
      element.addEventListener("mouseleave", leave);

      // Cleanup (required in Next.js!)
      return () => {
        element.removeEventListener("mouseenter", enter);
        element.removeEventListener("mouseleave", leave);
      };
    };

    const cleanups = [
      addHover(logoRef.current),
      addHover(menuRef.current),
      addHover(accountRef.current),
      addHover(cartRef.current),
    ];

    return () => cleanups.forEach((cleanup) => cleanup && cleanup());
  }, []);

  return (
    <>
      {/* Marquee Banner */}
      <div className="bg-black text-white text-xs py-2 overflow-hidden whitespace-nowrap">

        <div
          ref={marqueeRef}
          className="inline-block"
          style={{ whiteSpace: "nowrap" }}
        >
          FREE SHIPPING ON ORDERS OVER $150 — WORLDWIDE SHIPPING AVAILABLE —
          NEW COLLECTION DROPPING SOON — FREE SHIPPING ON ORDERS OVER $150 —
          WORLDWIDE SHIPPING AVAILABLE — NEW COLLECTION DROPPING SOON —
        </div>
      </div>

      {/* Main Navbar */}
      <header
        ref={headerRef}
        className="sticky top-0 z-40 bg-white border-b border-gray-200"
      >
        <div className="flex justify-between items-center h-16 px-4 md:px-6">

          {/* Left Section: Back Button & Mobile Menu */}
          <div className="flex-1 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition"
            >
              <ArrowLeft size={20} />
              Back
            </button>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <button ref={menuRef} className="p-2 -ml-2" onClick={() => setNavOpen(true)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Logo */}
          <div className="flex-1 flex justify-center">
            <a
              ref={logoRef}
              href="/"
              className="text-xl font-bold tracking-tight uppercase text-black"
            >
              Supply
            </a>
          </div>

          {/* Right Buttons */}
          <div className="flex-1 flex justify-end items-center gap-4 md:gap-6">

            <button
              ref={accountRef}
              onClick={(e)=>{
                e.preventDefault();
                router.replace("/admin")
              }}
              className="hidden md:block text-sm font-medium text-gray-600"
            >
              Admin
            </button>

            <button
              ref={cartRef}
              onClick={onCartClick}
              className="text-sm font-medium text-black flex items-center gap-1"
            >
              Cart ({cartCount})
            </button>


          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
