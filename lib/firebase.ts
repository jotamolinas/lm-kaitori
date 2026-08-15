import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { Car } from '../types';
import { getOptimizedImageUrl } from '../utils/imageOptimization';

export const firebaseConfig = {
  apiKey: "AIzaSyDsz8FWqTrAT9yVtogsVURSo7C92ea3pUo",
  authDomain: "gaijin-wheels.firebaseapp.com",
  projectId: "gaijin-wheels",
  storageBucket: "gaijin-wheels.firebasestorage.app",
  messagingSenderId: "277109812571",
  appId: "1:277109812571:web:82ab76ca33d8e7c8ca7e7e",
  measurementId: "G-CEHDSJ4PRS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export const uploadVehicle = async (vehicleData: Omit<Car, 'id'>, imageFile: File) => {
  try {
    let optimizedUrl = vehicleData.image || ''; // Default to provided image if any
    let galleryUrls = vehicleData.gallery || [optimizedUrl];

    // Solo subir si es un archivo real (tamaño > 0)
    if (imageFile && imageFile.size > 0) {
      // Resize and compress image on client side to avoid Firebase Storage CORS/Rules issues
      // and keep under Firestore 1MB document limit
      optimizedUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
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
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // compress to 70% quality JPEG
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = URL.createObjectURL(imageFile);
      });
      galleryUrls = [optimizedUrl];
    }

    // Save directly to Firestore using the base64 compressed string
    const docRef = await addDoc(collection(db, 'inventory'), {
      ...vehicleData,
      image: optimizedUrl, 
      gallery: galleryUrls,
      createdAt: serverTimestamp(),
      status: vehicleData.status || 'available'
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error uploading vehicle:", error);
    throw error;
  }
};
