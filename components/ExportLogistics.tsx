import React, { useState, useEffect } from 'react';
import { Search, Wrench, Package, FileText, MapPin, ChevronDown } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { Language } from '../types';

export default function ExportLogistics({ t, mapImage, lang }: { t: any; mapImage?: string | null; lang: Language }) {
  const [activeStep, setActiveStep] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mapScale = windowWidth < 768 ? 2000 : windowWidth < 1024 ? 2800 : 3600;
  const mapCenter = windowWidth < 1024 ? [138, 38.5] : [138, 38.5];

  const steps = [
    {
      icon: <Search className="w-5 h-5 md:w-6 md:h-6" />,
      title: t.service1Title,
      description: t.service1Desc
    },
    {
      icon: <Wrench className="w-5 h-5 md:w-6 md:h-6" />,
      title: t.service2Title,
      description: t.service2Desc
    },
    {
      icon: <Package className="w-5 h-5 md:w-6 md:h-6" />,
      title: t.service3Title,
      description: t.service3Desc
    },
    {
      icon: <FileText className="w-5 h-5 md:w-6 md:h-6" />,
      title: t.service4Title,
      description: t.service4Desc
    }
  ];

  const ports = [
    { name: 'Tokyo', coordinates: [139.6917, 35.6895], align: 'top' },
    { name: 'Yokohama', coordinates: [139.6380, 35.4437], align: 'right' },
    { name: 'Nagoya', coordinates: [136.9066, 35.1815], align: 'bottom' },
    { name: 'Osaka', coordinates: [135.5023, 34.6937], align: 'bottom' },
    { name: 'Fukuoka', coordinates: [130.4017, 33.5902], align: 'bottom' }
  ];

  const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

  return (
    <section className="bg-transparent py-16 relative overflow-hidden border-t border-white/5">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Main Grid: Info/Steps on Left, Map on Right */}
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Title, Description, and Accordion */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic-slant tracking-tighter mb-4">
                {t.logisticsTitle.split(' ').slice(0, -1).join(' ')} <span className="text-[#e10600]">{t.logisticsTitle.split(' ').slice(-1).join(' ')}</span>
              </h2>
              <p className="text-slate-400 font-mono text-sm leading-relaxed mb-6">
                {t.logisticsSub}
              </p>
              
              <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#e10600]/5 blur-3xl rounded-full pointer-events-none group-hover:bg-[#e10600]/10 transition-colors"></div>
                <div className="inline-flex items-center gap-2 bg-[#e10600]/10 text-[#e10600] px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {t.coverageLabel}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase italic-slant tracking-tight mb-3">
                  {t.coverageTitle}
                </h3>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed border-l-2 border-[#e10600] pl-4" dangerouslySetInnerHTML={{ __html: t.coverageText }} />
              </div>
            </div>

            {/* Dynamic Accordion Steps */}
            <div className="flex flex-col gap-3">
              {steps.map((step, index) => {
                const isActive = activeStep === index;
                return (
                  <div 
                    key={index} 
                    className={`bg-black/20 backdrop-blur-md rounded-xl border transition-all cursor-pointer overflow-hidden ${isActive ? 'border-[#e10600]/40 shadow-[0_0_20px_rgba(225,6,0,0.1)]' : 'border-white/5 hover:border-white/10'}`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className="p-4 md:p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-[#e10600]/10 text-[#e10600]' : 'bg-black text-slate-500'}`}>
                          {React.cloneElement(step.icon, { className: isActive ? 'text-[#e10600]' : 'text-slate-500' })}
                        </div>
                        <h3 className={`font-bold tracking-tight text-sm md:text-base transition-colors ${isActive ? 'text-white' : 'text-slate-300'}`}>
                          <span className="text-[#e10600] mr-2 font-black">{index + 1}.</span>
                          {step.title}
                        </h3>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
                    </div>
                    
                    <div className={`px-4 md:px-5 pb-5 md:pb-6 pt-0 ml-[52px] md:ml-[64px] transition-all duration-300 ${isActive ? 'block animate-in fade-in slide-in-from-top-2' : 'hidden'}`}>
                      <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Real Map with Cyber Aesthetic */}
          <div className="relative w-full h-[650px] sm:h-[750px] lg:h-[800px] xl:h-[900px] bg-transparent rounded-3xl border border-[#4fd1c5]/20 overflow-hidden flex items-end justify-center shadow-[0_0_30px_rgba(79,209,197,0.05)]">
            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            {mapImage ? (
              <img src={mapImage} alt="Export Logistics Map" className="absolute inset-0 w-full h-full object-contain object-center z-10 p-4" />
            ) : (
            <ComposableMap
              projection="geoMercator"
              preserveAspectRatio="xMidYMax meet"
              width={800}
              height={900}
              projectionConfig={{
                scale: mapScale,
                center: mapCenter as [number, number]
              }}
              className="absolute bottom-0 w-full h-[110%] z-10"
              style={{ objectPosition: 'bottom' }}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies
                    .filter((geo: any) => geo.properties.name === "Japan")
                    .map((geo: any) => (
                      <Geography 
                        key={geo.rsmKey} 
                        geography={geo} 
                        fill="#082f49" 
                        stroke="#4fd1c5"
                        strokeWidth={1}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", fill: "#0c4a6e" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                }
              </Geographies>
              
              {/* Ports Markers */}
              {ports.map((port, idx) => (
                <Marker key={idx} coordinates={port.coordinates as [number, number]}>
                  <g className="transition-transform hover:scale-110 cursor-pointer">
                    {/* Normal pulsing rings */}
                    <circle r="12" className="fill-transparent stroke-[#e10600] stroke-[0.5] animate-ping opacity-60" style={{ animationDuration: '2s' }} />
                    
                    {/* Core dot */}
                    <circle r="6" className="fill-[#e10600]" />
                    <circle r="2" className="fill-white" />
                    
                    {/* Tech Box Labels */}
                    {port.align === 'top' && (
                      <g transform={`translate(0, 0)`}>
                        <line x1="5" y1="-5" x2="15" y2="-20" stroke="#4fd1c5" strokeWidth="1" opacity="0.6" />
                        <path d="M 15,-20 L 155,-20 L 165,-2 L 165,18 L 15,18 Z" fill="#082f49" stroke="#4fd1c5" strokeWidth="1" opacity="0.9" />
                        <text x="25" y="1" fill="white" className="text-[14px] md:text-[16px] font-bold tracking-wider uppercase">{lang === Language.ES ? 'PUERTO DE' : lang === Language.PT ? 'PORTO DE' : 'PORT OF'} {port.name}</text>
                        <circle cx="25" cy="11" r="2" fill="#4fd1c5" />
                        <text x="32" y="14" fill="#4fd1c5" className="text-[10px] md:text-[11px] font-mono tracking-widest uppercase">{lang === Language.ES ? 'Activo' : lang === Language.PT ? 'Ativo' : 'Active'}</text>
                      </g>
                    )}
                    {port.align === 'bottom' && (
                      <g transform={`translate(0, 0)`}>
                        <line x1="0" y1="8" x2="-10" y2="20" stroke="#4fd1c5" strokeWidth="1" opacity="0.6" />
                        <path d="M -10,20 L 130,20 L 140,38 L 140,58 L -10,58 Z" fill="#082f49" stroke="#4fd1c5" strokeWidth="1" opacity="0.9" />
                        <text x="-3" y="41" fill="white" className="text-[14px] md:text-[16px] font-bold tracking-wider uppercase">{lang === Language.ES ? 'PUERTO DE' : lang === Language.PT ? 'PORTO DE' : 'PORT OF'} {port.name}</text>
                        <circle cx="-3" cy="51" r="2" fill="#4fd1c5" />
                        <text x="4" y="54" fill="#4fd1c5" className="text-[10px] md:text-[11px] font-mono tracking-widest uppercase">{lang === Language.ES ? 'Activo' : lang === Language.PT ? 'Ativo' : 'Active'}</text>
                      </g>
                    )}
                    {port.align === 'right' && (
                      <g transform={`translate(0, 0)`}>
                        <line x1="8" y1="0" x2="20" y2="0" stroke="#4fd1c5" strokeWidth="1" opacity="0.6" />
                        <path d="M 20,-15 L 160,-15 L 170,3 L 170,23 L 20,23 Z" fill="#082f49" stroke="#4fd1c5" strokeWidth="1" opacity="0.9" />
                        <text x="30" y="6" fill="white" className="text-[14px] md:text-[16px] font-bold tracking-wider uppercase">{lang === Language.ES ? 'PUERTO DE' : lang === Language.PT ? 'PORTO DE' : 'PORT OF'} {port.name}</text>
                        <circle cx="30" cy="16" r="2" fill="#4fd1c5" />
                        <text x="37" y="19" fill="#4fd1c5" className="text-[10px] md:text-[11px] font-mono tracking-widest uppercase">{lang === Language.ES ? 'Activo' : lang === Language.PT ? 'Ativo' : 'Active'}</text>
                      </g>
                    )}
                  </g>
                </Marker>
              ))}
            </ComposableMap>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


