
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Car, Language } from '../types';
import { calculateCarLoan } from '../utils/finance';
import { getOptimizedImageUrl } from '../utils/imageOptimization';
import LoanApplicationModal from './LoanApplicationModal';

interface InventoryProps {
  cars: Car[];
  t: any;
  lang: Language;
  onDelete?: (id: string) => void;
  onEdit?: (car: Car) => void;
  onApply: (app: any) => void;
}

const Inventory: React.FC<InventoryProps> = ({ cars, t, lang, onDelete, onEdit, onApply }) => {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [carForApplication, setCarForApplication] = useState<Car | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const [selectedDestId, setSelectedDestId] = useState<string>('valpariso');
  const [isCustomDestSelected, setIsCustomDestSelected] = useState<boolean>(false);
  const [filtroCategoria, setFiltroCategoria] = useState('Todo');

  const tabsCategorias = ['Todo', 'Maquinarias', 'Vehículos Usados', 'Desguaces'];

  const EST_DESTINATIONS = [
    { id: 'valpariso', name: 'Valparaíso, Chile', port: 'Pto. Valparaíso 🇨🇱', days: lang === Language.ES ? '32-35 días' : lang === Language.PT ? '32-35 dias' : '32-35 days', baseFreight: 1850, icon: '🇨🇱' },
    { id: 'asuncion', name: 'Asunción, Paraguay', port: 'Pto. Asunción (Vía Fluvial) 🇵🇾', days: lang === Language.ES ? '42-45 días' : lang === Language.PT ? '42-45 dias' : '42-45 days', baseFreight: 2450, icon: '🇵🇾' },
    { id: 'cochabamba', name: 'Cochabamba, Bolivia', port: 'Cochabamba (Vía Arica) 🇧🇴', days: lang === Language.ES ? '45-50 días' : lang === Language.PT ? '45-50 dias' : '45-50 days', baseFreight: 2250, icon: '🇧🇴' },
    { id: 'lima', name: 'Lima, Perú', port: 'Pto. Callao 🇵🇪', days: lang === Language.ES ? '25-28 días' : lang === Language.PT ? '25-28 dias' : '25-28 days', baseFreight: 1650, icon: '🇵🇪' },
    { id: 'arabia', name: 'Arabia Saudita', port: 'Jeddah Port 🇸🇦', days: lang === Language.ES ? '20-25 días' : lang === Language.PT ? '20-25 dias' : '20-25 days', baseFreight: 1950, icon: '🇸🇦' },
    { id: 'australia', name: 'Australia', port: 'Pto. Melbourne 🇦🇺', days: lang === Language.ES ? '14-18 días' : lang === Language.PT ? '14-18 dias' : '14-18 days', baseFreight: 1250, icon: '🇦🇺' }
  ];

  const getCategoryTranslation = (cat: string) => {
    if (lang === Language.ES) return cat;
    if (cat === 'Todo') return lang === Language.PT ? 'Tudo' : 'All';
    if (cat === 'Maquinarias') return lang === Language.PT ? 'Máquinas' : 'Machinery';
    if (cat === 'Vehículos Usados') return lang === Language.PT ? 'Veículos Usados' : 'Used Vehicles';
    if (cat === 'Desguaces') return lang === Language.PT ? 'Desmanches' : 'Dismantling';
    return cat;
  };

  const currentDest = EST_DESTINATIONS.find(d => d.id === selectedDestId) || EST_DESTINATIONS[0];

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://placehold.co/800x600/1e293b/ffffff?text=Imagen+LM+Kaitori';
    target.className = target.className + " opacity-50 grayscale";
  };

  const estimateMonthly = (car: Car) => {
    const calc = calculateCarLoan({
      carPrice: car.price,
      downPayment: car.customDownPayment !== undefined ? car.customDownPayment : car.price * 0.2,
      visaType: 'permanent' as any,
      requestedMonths: car.customMonths !== undefined ? car.customMonths : 36,
      commissionRate: car.commissionRate
    });
    return calc.monthlyPayment + 100;
  };

  const openGallery = (car: Car) => {
    setSelectedCar(car);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setSelectedCar(null);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const images = selectedCar?.gallery || [selectedCar?.image];
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const images = selectedCar?.gallery || [selectedCar?.image];
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCar) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeGallery();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCar]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
    touchStartX.current = null;
  };

  const renderCarCard = (car: Car, index: number, isThirdItemInPreview?: boolean) => {
    const itemDest = isCustomDestSelected 
      ? currentDest 
      : EST_DESTINATIONS[index % EST_DESTINATIONS.length];
    return (
      <div key={car.id} className={`group bg-neutral-950 border border-white/10 overflow-hidden hover:border-red-600/50 transition-all duration-500 relative flex flex-col rounded-[1.5rem] md:rounded-3xl shadow-2xl ${isThirdItemInPreview ? 'hidden sm:flex' : ''}`}>
        
        <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden cursor-pointer flex items-center justify-center border-b border-white/5" onClick={() => openGallery(car)}>
        <img 
          src={getOptimizedImageUrl(car.image, 400)} 
          alt={car.model ? `${car.make} ${car.model}` : 'Product Image'} 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-1000 grayscale-[0.2] group-hover:grayscale-0"
          onError={handleImgError}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent opacity-70"></div>
        
        {/* Image Count Indicator */}
        {car.gallery && car.gallery.length > 1 && (
          <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/60 backdrop-blur-md px-1.5 md:px-2 py-0.5 text-[8px] md:text-[9px] font-bold text-white border border-white/10 flex items-center gap-1 z-10 rounded">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {car.gallery.length}
          </div>
        )}

        <div className={`absolute top-2 left-2 md:top-3 md:left-3 text-white text-[8px] md:text-[9px] font-black px-1.5 md:px-2 pb-0.5 pt-1 italic-slant shadow-lg tracking-widest rounded-sm ${
          car.status === 'sold' ? 'bg-slate-600' :
          car.status === 'reserved' ? 'bg-amber-600' :
          'bg-red-600'
        }`}>
          {car.status === 'sold' ? (lang === Language.ES ? 'Vendido' : lang === Language.PT ? 'Vendido' : 'Sold') :
           car.status === 'reserved' ? (lang === Language.ES ? 'Reservado' : lang === Language.PT ? 'Reservado' : 'Reserved') :
           (lang === Language.ES ? 'Disponible' : lang === Language.PT ? 'Disponível' : 'Available')}
        </div>
        <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-black/75 backdrop-blur-md px-2 md:px-2.5 py-1 md:py-1.5 border border-white/10 rounded-lg">
          <p className="text-[7px] md:text-[8px] text-slate-400 uppercase font-black tracking-widest leading-none mb-0.5">
            {lang === Language.ES ? 'ESTIBA Y LAB.' : lang === Language.PT ? 'LABOR E ESTIVA' : 'EST. VANNING'}
          </p>
          <p className="text-white font-black text-xs md:text-sm leading-none mono-font tracking-tight">
            ${estimateMonthly(car).toLocaleString()}<span className="text-[8px] md:text-[9px] font-medium text-red-500 ml-0.5">
              {lang === Language.ES ? '/lote' : lang === Language.PT ? '/lote' : '/lot'}
            </span>
          </p>
        </div>
      </div>
      
      <div className="p-3 md:p-5 flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start mb-3 md:mb-4 gap-1 md:gap-2">
          <div className="space-y-1">
            <span className="text-red-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest block leading-none">
              {lang === Language.PT ? (car.makePt || car.make) : lang === Language.EN ? (car.makeEn || car.make) : car.make}
            </span>
            <h3 className="text-sm md:text-base font-black text-white leading-tight uppercase tracking-tight line-clamp-1">
              {lang === Language.PT ? (car.modelPt || car.model) : lang === Language.EN ? (car.modelEn || car.model) : car.model}
            </h3>
            <div className="flex gap-1.5 md:gap-2 items-center flex-wrap">
              <span className="bg-red-600/10 border border-red-600/20 px-1 md:px-1.5 py-0.5 text-[7px] md:text-[8px] font-black text-red-500 mono-font tracking-wider rounded">
                ID #{car.year}
              </span>
              <span className="text-slate-400 text-[8px] md:text-[9px] font-bold uppercase tracking-wider truncate max-w-[100px] md:max-w-[120px]">
                {lang === Language.PT ? (car.enginePt || car.engine) : lang === Language.EN ? (car.engineEn || car.engine) : car.engine}
              </span>
            </div>
          </div>
          <div className="text-left md:text-right shrink-0 mt-1 md:mt-0">
            <p className="text-[7px] md:text-[8px] text-red-500 font-bold uppercase tracking-widest leading-none mb-0.5 md:mb-1">FOB JP</p>
            <p className="text-white font-black text-base md:text-lg tracking-tighter mono-font">${car.price.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 mb-3 rounded-xl overflow-hidden">
          <div className="bg-neutral-900 p-2 md:p-3">
            <p className="text-[7px] md:text-[8px] text-slate-400 font-bold tracking-widest uppercase mb-1">
              {lang === Language.ES ? 'PESO APX' : lang === Language.PT ? 'PESO APX' : 'EST. WEIGHT'}
            </p>
            <p className="text-white font-black text-[10px] md:text-xs mono-font">
              {car.weight ? `${car.weight}` : car.mileage.toLocaleString()} <span className="text-[7px] md:text-[8px] font-normal text-slate-400">KG</span>
            </p>
          </div>
          <div className="bg-neutral-900 p-2 md:p-3">
            <p className="text-[7px] md:text-[8px] text-slate-400 font-bold tracking-widest uppercase mb-1">
              {lang === Language.ES ? 'ACOPIO' : lang === Language.PT ? 'ACOPIO' : 'YARD'}
            </p>
            <p className="text-red-500 font-black text-[10px] md:text-xs uppercase tracking-tight truncate">
              {car.shaken}
            </p>
          </div>
        </div>

        {/* Dynamic Shipping Destination Block */}
        <div className="bg-red-600/5 border border-red-600/10 rounded-xl p-2 md:p-3 mb-3 md:mb-4 flex flex-col md:flex-row justify-between items-start md:items-center text-xs gap-2 md:gap-0">
          <div className="w-full md:flex-1 md:mr-2 overflow-hidden">
            <p className="text-[7px] md:text-[8px] text-slate-500 uppercase font-bold tracking-wider leading-none mb-1">
              {lang === Language.ES ? 'DESTINO / FLETE' : lang === Language.PT ? 'DESTINO / FRETE' : 'DESTINATION / FREIGHT'}
            </p>
            <select 
              className="bg-black/50 text-white font-extrabold text-[9px] sm:text-[11px] leading-tight uppercase border border-white/10 hover:border-red-600/50 rounded p-1 outline-none w-full cursor-pointer transition-colors"
              value={itemDest.id}
              onChange={(e) => {
                setSelectedDestId(e.target.value);
                setIsCustomDestSelected(true);
              }}
            >
              {EST_DESTINATIONS.map(dest => (
                <option key={dest.id} value={dest.id} className="bg-neutral-900 text-white">
                  {dest.icon} {dest.name.split(',')[0]}
                </option>
              ))}
            </select>
          </div>
          <div className="text-left md:text-right shrink-0 w-full md:w-auto flex justify-between md:block">
            <p className="text-red-500 font-black text-[10px] md:text-xs leading-none md:mb-1">
              +${itemDest.baseFreight.toLocaleString()} <span className="text-[7px] md:text-[8px] font-normal text-slate-400">USD</span>
            </p>
            <p className="text-slate-500 text-[7px] md:text-[8px] font-bold leading-none">
              {itemDest.days}
            </p>
          </div>
        </div>
        
        <div className="mt-auto grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2 pt-1 md:pt-2">
          <button onClick={() => openGallery(car)} className="w-full bg-white/5 hover:bg-white hover:text-black border border-white/10 text-white font-black py-2 md:py-2.5 rounded-lg md:rounded-xl uppercase tracking-widest transition-all duration-300 text-[9px] md:text-[10px]">
            {t.details}
          </button>
          <button 
            onClick={() => setCarForApplication(car)}
            disabled={car.status === 'sold' || car.status === 'reserved'}
            className={`w-full font-black py-2 md:py-2.5 rounded-lg md:rounded-xl uppercase tracking-widest transition-all duration-300 text-[9px] md:text-[10px] ${
              car.status === 'sold' || car.status === 'reserved' 

                ? 'bg-neutral-800 text-slate-500 cursor-not-allowed border border-white/5'
                : 'bg-red-600 text-white hover:bg-white hover:text-black shadow-lg shadow-red-600/15'
            }`}
          >
            {car.status === 'sold' ? (lang === Language.ES ? 'No Disponible' : lang === Language.PT ? 'Indisponível' : 'Unavailable') :
             car.status === 'reserved' ? (lang === Language.ES ? 'Reservado' : lang === Language.PT ? 'Reservado' : 'Reserved') :
             t.applyNow}
          </button>
        </div>
      </div>
    </div>
    );
  };

  return (
    <section className="relative group/inventory">
      {/* Dynamic Shipping Destination Selector */}
      <div className="bg-neutral-900/60 border border-white/10 rounded-3xl p-6 md:p-8 mb-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 blur-[80px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="flex flex-col gap-6 relative z-10">
          <div className="text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h4 className="text-red-500 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]"></span>
                {t.inventoryDestTitle}
              </h4>
              <p className="text-slate-300 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
                {t.inventoryDestSub}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {EST_DESTINATIONS.map((dest) => (
              <button
                key={dest.id}
                onClick={() => { setSelectedDestId(dest.id); setIsCustomDestSelected(true); }}
                className={`relative group overflow-hidden p-3 md:p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 w-full h-24 md:h-28 ${
                  isCustomDestSelected && selectedDestId === dest.id
                    ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] scale-[1.02]'
                    : 'bg-black/50 hover:bg-neutral-800 border-white/5 hover:border-white/20 text-slate-400 hover:text-white hover:scale-[1.02] hover:shadow-xl'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 ${isCustomDestSelected && selectedDestId === dest.id ? 'opacity-100' : 'group-hover:opacity-100'}`}></div>
                <span className="text-2xl md:text-3xl leading-none filter drop-shadow-md z-10 transition-transform duration-300 group-hover:-translate-y-1">{dest.icon}</span>
                <span className="font-black text-[10px] md:text-xs uppercase tracking-widest text-center z-10">{dest.name.split(',')[0]}</span>
              </button>
            ))}
          </div>

          {/* Compact Selected Destination Info */}
          {isCustomDestSelected && (
            <div className="mt-4 p-3 md:p-4 bg-red-950/20 border border-red-500/20 rounded-xl flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-base">⚓</span>
                <span className="text-slate-300 uppercase tracking-widest font-bold text-[9px] md:text-[10px]">
                  {t.destPortLabel} <strong className="text-white text-xs">{currentDest.port}</strong>
                </span>
              </div>
              <div className="hidden md:block w-px h-4 bg-white/10"></div>
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-base">⏱️</span>
                <span className="text-slate-300 uppercase tracking-widest font-bold text-[9px] md:text-[10px]">
                  {t.destTransitLabel} <strong className="text-white text-xs">{currentDest.days}</strong>
                </span>
              </div>
              <div className="hidden md:block w-px h-4 bg-white/10"></div>
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-base">🚢</span>
                <span className="text-slate-300 uppercase tracking-widest font-bold text-[9px] md:text-[10px]">
                  {t.destFreightLabel} <strong className="text-red-400 text-xs">+${currentDest.baseFreight.toLocaleString()} USD</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-stretch gap-4 md:gap-6 mb-8 px-2 md:px-4">
        <div className="w-1.5 md:w-2 bg-red-600 shadow-[0_0_20px_rgba(225,6,0,0.5)] shrink-0"></div>
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter italic-slant leading-[1.1] md:leading-none py-1">
            {t.stockTitle.split(' - ')[0]}
          </h2>
          <p className="text-red-600 font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] text-[9px] md:text-[11px] mt-1.5 md:mt-2 italic-slant">
            {t.clientsTrusted}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-2 md:px-4 mb-8">
        {tabsCategorias.map(cat => (
          <button
            key={cat}
            onClick={() => setFiltroCategoria(cat)}
            className={`px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-300 ${
              filtroCategoria === cat 
                ? 'bg-[#e10600] text-white shadow-[0_0_15px_rgba(225,6,0,0.4)] border border-[#e10600]' 
                : 'bg-[#1a1a1a] text-slate-400 hover:text-white border border-white/10 hover:border-white/30'
            }`}
          >
            {getCategoryTranslation(cat)}
          </button>
        ))}
      </div>

      {cars.filter(item => filtroCategoria === 'Todo' || item.make === filtroCategoria).length === 0 ? (
        <div className="px-4 py-16 text-center border border-white/10 rounded-3xl bg-[#111] max-w-3xl mx-auto mb-12">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
            {lang === Language.ES ? 'No hay vehículos o maquinarias disponibles por el momento.' : lang === Language.PT ? 'Não há veículos ou máquinas disponíveis no momento.' : 'No vehicles or machinery available at the moment.'}
          </p>
        </div>
      ) : filtroCategoria === 'Todo' ? (
        <div className="flex flex-col gap-12 pb-12">
          {['Maquinarias', 'Vehículos Usados', 'Desguaces'].map(categoria => {
            const itemsEnCategoria = cars.filter(item => item.make === categoria);
            if (itemsEnCategoria.length === 0) return null;
            return (
              <div key={categoria} className="space-y-6">
                <div className="flex justify-between items-end px-2 md:px-4 border-b border-white/10 pb-4">
                  <h3 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter italic-slant text-white">
                    {getCategoryTranslation(categoria)}
                  </h3>
                  {itemsEnCategoria.length > 2 && (
                    <button 
                      onClick={() => setFiltroCategoria(categoria)}
                      className={`text-red-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors items-center gap-2 ${itemsEnCategoria.length === 3 ? 'flex sm:hidden' : 'flex'}`}
                    >
                      {lang === Language.ES ? 'Ver más' : lang === Language.PT ? 'Ver mais' : 'See more'} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
                  {itemsEnCategoria.slice(0, 3).map((car, index) => renderCarCard(car, index, index === 2))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 pb-12">
          {cars.filter(item => item.make === filtroCategoria).map((car, index) => renderCarCard(car, index))}
        </div>
      )}

      <LoanApplicationModal 
        isOpen={!!carForApplication}
        onClose={() => setCarForApplication(null)}
        onApply={onApply}
        t={t}
        carName={carForApplication ? `${carForApplication.make} ${carForApplication.model}` : ''}
        monthlyPayment={carForApplication ? estimateMonthly(carForApplication) : 0}
        initialDestination={(() => {
          if (!carForApplication) return '';
          const appCarIndex = cars.findIndex(c => c.id === carForApplication.id);
          const modalDest = isCustomDestSelected 
            ? currentDest 
            : EST_DESTINATIONS[appCarIndex !== -1 ? appCarIndex % EST_DESTINATIONS.length : 0];
          return `${modalDest.icon} ${modalDest.name} (${modalDest.port})`;
        })()}
      />

      {selectedCar && (
        <div 
          className="fixed inset-0 z-[120] bg-black grid grid-rows-[auto_1fr_auto] h-screen w-screen animate-in fade-in duration-500"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
           {/* Background Speed Effect */}
           <div className="absolute inset-0 opacity-10 pointer-events-none carbon-pattern"></div>

           {/* Header */}
           <div className="flex justify-between items-center px-6 py-6 sm:px-12 bg-black border-b border-white/10 z-50">
              <div className="flex items-center gap-6">
                <div className="bg-red-600 w-14 h-14 flex items-center justify-center font-black text-white italic-slant text-2xl">GW</div>
                <div className="text-white">
                  <h3 className="text-xl sm:text-3xl font-black italic-slant uppercase tracking-tighter">{selectedCar.make} {selectedCar.model}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] text-red-600 font-black uppercase tracking-[0.3em] animate-pulse">Live Visual Feed</span>
                    <span className="text-[10px] text-slate-500 font-bold mono-font">
                      LENS_CAM_{currentImageIndex + 1}_OF_{selectedCar.gallery?.length || 1}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={closeGallery}
                className="bg-red-600 text-white p-4 border border-red-500 hover:bg-white hover:text-red-600 transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>

           {/* Image Frame */}
           <div className="relative flex items-center justify-center overflow-hidden">
              {/* Technical HUD Overlays */}
              <div className="absolute top-10 left-10 w-32 h-32 border-l-2 border-t-2 border-red-600/30 hidden lg:block opacity-40"></div>
              <div className="absolute top-10 right-10 w-32 h-32 border-r-2 border-t-2 border-red-600/30 hidden lg:block opacity-40"></div>
              <div className="absolute bottom-10 left-10 w-32 h-32 border-l-2 border-b-2 border-red-600/30 hidden lg:block opacity-40"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 border-r-2 border-b-2 border-red-600/30 hidden lg:block opacity-40"></div>

              <button 
                onClick={prevImage} 
                aria-label="Previous image"
                className="absolute left-4 sm:left-8 z-50 bg-black/50 hover:bg-red-600 text-white p-3 sm:p-8 border border-white/10 transition-all duration-300 rounded-full sm:rounded-none"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M15 19l-7-7 7-7" /></svg>
              </button>

                  <div className="w-full h-full flex items-center justify-center p-4">
                     <motion.img 
                        key={`${selectedCar.id}-${currentImageIndex}`}
                        src={getOptimizedImageUrl((selectedCar.gallery && selectedCar.gallery.length > 0) ? selectedCar.gallery[currentImageIndex] : selectedCar.image, 800)} 
                        initial={{ opacity: 0, scale: 0.9, rotateY: currentImageIndex === 0 ? 360 : 0 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ 
                          duration: 0.8, 
                          type: "spring", 
                          stiffness: 100, 
                          damping: 20
                        }}
                        className="max-h-[85vh] max-w-full object-contain shadow-[0_0_100px_rgba(225,6,0,0.1)] border-2 border-white/5"
                        alt={selectedCar.model ? `${selectedCar.make} ${selectedCar.model} - View ${currentImageIndex + 1}` : 'Car Full View'}
                        loading="lazy"
                        decoding="async"
                        onError={handleImgError}
                     />
                  </div>

              <button 
                onClick={nextImage} 
                aria-label="Next image"
                className="absolute right-4 sm:right-8 z-50 bg-black/50 hover:bg-red-600 text-white p-3 sm:p-8 border border-white/10 transition-all duration-300 rounded-full sm:rounded-none"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 5l7 7-7 7" /></svg>
              </button>
           </div>

           {/* Thumbnails */}
           <div className="p-6 bg-black border-t border-white/10 flex justify-center items-center gap-3 overflow-x-auto custom-scrollbar z-50">
              <div className="flex gap-4 px-4">
                {(selectedCar.gallery || [selectedCar.image]).map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 sm:w-24 sm:h-24 overflow-hidden border-2 transition-all duration-300 shrink-0 ${currentImageIndex === idx ? 'border-red-600 scale-110' : 'border-transparent opacity-30 hover:opacity-100'}`}
                  >
                    <img 
                      src={getOptimizedImageUrl(img, 400)} 
                      className="w-full h-full object-cover" 
                      alt={selectedCar.model ? `${selectedCar.make} ${selectedCar.model} - Thumbnail ${idx + 1}` : `Thumb ${idx}`} 
                      loading="lazy"
                      decoding="async"
                      onError={handleImgError} 
                    />
                  </button>
                ))}
              </div>
           </div>
        </div>
      )}
    </section>
  );
};

export default Inventory;
