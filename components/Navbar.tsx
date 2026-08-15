
import React from 'react';
import { Language } from '../types';
import { getOptimizedImageUrl } from '../utils/imageOptimization';

interface NavbarProps {
  lang: Language;
  setLang: (l: Language) => void;
  t?: any;
}

const LANGUAGES = [
  { code: Language.ES, name: 'Español', flag: '🇪🇸' },
  { code: Language.EN, name: 'English', flag: '🇺🇸' },
  { code: Language.PT, name: 'Português', flag: '🇧🇷' },
];

const Navbar: React.FC<NavbarProps> = ({ lang, setLang, t }) => {
  return (
    <nav className="bg-black border-b border-white/10 relative z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <a 
            href="/" 
            className="flex items-center gap-2 md:gap-4 hover:opacity-80 transition-opacity"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <div className="relative group">
              <img 
                src={getOptimizedImageUrl("/gaijinwheel.png", 200)} 
                className="w-12 h-12 md:w-20 md:h-20 object-contain"
                alt="LM KAITORI Logo"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-red-600/10 blur-xl rounded-full -z-10 group-hover:bg-red-600/20 transition-all"></div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-lg md:text-2xl italic-slant tracking-tighter text-white leading-none uppercase">LM KAITORI<span className="text-red-600">GG</span></span>
              <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500 font-bold mt-0.5 md:mt-1">B2B Heavy Logistics</span>
            </div>
          </a>
          
          <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-4 border-l border-white/10 pl-2 md:pl-4">
             <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white hover:-translate-y-0.5 transition-all" aria-label="TikTok">
               <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v5.8c0 1.97-.55 3.96-1.68 5.56-1.09 1.55-2.6 2.72-4.39 3.23-1.87.53-3.92.51-5.75-.1-1.85-.62-3.41-1.86-4.45-3.52-1.05-1.66-1.45-3.7-1.15-5.65.29-1.92 1.25-3.69 2.68-5.01 1.41-1.29 3.26-2 5.2-2.19V10.2c-1.12.06-2.22.38-3.17.93-.91.53-1.64 1.29-2.12 2.22-.49.95-.71 2.05-.6 3.12.11 1.1.58 2.14 1.3 2.97.74.84 1.73 1.42 2.84 1.63 1.15.22 2.37.1 3.42-.38 1.05-.48 1.91-1.27 2.44-2.28.53-1.02.79-2.19.78-3.36V0h3.6z" /></svg>
             </a>
             <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1877F2] hover:-translate-y-0.5 transition-all" aria-label="Facebook">
               <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04c-5.5 0-10 4.48-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.54-4.5-10.02-10-10.02z" /></svg>
             </a>
             <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E4405F] hover:-translate-y-0.5 transition-all" aria-label="Instagram">
               <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
             </a>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8 text-xs font-black uppercase tracking-widest text-slate-400">
             <a href="#inventory" className="hover:text-red-600 transition-colors italic-slant">{t?.navStock || 'Stock'}</a>
             <a href="#services" className="hover:text-red-600 transition-colors italic-slant">{t?.navServices || 'Services'}</a>
          </div>

          <div className="relative group">
            <button 
              aria-label="Toggle language selector"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-red-600/50 transition italic-slant uppercase font-black text-xs tracking-widest text-white"
            >
              <span className="opacity-60">{LANGUAGES.find(l => l.code === lang)?.flag}</span>
              <span>{lang}</span>
              <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="absolute top-full right-0 mt-1 w-56 bg-[#111] border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 max-h-[80vh] overflow-y-auto">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`w-full text-left px-6 py-3 hover:bg-red-600 hover:text-white flex items-center gap-4 transition text-xs font-bold uppercase tracking-widest ${lang === l.code ? 'text-red-600 bg-red-600/5' : 'text-slate-400'}`}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
