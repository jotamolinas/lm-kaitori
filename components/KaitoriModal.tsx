import React, { useEffect } from 'react';
import { X, Truck, Wrench, AlertTriangle, MessageCircle } from 'lucide-react';

interface KaitoriModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: any;
}

export default function KaitoriModal({ isOpen, onClose, t }: KaitoriModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const whatsappUrl = `https://wa.me/818034057134?text=${encodeURIComponent(t.kaitoriMessage)}`;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-xl bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute inset-0 opacity-10 pointer-events-none carbon-pattern"></div>
        
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-10"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20 shrink-0">
              <Truck size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic-slant tracking-tight uppercase">
                LM Kaitoriyasan
              </h2>
              <p className="text-red-500 font-bold text-xs uppercase tracking-widest mt-1">
                {t.kaitoriServiceLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-6 sm:p-8 overflow-y-auto shrink-1">
          <h3 className="text-white text-lg sm:text-xl font-bold mb-6 text-center">
            {t.kaitoriTitle1} <br className="hidden sm:block" />
            <span className="text-red-500">{t.kaitoriTitle2}</span>
          </h3>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <AlertTriangle className="text-yellow-500 shrink-0 mt-1" size={24} />
              <div>
                <h4 className="text-white font-bold mb-1">{t.kaitoriItem1Title}</h4>
                <p className="text-slate-400 text-sm">{t.kaitoriItem1Desc}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <Wrench className="text-blue-500 shrink-0 mt-1" size={24} />
              <div>
                <h4 className="text-white font-bold mb-1">{t.kaitoriItem2Title}</h4>
                <p className="text-slate-400 text-sm">{t.kaitoriItem2Desc}</p>
              </div>
            </div>
          </div>

          <div className="text-center p-6 bg-red-600/10 rounded-2xl border border-red-600/20 mb-2">
            <p className="text-white font-bold mb-2">{t.kaitoriQuoteTitle}</p>
            <p className="text-slate-400 text-sm">{t.kaitoriQuoteDesc}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative p-6 border-t border-white/10 bg-black/50 shrink-0 space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#25D366]/20"
          >
            <MessageCircle size={20} />
            {t.kaitoriWhatsapp}
          </a>
          
          <a
            href="https://line.me/ti/p/~lmkaitori"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white p-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#06C755]/20"
          >
            {/* LINE icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.55 8.845 8.365 9.58.324.07.763.22 1.05.65.176.258.324.78.324 1.144 0 .363-.176 1.43-.176 1.43-.176.812-.88 1.43-1.468 1.107-.588-.323-5.266-3.213-7.531-5.748C.486 15.305 0 12.876 0 10.304zm-14.881 2.372h-2.348V8.411c0-.442-.358-.8-.8-.8s-.8.358-.8.8v5.065c0 .442.358.8.8.8h3.148c.442 0 .8-.358.8-.8s-.358-.8-.8-.8zm4.331.8h-1.6c-.442 0-.8-.358-.8-.8V8.411c0-.442.358-.8.8-.8s.8.358.8.8v4.265c0 .442-.358.8-.8.8zm3.262-5.065h-1.6v5.065h1.6V8.411zm4.619 0h-1.62l-2.028 3.092v-3.092h-1.6V13.475h1.62l2.028-3.092v3.092h1.6V8.411z" />
            </svg>
            {t.kaitoriLine}
          </a>
        </div>
      </div>
    </div>
  );
}
