import React from 'react';
import { Language } from '../types';

interface FloatingContactButtonsProps {
  lang: Language;
  t: any;
}

const FloatingContactButtons: React.FC<FloatingContactButtonsProps> = ({ t }) => {
  const phoneNumber = "818012345678"; 
  const lineId = "lmkaitori"; // Placeholder LINE ID
  const encodedMsg = encodeURIComponent(t.whatsappMsg);
  
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <a 
        href={`https://line.me/R/ti/p/~${lineId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 bg-[#00B900] text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-[#00B900]/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 backdrop-blur-sm border border-white/10 group relative"
        aria-label="Contact via LINE"
        title="Contact via LINE"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.038 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.573-3.843 2.573-5.992zM7.404 13.064h-3.08a.488.488 0 01-.486-.486V7.794a.488.488 0 01.486-.486h3.08a.486.486 0 01.486.486v1.272a.488.488 0 01-.486.486H5.59v2.24h1.814a.486.486 0 01.486.486v1.286a.488.488 0 01-.486.486zm4.195 0h-1.286a.488.488 0 01-.486-.486V7.794a.488.488 0 01.486-.486h1.286a.488.488 0 01.486.486v4.784a.488.488 0 01-.486.486zm4.618 0h-1.286a.486.486 0 01-.486-.486V9.458l-2.072 2.873a.486.486 0 01-.395.201h-.033a.488.488 0 01-.453-.486V7.794a.488.488 0 01.486-.486h1.286a.488.488 0 01.486.486v3.12l2.072-2.873a.486.486 0 01.395-.201h.033a.488.488 0 01.453.486v4.784a.488.488 0 01-.486.486zm4.07 0h-3.08a.488.488 0 01-.486-.486V7.794a.488.488 0 01.486-.486h3.08a.486.486 0 01.486.486v1.272a.488.488 0 01-.486.486h-1.814v.484h1.814a.486.486 0 01.486.486v1.272a.488.488 0 01-.486.486h-1.814v.484h1.814a.486.486 0 01.486.486v1.286a.488.488 0 01-.486.486z"/>
        </svg>
      </a>
      <a 
        href={`https://wa.me/${phoneNumber}?text=${encodedMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-[#25D366]/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 backdrop-blur-sm border border-white/10 group relative"
        aria-label="Contact via WhatsApp"
        title="Contact via WhatsApp"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.03c0 2.123.554 4.197 1.605 6.046L0 24l6.117-1.605a11.782 11.782 0 005.925 1.585h.005c6.634 0 12.032-5.39 12.035-12.03.001-3.217-1.253-6.241-3.528-8.515"/>
        </svg>
      </a>
    </div>
  );
};

export default FloatingContactButtons;
