"use client"
import React, { useRef, useEffect } from 'react';
import { CATEGORIES } from './constants';


const CategoryFilter = ({ activeSlug, onSelectCategory }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const activeElement = containerRef.current.querySelector(`[data-active="true"]`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeSlug]);

  return (
    <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div 
        ref={containerRef}
        className="flex overflow-x-auto no-scrollbar py-4 px-4 md:px-6 gap-3 md:gap-4"
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeSlug === cat.slug;
          return (
            <button
              key={cat.id}
              data-active={isActive}
              onClick={() => onSelectCategory(cat.slug)}
              className={`
                whitespace-nowrap text-sm font-medium uppercase tracking-wide transition-all duration-300 px-4 py-2 rounded-full
                ${isActive 
                  ? 'bg-black text-white shadow-sm scale-105' 
                  : 'text-gray-500 bg-gray-100/50 hover:bg-gray-100 hover:text-black'}
              `}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;