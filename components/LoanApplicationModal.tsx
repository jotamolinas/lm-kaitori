import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Loader2, Send } from 'lucide-react';

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (app: any) => void;
  t: any;
  carName: string;
  monthlyPayment: number;
  initialDestination?: string;
}

export default function LoanApplicationModal({ isOpen, onClose, onApply, t, carName, monthlyPayment, initialDestination }: LoanApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    employer: '',
    monthlyIncome: ''
  });

  React.useEffect(() => {
    if (isOpen && initialDestination) {
      setFormData(prev => ({
        ...prev,
        address: initialDestination
      }));
    }
  }, [isOpen, initialDestination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Create the application object
    const newApp = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      carName,
      monthlyPayment,
      ...formData,
      status: 'pending'
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onApply(newApp);
    setLoading(false);
    setSuccess(true);
    
    // Reset and close after 3 seconds
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 z-20"></div>
            
            <div className="p-8 md:p-12 overflow-y-auto">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-black text-white italic-slant tracking-tighter uppercase mb-2">
                    {t.loanFormTitle}
                  </h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                    {carName} • ¥{monthlyPayment.toLocaleString()} / {t.perMonth.replace('/', '')}
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-white hover:text-red-600 transition-all"
                >
                  <X className="w-6 h-6" strokeWidth={4} />
                </button>
              </div>

              {success ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-20 text-center"
                >
                  <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-black text-white italic-slant uppercase tracking-tight mb-4">
                    {t.appSuccess}
                  </h3>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t.fullName}</label>
                      <input 
                        required
                        type="text"
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-red-600 transition-colors"
                        placeholder="Ejem: Desguace Autopartes S.A. / Juan Molinas"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t.email}</label>
                      <input 
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-red-600 transition-colors"
                        placeholder="compras@desarmadero.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t.phone}</label>
                      <input 
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-red-600 transition-colors"
                        placeholder="+54 9 11 1234-5678"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t.monthlyIncome}</label>
                      <input 
                        required
                        type="text"
                        value={formData.monthlyIncome}
                        onChange={e => setFormData({...formData, monthlyIncome: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-red-600 transition-colors"
                        placeholder="¥5,000,000 o $35,000 USD"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t.employer}</label>
                    <input 
                      required
                      type="text"
                      value={formData.employer}
                      onChange={e => setFormData({...formData, employer: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-red-600 transition-colors"
                      placeholder="Desarmadero Oficial / Importador Mayorista"
                    />
                  </div>

                  <div className="space-y-2 pb-6">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t.address}</label>
                    <textarea 
                      required
                      rows={2}
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-red-600 transition-colors resize-none mb-2"
                      placeholder="Ejem: Puerto de Valparaíso (Chile) / Puerto de Buenos Aires (Argentina)"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['Valparaíso, Chile 🇨🇱', 'Asunción, Paraguay 🇵🇾', 'Cochabamba, Bolivia 🇧🇴', 'Lima, Perú 🇵🇪', 'Jeddah, Arabia Saudita 🇸🇦', 'Melbourne, Australia 🇦🇺'].map((portStr) => (
                        <button
                          key={portStr}
                          type="button"
                          onClick={() => setFormData({...formData, address: portStr})}
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight rounded-lg border transition-all duration-200 ${
                            formData.address === portStr
                              ? 'bg-red-600 border-red-500 text-white'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {portStr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-xl uppercase italic-slant tracking-widest transition-all"
                    >
                      {t.cancel}
                    </button>
                    <button
                      disabled={loading}
                      type="submit"
                      className="flex-[2] bg-red-600 hover:bg-white text-white hover:text-black font-black py-5 rounded-xl uppercase italic-slant tracking-widest transition-all shadow-xl flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-6 h-6" />
                          {t.submitApplication}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
