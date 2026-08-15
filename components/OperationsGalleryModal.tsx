import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface OperationsGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  t: any;
}

export default function OperationsGalleryModal({ isOpen, onClose, images, t }: OperationsGalleryModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      {selectedIndex === null ? (
        <div className="w-full max-w-6xl h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic-slant tracking-tighter">
              {t.galleryButton || 'Galería de Operaciones'}
            </h2>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedIndex(i)}
                  className="aspect-video rounded-xl overflow-hidden cursor-pointer group border border-white/10 relative"
                >
                  <img 
                    src={img} 
                    alt={`Operation ${i}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/20 mix-blend-overlay transition-colors duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <button 
            onClick={() => setSelectedIndex(null)} 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-10 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center">
            <button 
              onClick={() => setSelectedIndex(prev => prev! > 0 ? prev! - 1 : images.length - 1)}
              className="absolute left-4 p-3 bg-black/50 hover:bg-red-600 rounded-full text-white z-10 transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <img 
              src={images[selectedIndex]} 
              alt={`Operation ${selectedIndex}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
            
            <button 
              onClick={() => setSelectedIndex(prev => prev! < images.length - 1 ? prev! + 1 : 0)}
              className="absolute right-4 p-3 bg-black/50 hover:bg-red-600 rounded-full text-white z-10 transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
          <div className="mt-4 text-white/50 font-mono text-sm tracking-widest">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
