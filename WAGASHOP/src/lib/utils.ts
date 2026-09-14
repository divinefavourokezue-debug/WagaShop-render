import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import imageCompression from 'browser-image-compression';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function compressImage(file: File): Promise<File> {
  if (!file) return file;
  
  // If it's a video or non-image file, return as is
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Fast native canvas compression (instant, guaranteed ~60-120KB output)
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxDim = 600;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob], 
                file.name ? file.name.replace(/\.[^/.]+$/, "") + ".jpg" : "image.jpg", 
                { type: 'image/jpeg', lastModified: Date.now() }
              );
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.6
        );
      } else {
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

export async function safeFileToDataUrl(file: File): Promise<string> {
  // Always compress image first to prevent huge base64 strings crashing Firestore (>1MB limit)
  const safeFile = file.type.startsWith('image/') ? await compressImage(file) : file;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Truncate if somehow base64 string is absurdly large to prevent app blanking out
      if (result.length > 900000 && !file.type.startsWith('image/')) {
        console.warn("File too large for base64 fallback, returning preview placeholder");
      }
      resolve(result);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(safeFile);
  });
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF', // CFA Franc BCEAO
    maximumFractionDigits: 0,
  }).format(price).replace('XOF', 'FCFA');
}
