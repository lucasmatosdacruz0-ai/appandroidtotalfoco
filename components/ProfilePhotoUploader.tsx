import React, { useRef } from 'react';
import { CameraIcon } from './icons.tsx';
import { resizeAndCompressImage } from '../imageUtils.ts';

interface ProfilePhotoUploaderProps {
    isEditing: boolean;
    currentAvatar: string;
    onPhotoSelected: (base64: string) => void;
}

const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({ isEditing, currentAvatar, onPhotoSelected }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
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
        <div className="relative shrink-0">
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
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full transition-all duration-300 ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                disabled={!isEditing}
                title={isEditing ? 'Trocar foto de perfil' : 'Foto de perfil'}
            >
                {isBase64 ? (
                    <img src={currentAvatar} alt="Avatar do usuário" className="w-full h-full object-cover rounded-full" />
                ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-5xl">{currentAvatar}</span>
                    </div>
                )}

                {isEditing && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <CameraIcon className="w-8 h-8 text-white" />
                    </div>
                )}
            </button>
        </div>
    );
};

export default ProfilePhotoUploader;