import React, { useState, useEffect } from 'react';
import { TrainingLocation } from '../types.ts';
import { GYM_EQUIPMENT, HOME_EQUIPMENT } from '../constants.ts';
import { ArrowRightIcon } from './icons.tsx';

interface EquipmentSelectorProps {
  location: TrainingLocation;
  onSelect: (equipment: string[]) => void;
  currentEquipment: string[];
}

const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({ location, onSelect, currentEquipment }) => {
  const [selected, setSelected] = useState<string[]>(currentEquipment);
  const equipmentList = location === TrainingLocation.Gym ? GYM_EQUIPMENT : HOME_EQUIPMENT;

  useEffect(() => {
    // Reset selected state if location changes to ensure equipment from different locations are not mixed.
    setSelected([]);
  }, [location]);

  const handleToggle = (item: string) => {
    setSelected(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === equipmentList.length) {
      setSelected([]);
    } else {
      setSelected(equipmentList);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Quais equipamentos você tem?</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">Selecione os itens disponíveis para personalizar seu treino.</p>
      
      <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex justify-end mb-4">
            <button
                onClick={handleSelectAll}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
                {selected.length === equipmentList.length ? 'Limpar Seleção' : 'Selecionar Tudo'}
            </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {equipmentList.map(item => (
            <label
              key={item}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 border-2
                ${selected.includes(item)
                  ? 'bg-blue-900/50 border-blue-500'
                  : 'bg-gray-700 border-transparent hover:border-gray-500'
                }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(item)}
                onChange={() => handleToggle(item)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{item}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        <button
          onClick={() => onSelect(selected)}
          className="bg-blue-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center mx-auto shadow-lg hover:shadow-xl"
        >
          Próximo
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default EquipmentSelector;