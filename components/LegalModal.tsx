import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { translations } from '../translations';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, lang }) => {
  const content = {
    [Language.ES]: {
      title: "Información Logística y Términos Comerciales",
      company: "LM KAITORI GOUDOU GAISHA",
      license: "Licencia de Reciclaje y Desguace de Automotores oficiales: No. 123456789",
      authority: "Emitido bajo la Ley de Reciclaje de Japón (自動車リサイクル法 許可取得済)",
      sections: [
        {
          h: "1. Marco Jurídico de Exportación",
          p: "LM KAITORI GOUDOU GAISHA opera desarmaderos autorizados en Japón respetando las directivas técnicas de la Comisión de Seguridad Pública y la ley de reciclaje vehicular, proveyendo facturación comercial y certificados de desguace para importación directa en aduanas."
        },
        {
          h: "2. Estado de los Repuestos y Motores",
          p: "Las autopartes, frentes (half cuts) y vehículos chocados se suministran listos para desarme 'AS IS' (en el estado en que se encuentran en el patio de Chiba/Nagoya). Todos los motores incluidos en los lotes son testeados de encendido y compresión por nuestros operarios antes del vanning."
        },
        {
          h: "3. Tarifas de Vanning y Estiba",
          p: "Los precios cotizados FOB incluyen el valor de los lotes de repuestos seleccionados, el despacho de aduana en puerto de salida de Japón, y las tareas físicas de desmontaje y estiba (labor de vanning para optimización de volumen). El flete marítimo se cotiza por separado según navieras."
        },
        {
          h: "4. Cancelaciones de Carga",
          p: "Debido a que el desmontaje mecánico de vehículos siniestrados inicia inmediatamente tras el pago del depósito de reserva (10%, 20% o 50% según la estiba acordada), cualquier cancelación incurrirá en la pérdida de la seña para amortizar la mano de obra del patio."
        },
        {
          h: "5. Acuerdos de Importación en Destino",
          p: "Es responsabilidad total del comprador y su empresa destinar los permisos de importación locales requeridos para el ingreso de partes usadas de motor, amortiguadores y fluidos mecánicos purgados según las leyes aduaneras de su país."
        }
      ]
    },
    [Language.EN]: {
      title: "Logistics Terms & Trading Guidelines",
      company: "LM KAITORI GOUDOU GAISHA",
      license: "Official Automotive Dismantler & Scrap License: No. 123456789",
      authority: "Registered under Japan End-of-Life Vehicle Recycling Act",
      sections: [
        {
          h: "1. Export Legal Framework",
          p: "LM KAITORI GOUDOU GAISHA operates accredited dismantling hubs in Japan supporting local public safety acts and official recycling schemes. We issue genuine commercial invoices and de-registration salvage certificates for destination customs."
        },
        {
          h: "2. Parts & Powertrain Condition",
          p: "All spare parts, engine packs, half cuts, and salvage vehicles are supplied 'AS IS' from our Chiba/Nagoya facilities. Engine assemblies in wholesale packs undergo strict startup and compression diagnostics before container loading."
        },
        {
          h: "3. Vanning & Yard Handling Services",
          p: "Quoted FOB prices include selected parts value, Japanese export customs manifest paperwork, and skilled yard labor for container vanning (space optimization). Ocean freight lines are quoted separately according to selected shipping routes."
        },
        {
          h: "4. Loading Cancellation Policy",
          p: "Since physical mechanical dismantling of salvaged autos commences immediately upon booking deposit (10%, 20%, or 50% depending on container type), any order cancellations will result in forfeiture of deposit to cover yard work labor cost."
        },
        {
          h: "5. Destination Import Laws",
          p: "The importing scrapyard or buyer assumes full responsibility for securing local environment permissions, used motor imports clearances, and fluid scrap processing codes required in their country of destination."
        }
      ]
    },
    [Language.PT]: {
      title: "Termos Jurídicos e Logística de Exportação",
      company: "LM KAITORI GOUDOU GAISHA",
      license: "Licença de Descarte e Reciclagem Automotiva Registrada: No. 123456789",
      authority: "Licenciado pela Lei de Reciclagem de Veículos Industriais de Motor do Japão",
      sections: [
        {
          h: "1. Enquadramento Legal de Exportação",
          p: "A LM KAITORI GOUDOU GAISHA opera depósitos de desmonte autorizados no Japão. Emitimos faturas comerciais oficiais e laudos de sucateamento para que sua empresa realize a importação regulamentada sem gargalos fiscais."
        },
        {
          h: "2. Condição das Peças e Motores",
          p: "Peças mecânicas, frentes de corte (half cuts) e sucatas de carros batidos são fornecidos no estado de conservação atual ('AS IS' no pátio). Nossos engenheiros testam a compressão e funcionamento de todos os motores antes de fechar o contêiner."
        },
        {
          h: "3. Taxa de Vanning (Serviço de Pátio)",
          p: "O preço FOB orçado compreende o valor do lote, mão de obra de desmontagem mecânica, estufagem organizada no contêiner para melhor aproveitamento, e trâmites de desembaraço no porto japonês."
        },
        {
          h: "4. Cancelamento de Carga Mecânica",
          p: "Iniciamos a desmontagem mecânica de eixos e transmissões imediatamente após a confirmação do depósito. Cancelamentos implicarão na retenção do adiantamento para cobrir as horas trabalhadas pelos mecânicos e desvalorização do lote."
        },
        {
          h: "5. Normas de Importação Locais",
          p: "O importador ou desmonte final é responsável exclusivo em garantir que possui as licenças ambientais necessárias no seu país de destino para a entrada de motores usados e caixas de câmbio."
        }
      ]
    }
  };

  const activeContent = content[lang as keyof typeof content] || content[Language.EN];

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="legal_modal_overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 p-6 md:p-10 overflow-y-auto max-h-[90vh] shadow-2xl"
          >
            <button 
              id="legal_modal_close_btn"
              onClick={onClose}
              className="absolute top-6 right-6 bg-red-600 text-white p-2 border border-red-500 hover:bg-white hover:text-red-600 transition-all z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-black italic-slant uppercase tracking-tighter text-white mb-2">
                {activeContent.title}
              </h2>
              <div className="h-1 w-20 bg-red-600 shadow-[0_0_15px_rgba(225,6,0,0.5)]"></div>
            </div>

            <div className="space-y-6 text-slate-400 font-medium text-xs md:text-sm leading-relaxed">
              <div className="bg-red-600/5 p-5 border-l-4 border-red-600 border border-white/5">
                <p className="text-white font-black uppercase tracking-widest text-[9px] mb-2 leading-none">Scrapyard Licensing Details</p>
                <p className="text-white font-bold mb-1">{activeContent.company}</p>
                <p className="text-slate-300 text-xs">{activeContent.license}</p>
                <p className="text-[10px] text-red-600 font-black mt-2 uppercase tracking-wide italic-slant">{activeContent.authority}</p>
              </div>

              {activeContent.sections.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-white font-black italic-slant uppercase tracking-wider text-xs border-b border-white/5 pb-2">
                    {section.h}
                  </h3>
                  <p className="text-slate-400">{section.p}</p>
                </div>
              ))}

              <div className="pt-8 border-t border-white/5 text-center">
                <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600">
                  Export Yard Regulation: Chiba & Nagoya Port, Japan • Tokyo Arbitration Act
                </p>
              </div>
            </div>

            <button 
              id="legal_modal_accept_btn"
              onClick={onClose}
              className="w-full mt-10 bg-red-600 text-white py-4 font-black uppercase tracking-widest italic-slant hover:bg-white hover:text-black transition-all"
            >
              {translations[lang].acceptAndClose}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LegalModal;
