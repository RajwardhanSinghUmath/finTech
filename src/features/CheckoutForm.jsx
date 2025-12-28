'use client';

import React, { useEffect, useRef, useCallback } from 'react';

const CheckoutForm = ({ onZonesReady, confusion, onPay, onBack, cart = [], totals = { subtotal: 0, tax: 0, serviceFee: 0, total: 0 }, stopEyeTracking }) => {
  const priceRef = useRef(null);
  const termsRef = useRef(null);
  const payRef = useRef(null);

  const { subtotal, tax: taxAmount, serviceFee, total: totalAmount } = totals;

  const updateZones = useCallback(() => {
    if (priceRef.current && termsRef.current && payRef.current) {
      const zones = [
        { id: 'price-summary', ...priceRef.current.getBoundingClientRect().toJSON() },
        { id: 'terms-cond', ...termsRef.current.getBoundingClientRect().toJSON() },
        { id: 'pay-button', ...payRef.current.getBoundingClientRect().toJSON() },
      ];
      onZonesReady(zones);
    }
  }, [onZonesReady]);

  useEffect(() => {
    updateZones();

    window.addEventListener('resize', updateZones);
    window.addEventListener('scroll', updateZones, true);


    const pollInterval = setInterval(updateZones, 1000);

    return () => {
      window.removeEventListener('resize', updateZones);
      window.removeEventListener('scroll', updateZones, true);
      clearInterval(pollInterval);
    };
  }, [updateZones]);

  const getHighlightClass = (id) =>
    confusion?.isConfused && confusion.zoneId === id
      ? "ring-4 ring-yellow-400 ring-offset-2 transition-all duration-500 shadow-2xl scale-[1.02] z-10 relative "
      : "transition-all duration-500";

  return (
    <div className="relative text-black bg-transparent text-black rounded-[2.3rem] shadow-2xl overflow-hidden border border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

        <div className="p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-gray-100">
          <header className="flex justify-between items-start">
            <div className="text-right">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase text-gray-900 leading-none">Payment</h2>
              <p className="text-gray-400 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Secure Terminal 01</p>
            </div>
          </header>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[8px] md:text-[10px] font-bold text-black uppercase tracking-widest ml-1">Cardholder Name</label>
              <input type="text" placeholder="JOHN DOE" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-xs md:text-sm placeholder:text-gray-200 transition-all" />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] md:text-[10px] font-bold text-black uppercase tracking-widest ml-1">Card Number</label>
              <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-xs md:text-sm placeholder:text-gray-200 transition-all" />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2 space-y-1">
                <label className="text-[8px] md:text-[10px] font-bold text-black uppercase tracking-widest ml-1">Expiry</label>
                <input type="text" placeholder="MM/YY" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-xs md:text-sm" />
              </div>
              <div className="w-1/2 space-y-1">
                <label className="text-[8px] md:text-[10px] font-bold text-black uppercase tracking-widest ml-1">CVC</label>
                <input type="text" placeholder="123" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-xs md:text-sm" />
              </div>
            </div>
          </div>

          <div
            ref={termsRef}
            id="terms-cond"
            className={`p-6 rounded-3xl border border-gray-100 bg-gray-50/30 ${getHighlightClass('terms-cond')}`}
          >
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" className="peer h-5 w-5 opacity-0 absolute cursor-pointer" />
                <div className="h-5 w-5 bg-white border border-gray-200 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                  <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>
              <span className="text-[11px] text-gray-400 font-bold leading-relaxed uppercase group-hover:text-gray-600 transition-colors">
                I agree to the <span className="text-blue-600 underline">Terms</span>, including the non-refundable processing fee of <span className="text-black">${serviceFee.toFixed(2)}</span>, plus 10% estimated tax, and automated renewal.
              </span>
            </label>

          </div>
        </div>

        <div className="bg-gray-50/50 p-6 flex flex-col justify-between lg:rounded-r-[2.3rem]">
          <div className="space-y-10">
            <div className="flex justify-between items-center">
              <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Order Summary</h3>
              <span className="bg-gray-200 text-[8px] md:text-[10px] font-bold px-2 py-1 rounded text-gray-600">{cart.length} ITEMS</span>
            </div>

            <div
              ref={priceRef}
              id="price-summary"
              className={`space-y-5 p-2 rounded-2xl ${getHighlightClass('price-summary')}`}
            >
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center group">
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">{item.name}</span>
                    <span className="text-[8px] md:text-[9px] text-gray-300 font-bold uppercase tracking-widest">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-black text-xs md:text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <div className="w-full h-px bg-gray-100 my-4" />

              <div className="flex justify-between items-center">
                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Subtotal</span>
                <span className="font-black text-xs md:text-sm text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Service Fee</span>
                  <div className="group relative">
                    <span className="text-[10px] bg-gray-200 text-gray-400 rounded-full w-3 h-3 flex items-center justify-center cursor-help">?</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-black text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Includes secure processing and maintenance.
                    </div>
                  </div>
                </div>
                <span className="font-black text-xs md:text-sm text-blue-600">+${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Estimated Tax</span>
                <span className="font-black text-xs md:text-sm text-gray-900">${taxAmount.toFixed(2)}</span>
              </div>

              <div className="pt-8 mt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-600">Total Payable</span>
                <div className="text-right">
                  <span className="text-3xl md:text-4xl font-black tracking-tighter italic text-gray-900">${totalAmount.toFixed(2)}</span>
                  <p className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase mt-1">USD • VAT INCLUDED</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={(e) => {
                e.preventDefault();
                // Turn off camera before processing order
                if (stopEyeTracking) {
                  stopEyeTracking();
                }
                if (onPay) {
                  onPay();
                }
              }}
              ref={payRef}
              id="pay-button"
              className={`w-full py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-blue-200 hover:bg-black transition-all transform active:scale-[0.98] ${getHighlightClass('pay-button')}`}
            >
              Complete Order Transaction
            </button>
            <p className="text-[9px] text-center text-gray-600 font-bold uppercase mt-4 tracking-widest">
              Encrypted by Clarity Shield™
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
