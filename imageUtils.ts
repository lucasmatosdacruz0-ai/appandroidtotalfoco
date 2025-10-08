// imageUtils.ts

interface ResizeImageOptions {
  maxSize: number;
  quality: number;
}

const DEFAULT_OPTIONS: ResizeImageOptions = {
  maxSize: 512, // Max width/height of 512px
  quality: 0.8, // 80% JPEG quality
};

export const resizeAndCompressImage = (
  file: File,
  options: Partial<ResizeImageOptions> = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("Could not read file."));
      }

      const img = new Image();
      img.src = event.target.result as string;

      img.onload = () => {
        const { maxSize, quality } = { ...DEFAULT_OPTIONS, ...options };
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error("Could not get canvas context."));
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Get the data URL with compression
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = (error) => {
        reject(error);
      };
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};
