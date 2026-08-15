import React from 'react';

interface OperationsCarouselProps {
  images?: string[];
}

export default function OperationsCarousel({ images = [] }: OperationsCarouselProps) {
  const displayImages = images.length > 0 ? images.slice(0, 8) : [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1541888079633-5c742df84501?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1587293852726-59cb2a78d01b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800',
  ].slice(0, 8);

  // Duplicate images to create infinite scroll effect
  const carouselImages = [...displayImages, ...displayImages];

  return (
    <div className="w-full relative overflow-hidden py-10">
      {/* Gradient fades for the edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>

      <div className="flex w-max animate-scroll">
        {carouselImages.map((src, index) => (
          <div 
            key={index} 
            className="w-64 md:w-96 aspect-video mx-4 shrink-0 overflow-hidden rounded-2xl border border-white/10 glass-panel group"
          >
            <img 
              src={src} 
              alt={`Operation ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
              loading="lazy"
            />
            {/* Brutalist overlay effect */}
            <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 mix-blend-overlay transition-colors duration-300"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
