
import React from 'react';
import { Language } from '../types';

interface LanguageSelectorModalProps {
  onSelect: (lang: Language) => void;
}

const LANGUAGES = [
  { code: Language.EN, name: 'English', flag: '🇺🇸', subtitle: 'Global' },
  { code: Language.ES, name: 'Español', flag: '🇪🇸', subtitle: 'Latino / España' },
  { code: Language.PT, name: 'Português', flag: '🇧🇷', subtitle: 'Brasil / Portugal' },
];

const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-2xl font-black text-2xl mb-6 shadow-xl shadow-red-600/20">
            LM
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Welcome to LM KAITORI</h2>
          <p className="text-slate-500 font-medium">Please select your preferred language to continue</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => onSelect(l.code)}
              className="group relative bg-slate-50 hover:bg-red-600 border border-slate-200 hover:border-red-600 p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{l.flag}</span>
                <div>
                  <p className="font-black text-slate-900 group-hover:text-white transition-colors">{l.name}</p>
                  <p className="text-xs font-bold text-slate-400 group-hover:text-red-100 uppercase tracking-widest transition-colors">{l.subtitle}</p>
                </div>
              </div>
              <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-slate-400 text-xs mt-12 font-medium">
          LM KAITORI GOUDOU GAISHA • Corporate B2B Export Solutions
        </p>
      </div>
    </div>
  );
};

export default LanguageSelectorModal;
