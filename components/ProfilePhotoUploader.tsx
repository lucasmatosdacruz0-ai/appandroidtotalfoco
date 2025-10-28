import React, { useRef } from 'react';
import { CameraIcon } from './icons.tsx';
import { resizeAndCompressImage } from '../imageUtils.ts';

interface ProfilePhotoUploaderProps {
    currentAvatar: string;
    onPhotoSelected: (base64: string) => void;
}

const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({ currentAvatar, onPhotoSelected }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                // Resize avatars to a smaller size for performance
                const compressedImage = await resizeAndCompressImage(e.target.files[0], { maxSize: 256 });
                onPhotoSelected(compressedImage);
            } catch (error) {
                console.error("Error compressing avatar image:", error);
                alert("Não foi possível processar a imagem. Tente novamente com outra foto.");
            }
        }
    };
    
    // Check if avatar is a Base64 string or an emoji
    const isBase64 = currentAvatar.startsWith('data:image');

    return (
        <div className="relative shrink-0 group">
            <input
                type="file"
                accept="image/*"
                capture="user"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                onClick={handleAvatarClick}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full transition-all duration-300 cursor-pointer"
                title="Trocar foto de perfil"
            >
                {isBase64 ? (
                    <img src={currentAvatar} alt="Avatar do usuário" className="w-full h-full object-cover rounded-full" />
                ) : (
                    <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-5xl">{currentAvatar}</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <CameraIcon className="w-8 h-8 text-white" />
                </div>
            </button>
        </div>
    );
};

export default ProfilePhotoUploader;