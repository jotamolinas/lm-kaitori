
import React from 'react';
import { Language } from '../types';
import { getOptimizedImageUrl } from '../utils/imageOptimization';

interface HeroProps {
  lang: Language;
  t: any;
}

const Hero: React.FC<HeroProps> = ({ t }) => {
  const heroImage = '/cars/whatsapp_195018.jpeg';

  return (
    <section className="relative h-[50vh] md:h-[65vh] flex items-center justify-center overflow-hidden bg-transparent">
      {/* Background with optimal styling */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <img
            src={getOptimizedImageUrl(heroImage, 2000)}
            alt="Vanning & Estiba de Contenedor en Japón - Hero"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover grayscale-[0.50] contrast-[1.1] opacity-[0.02]"
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Extreme dark cybernetic gradient overlay to protect text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#0b0b0b]/40 to-[#0b0b0b]/80 z-10"></div>
        <div className="absolute inset-0 bg-transparent z-10"></div>
        {/* Carbon grid screen overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,0,0,0),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10 opacity-60"></div>
      </div>

      <div className="relative z-20 text-center px-4 max-w-6xl mt-12 md:mt-20">
        <div className="inline-block mb-4 px-3 md:px-4 py-1 bg-red-600/10 border border-red-600/30 text-red-600 text-[10px] md:text-sm font-black uppercase tracking-[0.3em] md:tracking-[0.5em] italic-slant">
          Yard Master Direct-Export Partner • 日本
        </div>
        <h1 className="text-4xl md:text-8xl font-black text-white mb-4 md:mb-6 leading-[0.95] uppercase italic-slant tracking-tighter">
          {t.heroTitle.split(' ').slice(0, -2).join(' ')} <br className="hidden md:block"/>
          <span className="text-red-600 drop-shadow-[0_0_35px_rgba(225,6,0,0.6)]">
            {t.heroTitle.split(' ').slice(-2).join(' ')}
          </span>
        </h1>
        <p className="text-sm md:text-2xl text-slate-300 max-w-3xl mx-auto font-medium tracking-tight leading-relaxed">
          {t.heroSub}
        </p>
      </div>
    </section>
  );
};

export default Hero;
