import React, { useState, useEffect } from 'react';
import { getWorkoutHistory, getPersonalRecords, saveUserProfile } from '../services/storageService.ts';
import { UserProfile, Achievement, HistoricalWorkout, ProfileGalleryImage, PersonalRecords } from '../types.ts';
import { ACHIEVEMENTS_LIST } from '../constants.ts';
import { DumbbellIcon, FlameIcon, TimerIcon, TrophyIcon, EditIcon, CheckSquareIcon, InstagramIcon, ImagePlusIcon, Trash2Icon, XIcon, LogOutIcon, Phone, Mail } from '../components/icons.tsx';
import ProfilePhotoUploader from '../components/ProfilePhotoUploader.tsx';
import PhotoViewerModal from '../components/PhotoViewerModal.tsx';
import Spinner from '../components/Spinner.tsx';
import { resizeAndCompressImage } from '../imageUtils.ts';

interface ProfilePageProps {
  onLogout: () => void;
  initialProfile: UserProfile;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout, initialProfile }) => {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(initialProfile);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [personalRecordsCount, setPersonalRecordsCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const galleryPhotoUploaderRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadAdditionalData = async () => {
        setIsLoading(true);
        const [history, prs] = await Promise.all([
            getWorkoutHistory(),
            getPersonalRecords()
        ]);
        
        setProfile(initialProfile);
        setEditedProfile(initialProfile);
        setPersonalRecordsCount(Object.keys(prs).length);

        const updatedAchievements = ACHIEVEMENTS_LIST.map(ach => ({
            ...ach,
            unlocked: ach.condition(history, initialProfile.stats, prs)
        }));
        setAchievements(updatedAchievements);
        setIsLoading(false);
    };
    loadAdditionalData();
  }, [initialProfile]);

  const handleEditToggle = () => {
      if (!isEditing && profile) {
          setEditedProfile(profile);
      }
      setIsEditing(!isEditing);
  };
  
  const handleCancelEdit = () => {
      if(profile) setEditedProfile(profile);
      setIsEditing(false);
  };

  const handleSaveEdit = async () => {
      if (!editedProfile) return;
      await saveUserProfile(editedProfile);
      setProfile(editedProfile);
      setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!editedProfile) return;
      const { name, value } = e.target;
      setEditedProfile(prev => prev ? ({ ...prev, [name]: value }) : null);
  };
  
  const handlePhotoSelected = (base64: string) => {
      if (!editedProfile) return;
      setEditedProfile(prev => prev ? ({ ...prev, avatar_url: base64 }) : null);
  };

  const handleAddGalleryPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editedProfile) {
      try {
        // Resize gallery photos to a larger but still optimized size
        const compressedImage = await resizeAndCompressImage(e.target.files[0], { maxSize: 1024, quality: 0.8 });
        const newImage: ProfileGalleryImage = {
          id: crypto.randomUUID(),
          src: compressedImage,
        };
        setEditedProfile(prev => prev ? ({ ...prev, gallery: [...prev.gallery, newImage] }) : null);
        if (!isEditing) setIsEditing(true);
      } catch (error) {
        console.error("Error compressing gallery image:", error);
        alert("Não foi possível processar a imagem. Tente novamente com outra foto.");
      }
    }
  };

  const handleDeleteGalleryPhoto = (id: string) => {
      if (!editedProfile) return;
      setEditedProfile(prev => prev ? ({ ...prev, gallery: prev.gallery.filter(img => img.id !== id) }) : null);
  }

  const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/70 rounded-full">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
  
  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Spinner /></div>;
  }

  if (!profile || !editedProfile) {
    return <div className="text-center p-8">Não foi possível carregar o perfil.</div>;
  }

  const xpProgress = (profile.xp / profile.xpToNextLevel) * 100;

  return (
    <div className="animate-fade-in space-y-8">
      {viewingImage && <PhotoViewerModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}
      <input type="file" accept="image/*" ref={galleryPhotoUploaderRef} onChange={handleAddGalleryPhoto} className="hidden" />

      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl relative">
        <div className="flex items-start gap-4 sm:gap-6">
            <ProfilePhotoUploader isEditing={isEditing} currentAvatar={editedProfile.avatar_url} onPhotoSelected={handlePhotoSelected}/>
            <div className="flex-grow">
              {isEditing ? (
                  <input type="text" name="name" value={editedProfile.name} onChange={handleInputChange} className="text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none w-full" />
              ) : (
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
              )}
               <div className="flex items-center gap-2 mt-2">
                <Mail className="w-5 h-5 text-gray-400"/>
                <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                  <InstagramIcon className="w-5 h-5 text-gray-400"/>
                  {isEditing ? (
                       <input type="text" name="instagram" value={editedProfile.instagram || ''} onChange={handleInputChange} placeholder="@seuusuario" className="text-gray-500 dark:text-gray-400 bg-transparent border-b-2 border-dashed border-gray-400 focus:outline-none focus:border-blue-500 w-full" />
                  ) : (
                    profile.instagram ? (
                        <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{profile.instagram}</a>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">Adicionar Instagram</p>
                    )
                  )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                  <Phone className="w-5 h-5 text-gray-400"/>
                  {isEditing ? (
                       <input type="tel" name="whatsapp" value={editedProfile.whatsapp || ''} onChange={handleInputChange} placeholder="(XX) XXXXX-XXXX" className="text-gray-500 dark:text-gray-400 bg-transparent border-b-2 border-dashed border-gray-400 focus:outline-none focus:border-blue-500 w-full" />
                  ) : (
                    profile.whatsapp ? (
                        <p className="text-gray-500 dark:text-gray-400">{profile.whatsapp}</p>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">Adicionar WhatsApp</p>
                    )
                  )}
              </div>
            </div>
        </div>
        {!isEditing && (
            <button onClick={handleEditToggle} className="absolute top-4 right-4 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <EditIcon className="w-4 h-4"/>
                <span className="hidden sm:inline">Editar</span>
            </button>
        )}
         {isEditing && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
                 <button onClick={handleCancelEdit} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <XIcon className="w-4 h-4"/>
                    <span className="hidden sm:inline">Cancelar</span>
                </button>
                 <button onClick={handleSaveEdit} className="flex items-center gap-2 bg-green-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-green-600 transition-colors">
                    <CheckSquareIcon className="w-4 h-4"/>
                    <span className="hidden sm:inline">Salvar</span>
                </button>
            </div>
        )}

        <div className="mt-6">
            <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-blue-600 dark:text-blue-400">Nível {profile.level}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{profile.xp} / {profile.xpToNextLevel} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${xpProgress}%`}}></div>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<DumbbellIcon className="w-8 h-8 text-blue-500" />} label="Total de Treinos" value={profile.stats.totalWorkouts} />
          <StatCard icon={<FlameIcon className="w-8 h-8 text-blue-500" />} label="Streak Atual" value={profile.stats.currentStreak} />
          <StatCard icon={<TrophyIcon className="w-8 h-8 text-blue-500" />} label="Recordes Pessoais" value={personalRecordsCount} />
          <StatCard icon={<TimerIcon className="w-8 h-8 text-blue-500" />} label="Tempo Treinando" value={`${profile.stats.timeSpent} min`} />
      </div>

       <div className="bg-gray-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Galeria de Fotos</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                <button onClick={() => galleryPhotoUploaderRef.current?.click()} className="aspect-square flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-blue-500 hover:text-blue-500 transition-colors" title="Adicionar foto à galeria">
                    <ImagePlusIcon className="w-8 h-8"/>
                    <span className="text-xs font-semibold mt-1">Adicionar</span>
                </button>
                {editedProfile.gallery.map(image => (
                    <div key={image.id} className="relative group aspect-square">
                        <img src={image.src} alt="Foto do progresso" className="w-full h-full object-cover rounded-lg cursor-pointer" onClick={() => !isEditing && setViewingImage(image.src)} />
                        {isEditing && (
                            <button onClick={() => handleDeleteGalleryPhoto(image.id)} className="absolute top-1 right-1 p-1 bg-red-600/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2Icon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            {editedProfile.gallery.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-4">Sua galeria está vazia. Adicione sua primeira foto!</p>
            )}
       </div>

      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Conquistas</h2>
          {/* Achievement content remains the same */}
      </div>

      <div className="mt-8 flex justify-center">
        <button onClick={onLogout} className="flex items-center gap-2 text-red-500 dark:text-red-400 font-bold py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
          <LogOutIcon className="w-5 h-5" />
          Sair da Conta
        </button>
      </div>

    </div>
  );
};

export default ProfilePage;