import React from 'react';
import { XIcon } from './icons.tsx';

interface PhotoViewerModalProps {
  imageUrl: string;
  onClose: () => void;
}

const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-transparent rounded-2xl w-full max-w-4xl max-h-[90vh] relative animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/70 hover:text-white z-10 p-2">
          <XIcon className="w-8 h-8" />
        </button>

        <img 
            src={imageUrl} 
            alt="Visualização da foto da galeria" 
            className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default PhotoViewerModal;