
import React, { useState, useEffect } from 'react';
import { Car, Language, LoanApplication } from '../types';
import { Trash2, Phone, Mail, MapPin, Briefcase, Calendar, DollarSign, Car as CarIcon, Clock } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageOptimization';
import { db, storage, firebaseConfig, auth } from '../lib/firebase';
import { doc, setDoc, addDoc, collection, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

interface AdminInventoryProps {
  cars: Car[];
  onAddCar: (car: Car) => void;
  onEditCar: (car: Car) => void;
  onDeleteCar: (id: string) => void;
  editingCar?: Car | null;
  onClose?: () => void;
  t: any;
  lang: Language;
  applications: LoanApplication[];
  onDeleteApplication: (id: string) => void;
  operationsDocs?: {id: string, url: string}[];
  mapImage?: string | null;
}

const AdminInventory: React.FC<AdminInventoryProps> = ({ 
  cars, onAddCar, onEditCar, onDeleteCar, editingCar, onClose, t, applications, onDeleteApplication, operationsDocs = [], mapImage
}) => {
  const [isOpen, setIsOpen] = useState(window.location.pathname === '/admin');

  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError('Credenciales incorrectas');
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  useEffect(() => {
    const handlePopState = () => {
      setIsOpen(window.location.pathname === '/admin');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [activeTab, setActiveTab] = useState<'inventory' | 'applications' | 'operations' | 'settings'>('inventory');
  const [loading, setLoading] = useState(false);
  const [bulkLinks, setBulkLinks] = useState('');
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: '',
    price: '',
    engine: '660cc',
    shaken: '',
    transmission: 'AT' as 'AT' | 'MT',
    customDownPayment: '',
    customMonths: '',
    commissionRate: '0',
    status: 'available' as 'available' | 'reserved' | 'sold',
    weight: ''
  });
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([]);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [uploadError, setUploadError] = useState('');

  const [showForm, setShowForm] = useState(false);

  const [localEditingCar, setLocalEditingCar] = useState<Car | null>(null);

  const [localOpsDocs, setLocalOpsDocs] = useState<{id?: string, url: string}[]>(operationsDocs || []);
  const [opImageFiles, setOpImageFiles] = useState<(File | null)[]>([]);
  const [opsToDelete, setOpsToDelete] = useState<string[]>([]);
  
  const [mapImageFile, setMapImageFile] = useState<File | null>(null);
  const [mapImagePreview, setMapImagePreview] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setLocalOpsDocs(operationsDocs || []);
    setOpImageFiles(Array((operationsDocs || []).length).fill(null));
    setOpsToDelete([]);
  }, [operationsDocs]);

  const handleOpFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      
      const previewDocs = files.map(file => ({ url: `file-placeholder-${Date.now()}-${Math.random()}` }));
      setLocalOpsDocs(prev => [...prev, ...previewDocs]);
      setOpImageFiles(prev => [...prev, ...files]);
    }
  };

  const saveOperationsImages = async () => {
    try {
      setUploadError('');
      if (!firebaseConfig || !firebaseConfig.apiKey) {
        throw new Error("La configuración de Firebase está vacía o inválida (falta apiKey).");
      }
      setLoading(true);
      const filesToProcess = opImageFiles.filter(f => f !== null).length;
      let processedFiles = 0;

      for (const id of opsToDelete) {
        await deleteDoc(doc(db, 'operations', id));
      }

      for (let i = 0; i < opImageFiles.length; i++) {
        const file = opImageFiles[i];
        if (file) {
          processedFiles++;
          setUploadProgressText(`Subiendo foto de operaciones ${processedFiles} de ${filesToProcess}...`);
          
          const fileName = `operations/${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, file);
          const uploadedUrl = await getDownloadURL(storageRef);
          
          await addDoc(collection(db, 'operations'), {
             url: uploadedUrl,
             createdAt: serverTimestamp()
          });

          await new Promise(resolve => setTimeout(resolve, 150));
        }
      }

      setUploadProgressText('');
      setOpsToDelete([]);
      alert("Imágenes de operaciones actualizadas correctamente.");
    } catch (error: any) {
      console.error("Error al guardar imágenes de operaciones:", error);
      setUploadError(error?.message || 'Error desconocido al subir las imágenes');
      setUploadProgressText('');
    } finally {
      setLoading(false);
    }
  };

  const saveMapImage = async () => {
    if (!mapImageFile) return;
    try {
      setUploadError('');
      setLoading(true);
      setUploadProgressText('Subiendo imagen del mapa...');
      
      const fileName = `settings/exportMap_${Date.now()}_${mapImageFile.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, mapImageFile);
      const uploadedUrl = await getDownloadURL(storageRef);
      
      await setDoc(doc(db, 'settings', 'exportMap'), {
        url: uploadedUrl,
        updatedAt: serverTimestamp()
      });
      
      setMapImageFile(null);
      setMapImagePreview(null);
      alert('Imagen del mapa actualizada correctamente.');
    } catch (error: any) {
      console.error('Error uploading map image:', error);
      setUploadError(error?.message || 'Error al subir la imagen del mapa');
    } finally {
      setLoading(false);
      setUploadProgressText('');
    }
  };

  useEffect(() => {
    if (editingCar) {
      setLocalEditingCar(editingCar);
    }
  }, [editingCar]);

  useEffect(() => {
    if (localEditingCar) {
      setFormData({
        make: localEditingCar.make,
        model: localEditingCar.model,
        year: localEditingCar.year,
        mileage: String(localEditingCar.mileage),
        price: String(localEditingCar.price),
        engine: localEditingCar.engine,
        shaken: localEditingCar.shaken,
        transmission: localEditingCar.transmission,
        customDownPayment: localEditingCar.customDownPayment ? String(localEditingCar.customDownPayment) : '',
        customMonths: localEditingCar.customMonths ? String(localEditingCar.customMonths) : '',
        commissionRate: localEditingCar.commissionRate !== undefined ? String(localEditingCar.commissionRate * 100) : '0',
        status: localEditingCar.status || 'available',
        weight: localEditingCar.weight || ''
      });
      setImages(localEditingCar.gallery || [localEditingCar.image]);
      setIsOpen(true);
      setShowForm(true);
      setActiveTab('inventory');
    }
  }, [localEditingCar]);

  const handleClose = () => {
    setIsOpen(false);
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    if (onClose) onClose();
    setTimeout(() => {
      resetForm();
    }, 300);
  };

  const resetForm = () => {
    setFormData({ 
      make: '', model: '', year: new Date().getFullYear(), mileage: '', price: '', 
      engine: '660cc', shaken: '', transmission: 'AT', customDownPayment: '', customMonths: '',
      commissionRate: '0', status: 'available', weight: ''
    });
    setImages([]);
    setImageFiles([]);
    setBulkLinks('');
    setShowForm(false);
    setLocalEditingCar(null);
  };

  const setAsCover = (index: number) => {
    const newImages = [...images];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    setImages(newImages);

    const newFiles = [...imageFiles];
    const [selectedFile] = newFiles.splice(index, 1);
    newFiles.unshift(selectedFile);
    setImageFiles(newFiles);
  };

  const processBulkLinks = () => {
    if (!bulkLinks.trim()) return;
    
    if (bulkLinks.includes('/drive/folders/') && !bulkLinks.includes('file/d/')) {
      alert("⚠️ Has pegado un enlace de CARPETA. \n\nPara que funcione: Entra a la carpeta en Drive, selecciona todas las fotos, haz clic derecho -> Compartir -> Copiar enlaces, y pega ESO aquí.");
      return;
    }

    const driveIdRegex = /(?:file\/d\/|id=)([a-zA-Z0-9_-]{25,})[/?]?/g;
    let match;
    const foundIds: string[] = [];

    while ((match = driveIdRegex.exec(bulkLinks)) !== null) {
      if (match[1]) {
        foundIds.push(`https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`);
      }
    }

    if (foundIds.length > 0) {
      const uniqueNewLinks = foundIds.filter(link => !images.includes(link));
      setImages(prev => [...prev, ...uniqueNewLinks]);
      setImageFiles(prev => [...prev, ...Array(uniqueNewLinks.length).fill(null)]);
      setBulkLinks('');
    } else {
      alert("No se detectaron IDs de fotos válidos.");
    }
  };

  const handleAutoFillWithAI = async () => {
    const firstFile = imageFiles.find(f => f !== null);
    const firstExistingImage = images.find(img => img && !img.startsWith('file-placeholder'));
    
    if (!firstFile && !firstExistingImage) {
      alert("Sube al menos una imagen o usa un vehículo con imagen existente para usar la IA.");
      return;
    }

    try {
      setIsGenerating(true);
      setUploadProgressText('Procesando imagen con IA...');
      
      const compressImage = (src: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_DIMENSION = 800;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > MAX_DIMENSION) {
                height = Math.round((height * MAX_DIMENSION) / width);
                width = MAX_DIMENSION;
              }
            } else {
              if (height > MAX_DIMENSION) {
                width = Math.round((width * MAX_DIMENSION) / height);
                height = MAX_DIMENSION;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/webp', 0.5);
              resolve(dataUrl.split(',')[1]);
            } else {
              reject(new Error("No 2d context"));
            }
          };
          img.onerror = (e) => reject(e);
          img.src = src;
        });
      };

      let compressedBase64 = '';

      if (firstFile) {
        const objectUrl = URL.createObjectURL(firstFile);
        compressedBase64 = await compressImage(objectUrl);
        URL.revokeObjectURL(objectUrl);
      } else if (firstExistingImage) {
        compressedBase64 = await compressImage(firstExistingImage);
      }

      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: compressedBase64,
          mimeType: 'image/webp'
        })
      });
      
      if (!res.ok) throw new Error('Error al generar con IA');
      
      let dataStr = await res.text();
      let data;
      try {
        if (dataStr.startsWith('```json')) {
          dataStr = dataStr.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (dataStr.startsWith('```')) {
          dataStr = dataStr.replace(/^```\n/, '').replace(/\n```$/, '');
        }
        data = JSON.parse(dataStr);
      } catch (err) {
        console.error("Failed to parse JSON", dataStr);
        throw new Error("Invalid JSON from AI");
      }
      
      setFormData(prev => ({
        ...prev,
        make: data.categoria || prev.make,
        model: `${data.titulo || ''} ${data.descripcion_corta || ''}`.trim() || prev.model,
        engine: data.marca || prev.engine,
        mileage: data.modelo || prev.mileage,
        year: parseInt(data.año) || prev.year,
        price: data.precio_estimado_usd || prev.price,
        status: data.estado || prev.status,
        weight: data.peso_estimado_kg || prev.weight
      }));
      
    } catch (e) {
      console.error(e);
      alert("Hubo un error con la IA o la compresión de la imagen.");
    } finally {
      setIsGenerating(false);
      setUploadProgressText('');
    }
  };

  const compressAndUploadImage = async (file: File, index: number, total: number): Promise<string> => {
    try {
      setUploadProgressText(`Comprimiendo y subiendo foto ${index} de ${total}...`);
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (b) => {
              URL.revokeObjectURL(img.src);
              if (b) resolve(b);
              else reject(new Error('Error al crear blob'));
            },
            'image/webp',
            0.8
          );
        };
        img.onerror = () => {
          URL.revokeObjectURL(img.src);
          reject(new Error('Failed to load image for compression'));
        };
        
        img.src = URL.createObjectURL(file);
      });

      const fileName = `inventory/${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error en compressAndUploadImage:", error);
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      
      // Guardar los archivos reales para subirlos luego
      setImageFiles(prev => [...prev, ...files]);

      const previewUrls = files.map(file => `file-placeholder-${Date.now()}-${Math.random()}`);
      setImages(prev => [...prev, ...previewUrls]);
    }
  };

  const translateText = async (text: string, targetLang: string) => {
    if (!text) return text;
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang })
      });
      const data = await res.json();
      return data.translatedText || text;
    } catch (err) {
      console.error("Translate error:", err);
      return text;
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return alert("Carga al menos una foto");
    if (!formData.make || !formData.model || !formData.year || !formData.price) {
      return alert("Por favor completa los campos requeridos (Marca, Modelo, Año, Precio)");
    }

    setLoading(true);

    try {
      setUploadError('');
      if (!firebaseConfig || !firebaseConfig.apiKey) {
        throw new Error("La configuración de Firebase está vacía o inválida (falta apiKey).");
      }

      const [makePt, makeEn, modelPt, modelEn, enginePt, engineEn] = await Promise.all([
        translateText(formData.make, 'pt'),
        translateText(formData.make, 'en'),
        translateText(formData.model, 'pt'),
        translateText(formData.model, 'en'),
        translateText(formData.engine, 'pt'),
        translateText(formData.engine, 'en')
      ]);

      const baseCarData = {
        make: formData.make,
        makePt,
        makeEn,
        model: formData.model,
        modelPt,
        modelEn,
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        price: Number(formData.price),
        transmission: formData.transmission,
        engine: formData.engine,
        enginePt,
        engineEn,
        shaken: formData.shaken,
        commissionRate: formData.commissionRate ? Number(formData.commissionRate) / 100 : 0,
        status: formData.status,
        weight: formData.weight
      };

      const customDownPayment = formData.customDownPayment ? Number(formData.customDownPayment) : null;
      const customMonths = formData.customMonths ? Number(formData.customMonths) : null;

      const carDataToSave: any = { ...baseCarData };
      if (customDownPayment !== null) carDataToSave.customDownPayment = customDownPayment;
      if (customMonths !== null) carDataToSave.customMonths = customMonths;

      const finalImageUrls: string[] = [];
      const filesToProcess = imageFiles.filter(f => f !== null).length;
      let processedFiles = 0;

      for (let i = 0; i < images.length; i++) {
        const file = imageFiles[i];
        if (file) {
          processedFiles++;
          const uploadedUrl = await compressAndUploadImage(file, processedFiles, filesToProcess);
          if (uploadedUrl && uploadedUrl.startsWith('http')) {
            finalImageUrls.push(uploadedUrl);
          }
        } else {
          const imgUrl = images[i];
          // REGLA ESTRICTA: Bloqueo absoluto de Base64 o placeholders locales
          if (imgUrl && !imgUrl.startsWith('data:image') && !imgUrl.startsWith('file-placeholder')) {
            finalImageUrls.push(imgUrl);
          }
        }
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      setUploadProgressText('');

      if (finalImageUrls.length === 0) {
        throw new Error("No se pudo obtener ninguna URL de imagen pública. Las imágenes en Base64 o locales no están permitidas.");
      }

      if (localEditingCar) {
        // Lógica para editar
        const carData = {
          ...localEditingCar,
          ...carDataToSave,
          image: finalImageUrls[0],
          gallery: finalImageUrls
        };
        await setDoc(doc(db, 'inventory', localEditingCar.id), carData, { merge: true });
        onEditCar(carData as Car);
      } else {
        const carData = { ...carDataToSave };

        const payload = {
          ...carData,
          image: finalImageUrls[0],
          gallery: finalImageUrls,
          createdAt: new Date()
        };

        // Usa addDoc directamente para sortear el Storage y sus reglas/CORS
        await addDoc(collection(db, 'inventory'), payload);
        
        onAddCar({} as Car); // Firebase snapshot actualizará la UI, enviamos dummy
      }
      resetForm();
    } catch (error: any) {
      console.error("Error al guardar:", error);
      setUploadError(error?.message || 'Error desconocido al subir las imágenes o guardar');
      setUploadProgressText('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col h-[100dvh] w-full text-slate-900 animate-in fade-in duration-300 overflow-hidden">
          {!user ? (
            <div className="flex-1 flex items-center justify-center bg-slate-50 p-4">
              <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase mb-2">LM Kaitori Admin</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Iniciar Sesión</p>
                
                {loginError && <p className="text-red-500 text-sm font-bold mb-4">{loginError}</p>}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-bold" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Contraseña</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-bold" required />
                  </div>
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-widest py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Entrar
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest underline">Cerrar</button>
                </div>
              </form>
            </div>
          ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col gap-6 bg-slate-50 shrink-0">
              <div className="max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">
                      LM KAITORI ADMIN
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-none">
                         Panel de Administración
                      </p>
                      <button 
                        onClick={() => {
                          if (confirm("¿Reiniciar sistema? Perderás tus autos personalizados y solicitudes.")) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}
                        className="text-[8px] bg-slate-200 hover:bg-red-600 hover:text-white px-2 py-0.5 rounded font-black uppercase tracking-tighter transition"
                      >
                        Reset Logic
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <button onClick={handleLogout} className="text-slate-500 hover:text-slate-800 text-[10px] font-bold uppercase tracking-widest underline">
                      Cerrar Sesión
                    </button>
                    <button onClick={handleClose} aria-label="Close admin panel" className="bg-red-600 text-white p-2.5 rounded-full shadow-lg hover:bg-slate-900 transition-all transform hover:scale-110">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>

              <div className="flex gap-2 p-1 bg-slate-200 rounded-2xl w-fit mt-6">
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Inventario
                </button>
                <button 
                  onClick={() => setActiveTab('applications')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'applications' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Solicitudes
                  {applications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] flex items-center justify-center rounded-full animate-pulse">
                      {applications.length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('operations')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'operations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Operaciones
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Configuración
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide w-full">
            <div className="max-w-7xl mx-auto w-full pb-20">
              {activeTab === 'inventory' && (
                showForm ? (
                <form onSubmit={handleUpload} className="p-8 space-y-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-slate-900 uppercase italic-slant">{localEditingCar ? 'Editar Vehículo' : 'Añadir Vehículo'}</h3>
                    <button type="button" onClick={() => resetForm()} className="text-[10px] uppercase font-black tracking-widest text-slate-400 hover:text-slate-600">Volver a la lista</button>
                  </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition group">
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Añadir Locales</span>
                </label>

                <div className="bg-blue-50/50 border-2 border-blue-100 p-6 rounded-[2rem] flex flex-col gap-3">
                  <textarea 
                    value={bulkLinks}
                    onChange={e => setBulkLinks(e.target.value)}
                    className="w-full bg-white border border-blue-100 p-3 rounded-xl outline-none text-[10px] font-mono h-16 placeholder:text-blue-200 resize-none text-slate-900"
                    placeholder="Pega links de Drive aquí..."
                  />
                  <button type="button" onClick={processBulkLinks} className="w-full bg-blue-600 text-white py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition">
                    Extraer de Drive
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gestión de Galería ({images.filter(img => !img.startsWith('file-placeholder')).length})</h3>
                   {images.filter(img => !img.startsWith('file-placeholder')).length > 1 && <p className="text-[9px] text-slate-400 font-bold italic">Selecciona la ⭐ para elegir portada</p>}
                </div>

                {images.filter(img => !img.startsWith('file-placeholder')).length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((img, i) => {
                      if (img.startsWith('file-placeholder')) return null;
                      return (
                        <div key={i} className={`aspect-square rounded-[1.5rem] overflow-hidden relative group transition-all duration-300 ${i === 0 ? 'ring-4 ring-yellow-400 ring-offset-2' : 'border border-slate-200 opacity-80 hover:opacity-100'}`}>
                          <img 
                            src={getOptimizedImageUrl(img, 400)} 
                            className="w-full h-full object-cover" 
                            alt={`Gallery ${i}`}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/ef4444/ffffff?text=Link+Inv%C3%A1lido'; }}
                          />
                          
                          {i === 0 && (
                            <div className="absolute top-2 left-2 bg-yellow-400 text-slate-900 text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg z-10 flex items-center gap-1 uppercase tracking-tighter">
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                              Portada
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {i !== 0 && (
                              <button 
                                type="button" 
                                onClick={() => setAsCover(i)}
                                className="bg-yellow-400 text-slate-900 p-2 rounded-xl shadow-xl hover:scale-110 transition"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                              </button>
                            )}
                            <button 
                              type="button" 
                              onClick={() => {
                                setImages(images.filter((_, idx) => idx !== i));
                                setImageFiles(imageFiles.filter((_, idx) => idx !== i));
                              }} 
                              className="bg-white/20 hover:bg-red-600 text-white p-2 rounded-xl backdrop-blur-md shadow-xl hover:scale-110 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {(imageFiles.filter(f => f !== null).length > 0 || images.filter(img => img && !img.startsWith('file-placeholder')).length > 0) && (
                  <div className="mt-4 p-4 bg-slate-100 rounded-lg text-slate-700 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        {imageFiles.filter(f => f !== null).length > 0 ? (
                          <>
                            <p className="font-bold mb-2">{imageFiles.filter(f => f !== null).length} archivos seleccionados y listos para procesar:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {imageFiles.map((file, index) => {
                                 if (!file) return null;
                                 return <li key={index}>{file.name}</li>;
                              })}
                            </ul>
                          </>
                        ) : (
                          <p className="font-bold mb-2">Imagen existente lista para procesar con IA.</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoFillWithAI}
                        disabled={isGenerating}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        {isGenerating ? 'Procesando...' : 'Autocompletar datos con IA'}
                      </button>
                    </div>
                    {imageFiles.filter(f => f !== null).length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                           const newDocs = images.filter(d => !d.startsWith('file-placeholder'));
                           const newFiles = imageFiles.filter(f => f === null);
                           setImages(newDocs);
                           setImageFiles(newFiles);
                        }}
                        className="mt-4 text-xs text-red-600 hover:text-red-800 font-bold underline"
                      >
                        Limpiar selección
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Categoría</label>
                    <select required value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} className="w-full bg-slate-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-600/20 font-bold text-slate-900">
                      <option value="">Seleccione Categoría</option>
                      <option value="Maquinarias">Maquinarias</option>
                      <option value="Vehículos Usados">Vehículos Usados</option>
                      <option value="Desguaces">Desguaces</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Título / Descripción</label>
                    <input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-slate-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-600/20 font-bold text-slate-900" placeholder="Ej: Frente Completo Suzuki Spacia" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Año / Cód.</label>
                    <input type="number" required value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} className="w-full bg-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Precio (USD)</label>
                    <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-100 p-4 rounded-2xl outline-none font-bold text-red-600" placeholder="15000" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Modelo / Peso (KG)</label>
                    <input type="text" required value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} className="w-full bg-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-900" placeholder="Ej: Prius / 320" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Marca / Motor</label>
                    <input required value={formData.engine} onChange={e => setFormData({...formData, engine: e.target.value})} className="w-full bg-slate-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-600/20 font-bold text-slate-900" placeholder="Ej: Toyota / 1.8L Hybrid" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Ubicación</label>
                    <input required value={formData.shaken} onChange={e => setFormData({...formData, shaken: e.target.value})} className="w-full bg-slate-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-600/20 font-bold text-slate-900" placeholder="Ej: Patio Nagoya, Chiba" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Estado</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full bg-slate-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-600/20 font-bold text-slate-900">
                      <option value="available">Disponible</option>
                      <option value="reserved">Reservado</option>
                      <option value="sold">Vendido</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Peso (kg)</label>
                    <input value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} type="number" className="w-full bg-slate-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-600/20 font-bold text-slate-900" placeholder="Ej: 1500" />
                  </div>
                </div>
              </div>

              {uploadError && (
                <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold mt-4 break-words">
                  🚨 Error: {uploadError}
                </div>
              )}
              {uploadProgressText && (
                <div className="text-center py-2 text-red-600 font-bold text-sm animate-pulse uppercase tracking-widest">
                  {uploadProgressText}
                </div>
              )}
              <button 
                type="submit" 
                disabled={loading || images.length === 0}
                className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-red-600 transition-all text-lg disabled:opacity-50 disabled:hover:bg-slate-900 uppercase tracking-tighter"
              >
                {loading ? 'Procesando...' : localEditingCar ? 'Guardar Cambios' : 'Publicar Nueva Unidad'}
              </button>
            </form>
            ) : (
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-slate-900 uppercase italic-slant">Catálogo ({cars.length})</h3>
                  <button onClick={() => setShowForm(true)} className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition shadow-lg">Añadir Nuevo</button>
                </div>
                <div className="space-y-4">
                  {cars.map(car => (
                    <div key={car.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-4 items-center group">
                      <img src={car.image} alt={car.model} className="w-20 h-20 object-cover rounded-xl" />
                      <div className="flex-1">
                        <p className="font-black text-slate-900 uppercase text-xs">{car.make}</p>
                        <p className="text-slate-600 text-[10px] font-bold uppercase">{car.model}</p>
                        <p className="text-red-600 font-bold text-[10px] mt-1">${car.price}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setLocalEditingCar(car)} className="bg-slate-200 text-slate-900 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => onDeleteCar(car.id)} className="bg-slate-200 text-slate-900 p-2 rounded-lg hover:bg-red-600 hover:text-white transition">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {cars.length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No hay vehículos en el inventario</p>
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {activeTab === 'applications' && (
              <div className="p-8 space-y-6">
              {applications.length === 0 ? (
                <div className="py-20 text-center">
                   <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No hay solicitudes pendientes</p>
                </div>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 space-y-6 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] bg-red-600 text-white font-black px-3 py-1 rounded-full uppercase italic-slant tracking-widest">Nueva</span>
                          <span className="text-[10px] text-slate-400 font-bold mono-font uppercase">{new Date(app.timestamp).toLocaleString()}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic-slant uppercase">{app.fullName}</h3>
                      </div>
                      <button 
                        onClick={() => onDeleteApplication(app.id)}
                        className="text-slate-300 hover:text-red-600 transition-colors p-2"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <div className="flex items-center gap-4 text-slate-600">
                            <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                              <CarIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Unidad de Interés</p>
                              <p className="font-bold text-slate-900 italic-slant uppercase">{app.carName}</p>
                            </div>
                         </div>

                         <div className="flex items-center gap-4 text-slate-600">
                            <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center shrink-0 text-red-600">
                              <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pago Mensual Simulado</p>
                              <p className="font-black text-slate-900 mono-font text-lg">${app.monthlyPayment.toLocaleString()}</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                              <span className="text-xs font-bold text-slate-900 mono-font">{app.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-900 truncate max-w-[120px]">{app.email}</span>
                            </div>
                         </div>

                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">{app.employer}</span>
                         </div>

                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-tight">{app.address}</span>
                         </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="p-8 space-y-8">
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="text-2xl font-black text-slate-900 uppercase italic-slant tracking-tighter">Imágenes del Carrusel de Operaciones</h3>
                <p className="text-slate-500 text-sm mb-6">Sube las fotos de tus operaciones para que aparezcan en el carrusel de inicio.</p>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleOpFileChange} 
                      className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-[#e10600] file:text-white hover:file:bg-red-700 cursor-pointer border border-gray-600 rounded-lg p-4 bg-[#0b0b0b]" 
                    />
                  </div>

                  {localOpsDocs.filter(d => !d.url.startsWith('file-placeholder')).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                      {localOpsDocs.map((docItem, index) => {
                        if (docItem.url.startsWith('file-placeholder')) return null;
                        return (
                          <div key={index} className="relative aspect-video rounded-lg overflow-hidden group border-2 border-slate-200 bg-slate-100">
                            <img src={docItem.url} alt={`Operation ${index}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const docId = localOpsDocs[index]?.id;
                                  if (docId) setOpsToDelete(prev => [...prev, docId]);
                                  setLocalOpsDocs(localOpsDocs.filter((_, i) => i !== index));
                                  setOpImageFiles(opImageFiles.filter((_, i) => i !== index));
                                }}
                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {opImageFiles.filter(f => f !== null).length > 0 && (
                    <div className="mt-4 p-4 bg-slate-100 rounded-lg text-slate-700 text-sm">
                      <p className="font-bold mb-2">{opImageFiles.filter(f => f !== null).length} archivos seleccionados y listos para procesar:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {opImageFiles.map((file, index) => {
                           if (!file) return null;
                           return <li key={index}>{file.name}</li>;
                        })}
                      </ul>
                      <button
                        type="button"
                        onClick={() => {
                           // Remove all local pending files
                           const newDocs = localOpsDocs.filter(d => !d.url.startsWith('file-placeholder'));
                           const newFiles = opImageFiles.filter(f => f === null);
                           setLocalOpsDocs(newDocs);
                           setOpImageFiles(newFiles);
                        }}
                        className="mt-4 text-xs text-red-600 hover:text-red-800 font-bold underline"
                      >
                        Limpiar selección
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-4 pt-6 mt-8 border-t border-slate-200">
                  {uploadError && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold mt-4 break-words w-full text-left">
                      🚨 Error: {uploadError}
                    </div>
                  )}
                  {uploadProgressText && (
                    <div className="text-center py-2 text-red-600 font-bold text-sm animate-pulse uppercase tracking-widest w-full">
                      {uploadProgressText}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={saveOperationsImages}
                    disabled={loading}
                    className="bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-600/20"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    )}
                    Guardar Imágenes
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="p-8 space-y-8">
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="text-2xl font-black text-slate-900 uppercase italic-slant tracking-tighter">Configuración General</h3>
                <p className="text-slate-500 text-sm mb-6">Ajustes globales de la página pública.</p>

                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <h4 className="font-bold text-slate-800">Mapa de Exportación (Logistics)</h4>
                  <p className="text-xs text-slate-500">Sube una imagen para reemplazar el mapa de fondo en la sección de Export Logistics. Si no hay imagen, se mostrará el mapa SVG por defecto.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 mt-4">
                    <div className="flex-1">
                      <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-red-400 transition-colors bg-white relative">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setMapImageFile(e.target.files[0]);
                              setMapImagePreview(URL.createObjectURL(e.target.files[0]));
                            }
                          }}
                        />
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          <span className="text-sm font-bold text-slate-600">Click o arrastra para subir mapa</span>
                          <span className="text-xs text-slate-400">PNG, JPG o WEBP</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[150px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative">
                      {(mapImagePreview || mapImage) ? (
                        <>
                          <img src={mapImagePreview || mapImage!} alt="Map Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={async () => {
                              if (mapImagePreview) {
                                setMapImagePreview(null);
                                setMapImageFile(null);
                              } else if (mapImage) {
                                if (window.confirm("¿Seguro que deseas eliminar el mapa actual?")) {
                                  try {
                                    setLoading(true);
                                    await deleteDoc(doc(db, 'settings', 'exportMap'));
                                    alert("Mapa eliminado.");
                                  } catch (error) {
                                    console.error("Error al eliminar mapa", error);
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }
                            }}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 text-sm font-medium">Sin imagen</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 pt-6 mt-8 border-t border-slate-200">
                    {uploadError && (
                      <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold w-full text-left">
                        🚨 Error: {uploadError}
                      </div>
                    )}
                    {uploadProgressText && (
                      <div className="text-center py-2 text-red-600 font-bold text-sm animate-pulse uppercase tracking-widest w-full">
                        {uploadProgressText}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={saveMapImage}
                      disabled={loading || !mapImageFile}
                      className="bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-600/20"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      )}
                      Guardar Mapa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )}
</div>
)}
</>
  );
};

export default AdminInventory;
