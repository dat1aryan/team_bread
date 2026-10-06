// Uses Tesseract.js client OCR with Canvas image enhancement

export interface OcrProgress {
  status: string;
  progress: number;
}

/**
 * Extracts raw text from an image file or base64 using Tesseract.js
 */
export async function extractTextWithTesseract(
  imageSource: File | string,
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  try {
    // Dynamic import to prevent SSR bundling issues
    const Tesseract = await import('tesseract.js');

    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m: any) => {
        if (onProgress && m.status) {
          onProgress({
            status: m.status,
            progress: Math.round((m.progress || 0) * 100)
          });
        }
      }
    });

    const ret = await worker.recognize(imageSource);
    await worker.terminate();

    return ret.data.text || '';
  } catch (err) {
    console.warn('Client Tesseract OCR unavailable or aborted, falling back:', err);
    return '';
  }
}

/**
 * Preprocesses an image via HTML5 Canvas (grayscale & contrast stretch)
 */
export async function enhanceImageForOcr(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          // Simple grayscale + contrast enhancement
          for (let i = 0; i < data.length; i += 4) {
            const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            // High contrast curve
            const enhanced = avg < 128 ? avg * 0.8 : Math.min(255, avg * 1.2);
            data[i] = enhanced;
            data[i + 1] = enhanced;
            data[i + 2] = enhanced;
          }

          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        } catch {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
