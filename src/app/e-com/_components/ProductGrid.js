"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from './types';
import { useGSAP } from '@gsap/react';

const ProductCard = ({ product, onAddToCart }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const navigate = useRouter();

  useEffect(() => {
    if (addedSuccess) {
      const timer = setTimeout(() => setAddedSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [addedSuccess]);

  const handleCardClick = () => {
    navigate.push(`/e-com/${product.id}`);
  };

  const handleQuickAddClick = (e) => {
    e.stopPropagation();
    setIsSelecting(true);
  };

  
  const handleIncrement = (e) => {
    e.stopPropagation();
    setQuantity(q => q + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(q => q - 1);
    } else {
      setIsSelecting(false);
    }
  };

  const handleConfirmAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product, quantity, false);
    setIsSelecting(false);
    setQuantity(1);
    setAddedSuccess(true);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    onAddToCart(product, 1, true); // Open cart immediately
    setAddedSuccess(true);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white relative flex flex-col h-full hover:z-10 transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <div className="aspect-4/5 w-full overflow-hidden bg-gray-50 relative">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-110"
        />
        {product.isNew && (
          <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider z-20">
            New
          </div>
        )}

        {/* Added Confirmation Overlay */}
        {addedSuccess && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-30">
            <div className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
              Added to Cart
            </div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between border-t border-gray-100 sm:border-none relative bg-white z-20">
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              {product.name}
            </h3>
          </div>
          {product.color && (
            <p className="mt-1 text-xs text-gray-500">{product.color}</p>
          )}
        </div>

        <div className="flex items-center justify-between min-h-8">
          <p className="text-sm font-medium text-gray-900">${product.price}</p>

          {/* Actions Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`
              flex flex-col items-end gap-2 transition-all duration-300 absolute right-4 bottom-4 bg-white pl-2
              ${isSelecting ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0 pointer-events-auto md:opacity-0 md:translate-y-2 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto'}
            `}
          >
            {isSelecting ? (
              <div className="flex items-center gap-2 bg-white shadow-lg border border-gray-200 rounded-full px-1 py-0.5">
                <button
                  onClick={handleDecrement}
                  className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                >-</button>
                <span className="text-xs font-medium w-4 text-center select-none text-black">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                >+</button>
                <button
                  onClick={handleConfirmAdd}
                  className="ml-1 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase hover:bg-gray-800"
                >
                  Add
                </button>
              </div>
            ) : (
              <div className="flex gap-3 items-center bg-white/80 backdrop-blur-sm rounded-md">
                <button
                  onClick={handleBuyNow}
                  className="text-xs font-bold uppercase text-gray-500 hover:text-black transition-colors"
                >
                  Buy Now
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleQuickAddClick}
                  className="text-xs font-bold uppercase border-b border-black pb-0.5 text-gray-900 hover:text-gray-800 transition-colors"
                >
                  Quick Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductGrid = ({ products, onAddToCart }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-gray-200 border-b border-gray-200">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};

export default ProductGrid;