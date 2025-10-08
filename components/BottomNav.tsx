

import React from 'react';
import { AppView } from '../types.ts';
import { FlameIcon, HistoryIcon, UserIcon, ClipboardListIcon, LogoIcon } from './icons.tsx';

interface BottomNavProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogoClick: () => void;
}

const navItems = [
  { view: AppView.Workout, label: 'Treinar', icon: FlameIcon },
  { view: AppView.Planner, label: 'Planejador', icon: ClipboardListIcon },
  { view: AppView.History, label: 'Progresso', icon: HistoryIcon },
  { view: AppView.Profile, label: 'Perfil', icon: UserIcon },
];

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView, onLogoClick }) => {
  return (
    <>
      {/* Mobile: Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 flex justify-around items-center sm:hidden z-40">
        {navItems.map(item => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors duration-200 w-full h-full ${
                isActive ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'
              }`}
            >
              <item.icon className={`w-7 h-7`} />
              <span className={`text-xs font-bold`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Desktop: Persistent Sidebar */}
      <nav className="hidden sm:flex sm:flex-col sm:w-64 bg-gray-800 border-r border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex items-center justify-center h-28 border-b border-gray-200 dark:border-gray-700">
          <button onClick={onLogoClick} className="flex items-center justify-center gap-3 w-full h-full p-6">
            <LogoIcon className="w-10 h-10 text-blue-500" />
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">Foco<span className="text-blue-500">Total</span></h1>
          </button>
        </div>
        <div className="flex-grow p-4 space-y-2">
          {navItems.map(item => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg text-base font-bold transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
           <p className="text-xs text-gray-400 dark:text-gray-500 text-center">© 2024 FocoTotal Fitness</p>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;