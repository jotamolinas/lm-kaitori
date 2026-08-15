
import React, { useState, useEffect } from 'react';
import { Language, VisaType, Car, LoanApplication } from './types';
import { translations } from './translations';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Inventory from './components/Inventory';
import FloatingContactButtons from './components/FloatingContactButtons';
import LanguageSelectorModal from './components/LanguageSelectorModal';
import AdminInventory from './components/AdminInventory';
import LegalModal from './components/LegalModal';
import KaitoriModal from './components/KaitoriModal';
import OperationsCarousel from './components/OperationsCarousel';
import OperationsGalleryModal from './components/OperationsGalleryModal';
import ExportLogistics from './components/ExportLogistics';
import { getOptimizedImageUrl } from './utils/imageOptimization';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language | null>(() => {
    const saved = localStorage.getItem('gaijin-wheels-lang');
    return (saved as Language) || null;
  });

  const [cars, setCars] = useState<Car[]>([]);

  const [showLangModal, setShowLangModal] = useState(!lang);
  const [showLegal, setShowLegal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showKaitoriModal, setShowKaitoriModal] = useState(false);
  const [carToEdit, setCarToEdit] = useState<Car | null>(null);
  const [applications, setApplications] = useState<LoanApplication[]>(() => {
    const saved = localStorage.getItem('gw-loan-apps');
    return saved ? JSON.parse(saved) : [];
  });
  const [operationsImages, setOperationsImages] = useState<string[]>([]);
  const [operationsDocs, setOperationsDocs] = useState<{id: string, url: string}[]>([]);
  const [mapImage, setMapImage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'exportMap'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().url) {
        setMapImage(docSnap.data().url);
      } else {
        setMapImage(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = collection(db, 'operations');
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, url: doc.data().url }));
      // Sort them by createdAt if you want, but snapshot.docs is the natural order
      setOperationsDocs(docs);
      setOperationsImages(docs.map(d => d.url));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('servicio') === 'recoleccion') {
      setShowKaitoriModal(true);
    }
  }, []);

  const closeKaitoriModal = () => {
    setShowKaitoriModal(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('servicio');
    window.history.replaceState({}, '', url.toString());
  };

  useEffect(() => {
    // Escuchar la colección 'inventory' en tiempo real
    const q = query(collection(db, 'inventory'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Mapear autos de la base de datos
      const dbCars = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Car[];
      
      setCars(dbCars);
    }, (error) => {
      console.error("Error fetching inventory:", error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (lang) {
      localStorage.setItem('gaijin-wheels-lang', lang);
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const handleLangSelect = (selectedLang: Language) => {
    setLang(selectedLang);
    setShowLangModal(false);
  };

  const saveToStorage = (updatedList: Car[]) => {
    // Eliminado: La persistencia ahora es manejada por Firestore en AdminPanel
  };

  const handleAddCar = (newCar: Car) => {
    // La adición real a Firestore ocurre en uploadVehicle dentro de AdminPanel
    // setCars([...]) ya no es necesario aquí porque onSnapshot actualizará el estado
  };

  const handleEditCar = async (updatedCar: Car) => {
    try {
      const carRef = doc(db, 'inventory', updatedCar.id);
      await setDoc(carRef, { ...updatedCar }, { merge: true });
      setCarToEdit(null);
    } catch (error) {
      console.error("Error actualizando auto:", error);
    }
  };

  const handleDeleteCar = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (error) {
      console.error("Error eliminando auto:", error);
    }
  };

  const handleAddApplication = (app: LoanApplication) => {
    const updatedApps = [app, ...applications];
    setApplications(updatedApps);
    localStorage.setItem('gw-loan-apps', JSON.stringify(updatedApps));
  };

  const handleDeleteApplication = (id: string) => {
    const updatedApps = applications.filter(a => a.id !== id);
    setApplications(updatedApps);
    localStorage.setItem('gw-loan-apps', JSON.stringify(updatedApps));
  };

  const currentLang = lang || Language.EN;
  const t = translations[currentLang] || translations[Language.EN];

  return (
    <div className={`min-h-screen bg-[#0b0b0b] text-white ${showLangModal ? 'overflow-hidden h-screen' : ''}`}>
      {/* Fixed Background Blueprint with Enhanced 3D depth */}
      <div className="fixed inset-0 z-0 bg-black pointer-events-none">
        <img 
          src={getOptimizedImageUrl("https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&q=80&w=2000", 2000)} 
          alt="Export Containers Background" 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover opacity-20 filter grayscale"
          referrerPolicy="no-referrer"
        />
      </div>
      {/* Degradado para suavizar los bordes superior e inferior */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0b0b0b]/20 via-transparent to-[#0b0b0b]/20 pointer-events-none"></div>
      {/* Efecto de líneas de escaneo para darle un toque tecnológico/japonés */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-10"></div>
      
      {showLangModal && <LanguageSelectorModal onSelect={handleLangSelect} />}
      
      {/* Header Fijo */}
      <div className="sticky top-0 z-50 flex flex-col w-full shadow-2xl">
        {/* Banner Kaitori */}
        <div 
          onClick={() => setShowKaitoriModal(true)}
          className="bg-red-600 text-white py-2 px-4 text-center text-xs md:text-sm font-bold uppercase tracking-widest cursor-pointer hover:bg-red-700 transition-colors"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span className="hidden sm:inline">{t.kaitoriBannerLong}</span>
            <span className="sm:hidden">{t.kaitoriBannerShort}</span>
            <span className="bg-white text-red-600 px-2 py-0.5 rounded text-[10px] sm:text-xs font-black ml-2 animate-pulse shrink-0">{t.kaitoriAction}</span>
          </div>
        </div>
        
        <Navbar lang={currentLang} setLang={(l) => setLang(l)} t={t} />
      </div>
      
      <KaitoriModal isOpen={showKaitoriModal} onClose={closeKaitoriModal} t={t} />

      <LegalModal isOpen={showLegal} onClose={() => setShowLegal(false)} lang={currentLang} />
      
      <main className="relative z-10 pb-20">
        <Hero lang={currentLang} t={t} />
        
        <div id="inventory" className="max-w-7xl mx-auto px-4 pt-4 md:pt-12 pb-16 md:pb-32">
          <Inventory 
            cars={cars} 
            t={t} 
            lang={currentLang} 
            onApply={handleAddApplication}
          />
        </div>

        <AdminInventory 
          cars={cars}
          onAddCar={handleAddCar} 
          onEditCar={handleEditCar}
          editingCar={carToEdit}
          onClose={() => setCarToEdit(null)}
          t={t} 
          lang={currentLang} 
          applications={applications}
          onDeleteApplication={handleDeleteApplication}
          onDeleteCar={handleDeleteCar}
          operationsDocs={operationsDocs}
          mapImage={mapImage}
        />

        <div id="services" className="py-20 md:py-32 border-b border-white/10 relative z-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-center uppercase tracking-tighter italic-slant racing-font">
              {t.servicesTitle}
            </h2>
          </div>
          
          <OperationsCarousel images={operationsImages} />

          <div className="max-w-7xl mx-auto px-4 mt-12 flex justify-center">
            <button 
              onClick={() => setShowGalleryModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-black text-lg md:text-xl uppercase tracking-widest py-5 px-10 rounded-2xl italic-slant transition-transform hover:-translate-y-1 shadow-2xl shadow-red-600/30"
            >
              {t.galleryButton}
            </button>
          </div>
        </div>

        <ExportLogistics t={t} mapImage={mapImage} lang={currentLang} />

        <div id="requirements" className="py-8 md:py-12 relative overflow-hidden bg-black/20">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-red-600/5 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
             <h2 className="text-xl md:text-3xl font-black mb-2 md:mb-3 italic-slant uppercase tracking-tighter text-white/90">{t.reqTitle}</h2>
             <p className="text-slate-400 text-[10px] md:text-xs mb-6 md:mb-8 font-medium tracking-wide max-w-lg mx-auto">{t.reqSub}</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {[
                { visa: t.visaPermanent, down: t.terms10, terms: t.months60, icon: '🏆', color: 'bg-red-600/10 text-red-600 border-red-600/20' },
                { visa: t.visaWork, down: t.terms20, terms: t.months36, icon: 'bg-white/5 text-white border-white/10' },
                { visa: t.visaStudent, down: t.terms50, terms: t.monthsVisa, icon: '🎓', color: 'bg-white/5 text-white border-white/10' },
              ].map((item, idx) => (
                <div key={idx} className={`bg-black/40 backdrop-blur-md border border-white/5 p-3 md:p-4 rounded-none border-l-2 ${item.color?.split(' ').pop() || 'border-white/10'} transition-all hover:bg-black/60 group`}>
                  <div className={`w-8 h-8 md:w-10 md:h-10 ${item.color?.split(' ').slice(0, 2).join(' ') || 'bg-white/5'} flex items-center justify-center text-lg md:text-xl mb-3 md:mb-4 mx-auto`}>
                    {idx === 1 ? '💼' : item.icon}
                  </div>
                  <h3 className="text-sm md:text-base font-black mb-3 md:mb-4 uppercase italic-slant tracking-tight">{item.visa}</h3>
                  <div className="space-y-2 text-left mono-font">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5 md:pb-2">
                      <span className="text-slate-500 text-[7px] md:text-[8px] font-black uppercase tracking-widest">{t.downPayment}</span>
                      <span className="font-black text-white text-xs md:text-sm tracking-tighter">{item.down}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[7px] md:text-[8px] font-black uppercase tracking-widest">{t.maxTerms}</span>
                      <span className="font-black text-white text-xs md:text-sm tracking-tighter">{item.terms}</span>
                    </div>
                  </div>
                </div>
              ))}
             </div>
          </div>
        </div>
      </main>

      <OperationsGalleryModal 
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
        images={operationsImages}
        t={t}
      />

      <div className="max-w-4xl mx-auto px-4 py-16 text-center relative z-20">
        <div className="bg-black/40 backdrop-blur-md border-l-4 border-red-600 p-8 md:p-12 rounded-r-2xl shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic-slant tracking-tighter mb-4">{t.commitmentTitle}</h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed italic font-medium">
            "{t.commitmentText}"
          </p>
        </div>
      </div>

      <footer className="bg-black/10 backdrop-blur-sm text-slate-500 py-12 px-4 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center gap-4 justify-center md:justify-start mb-4">
              <img 
                src={getOptimizedImageUrl("/gaijinwheel.png", 200)} 
                className="w-12 h-12 object-contain"
                alt="LM KAITORI Logo"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col leading-none text-left">
                <span className="text-white font-black text-lg italic-slant uppercase tracking-tighter">LM KAITORI<span className="text-red-600">GG</span></span>
                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mt-1">B2B Heavy Logistics</span>
              </div>
              
              <div className="flex items-center gap-2 ml-2 md:ml-4 border-l border-white/10 pl-2 md:pl-4">
                 <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white hover:-translate-y-0.5 transition-all" aria-label="TikTok">
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v5.8c0 1.97-.55 3.96-1.68 5.56-1.09 1.55-2.6 2.72-4.39 3.23-1.87.53-3.92.51-5.75-.1-1.85-.62-3.41-1.86-4.45-3.52-1.05-1.66-1.45-3.7-1.15-5.65.29-1.92 1.25-3.69 2.68-5.01 1.41-1.29 3.26-2 5.2-2.19V10.2c-1.12.06-2.22.38-3.17.93-.91.53-1.64 1.29-2.12 2.22-.49.95-.71 2.05-.6 3.12.11 1.1.58 2.14 1.3 2.97.74.84 1.73 1.42 2.84 1.63 1.15.22 2.37.1 3.42-.38 1.05-.48 1.91-1.27 2.44-2.28.53-1.02.79-2.19.78-3.36V0h3.6z" /></svg>
                 </a>
                 <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1877F2] hover:-translate-y-0.5 transition-all" aria-label="Facebook">
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04c-5.5 0-10 4.48-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.54-4.5-10.02-10-10.02z" /></svg>
                 </a>
                 <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E4405F] hover:-translate-y-0.5 transition-all" aria-label="Instagram">
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                 </a>
              </div>
            </div>
            <p className="max-w-xs mx-auto md:mx-0 leading-relaxed text-xs">
              {t.legalWarning}
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-sm">{t.navFooterTitle}</h4>
            <ul className="space-y-2">
              <li><a href="#inventory" className="hover:text-red-500 transition-colors uppercase text-xs font-black">{t.stockTitle}</a></li>
              <li><a href="#requirements" className="hover:text-red-500 transition-colors uppercase text-xs font-black">{t.reqTitle}</a></li>
              <li><button onClick={() => setShowLegal(true)} className="hover:text-red-500 transition-colors uppercase text-xs font-black">{t.legalLink}</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-sm">{t.hqFooterTitle}</h4>
            <p className="mb-1 text-xs">123 Car Street, Noda-shi</p>
            <p className="mb-2 text-xs">Chiba, Japan 278-0000</p>
            <p className="text-red-500 font-bold text-xs">{t.contactLabel} +81 80-1234-5678</p>
          </div>
        </div>
        <div className="text-center mt-12 border-t border-slate-900 pt-6 text-xs uppercase tracking-widest flex flex-col gap-4">
          <div className="text-slate-400 space-y-1 flex flex-col sm:flex-row justify-center items-center gap-2">
            <p className="font-bold">{t.devBy}</p>
            <span className="hidden sm:inline">•</span>
            <p className="opacity-70 hover:opacity-100 transition-opacity">
              <a href="https://monkey-oficial-788586066471.asia-east1.run.app/" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">
                Monkey Business
              </a>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <p className="opacity-40">© 2024 LM KAITORI GOUDOU GAISHA • {t.dealerLicense} #123456789</p>
            <span className="hidden sm:inline text-slate-800">|</span>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowLegal(true)} className="text-slate-300 hover:text-red-500 transition-all border-b border-white/10 hover:border-red-500 pb-1">{t.privacyLink}</button>
              <button onClick={() => setShowLegal(true)} className="text-slate-300 hover:text-red-500 transition-all border-b border-white/10 hover:border-red-500 pb-1">{t.termsLink}</button>
            </div>
          </div>
        </div>
      </footer>

      <FloatingContactButtons lang={currentLang} t={t} />
    </div>
  );
};

export default App;
