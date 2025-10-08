import React from 'react';
import { TrainingLocation } from '../types.ts';
import { BuildingIcon, HomeIcon } from './icons.tsx';

interface LocationSelectorProps {
  onSelect: (location: TrainingLocation) => void;
  currentLocation: TrainingLocation | null;
}

const locations = [
    { location: TrainingLocation.Gym, icon: <BuildingIcon className="w-12 h-12 mb-3" />, description: "Acesso a máquinas, pesos livres e equipamentos variados." },
    { location: TrainingLocation.Home, icon: <HomeIcon className="w-12 h-12 mb-3" />, description: "Treino com peso corporal ou com itens que você tem em casa." },
];

const LocationSelector: React.FC<LocationSelectorProps> = ({ onSelect, currentLocation }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Onde você vai treinar hoje?</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">Vamos adaptar os exercícios para o seu ambiente.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {locations.map(({ location, icon, description }) => {
          const isSelected = location === currentLocation;
          return (
            <button
              key={location}
              onClick={() => onSelect(location)}
              className={`group p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 border-2 transition-all duration-300 ease-in-out flex flex-col items-center text-center ${
                isSelected ? 'border-blue-500 scale-105' : 'border-transparent hover:border-blue-500 dark:hover:border-blue-500'
              }`}
            >
              <div className="text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{icon}</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-2">{location}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{description}</p>
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default LocationSelector;