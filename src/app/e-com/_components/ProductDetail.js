"use client"
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from './types';
import { PRODUCTS } from './constants';

const ProductDetail = ({ onAddToCart }) => {
  const params = useParams();
  const id = params.id || params.detail;
  const router = useRouter();
  const product = PRODUCTS.find(p => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Product not found</h2>
          <button
            onClick={() => router.push('/')}
            className="text-sm underline"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (buyNow = false) => {
    onAddToCart(product, quantity, buyNow);
    if (!buyNow) {
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    }
  };

  return (
    <div className="animate-fade-in min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Image Section */}
        <div className="bg-gray-50 relative aspect-square lg:aspect-auto lg:h-[calc(100vh-64px)] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Details Section */}
        <div className="p-6 md:p-12 lg:p-20 flex flex-col justify-center max-w-2xl">
          <button
            onClick={() => router.push('/e-com')}
            className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8 hover:text-black self-start flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Shop
          </button>

          <span className="text-sm text-gray-500 uppercase tracking-wider mb-2">{product.category}</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">{product.name}</h1>
          <p className="text-xl mb-8 text-black">${product.price}</p>

          <div className="prose prose-sm text-gray-600 mb-8 leading-relaxed">
            <p>{product.description || 'No description available.'}</p>
            {product.color && (
              <p className="mt-4"><span className="text-black font-medium">Color:</span> {product.color}</p>
            )}
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-8">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Quantity</span>
              <div className="flex items-center border border-gray-200 rounded-sm">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >-</button>
                <span className="w-12 text-center text-sm font-medium text-black">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >+</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => handleAddToCart(false)}
                className={`
                    py-4 px-8 text-sm font-bold uppercase tracking-widest transition-all duration-300 border
                    ${addedFeedback
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-white border-black text-black hover:bg-black hover:text-white'}
                `}
              >
                {addedFeedback ? 'Added' : 'Add to Cart'}
              </button>
              <button
                onClick={() => handleAddToCart(true)}
                className="bg-black text-white py-4 px-8 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;