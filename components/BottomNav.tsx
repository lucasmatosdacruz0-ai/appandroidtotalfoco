
import React from 'react';
import { AppView } from '../types.ts';
import { FlameIcon, HistoryIcon, UserIcon, ClipboardListIcon, LogoIcon, HomeIcon } from './icons.tsx';

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
      {/* Mobile: Fixed Bottom Navigation Bar with Center Button */}
      {/* Wrapper to contain both the nav bar and the elevated button */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-transparent sm:hidden z-40">
        
        {/* The actual nav bar with 4 items evenly spaced */}
        <nav className="absolute bottom-0 left-0 right-0 h-20 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex items-center justify-around px-2">
            {navItems.map(item => {
                const isActive = currentView === item.view;
                return (
                    <button
                      key={item.view}
                      onClick={() => setView(item.view)}
                      // Use w-1/4 to ensure they take up equal space
                      className={`flex flex-col items-center justify-center gap-1 transition-colors duration-200 w-1/4 h-full ${
                        isActive ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'
                      }`}
                    >
                      <item.icon className={`w-7 h-7`} />
                      <span className={`text-xs font-bold`}>
                        {item.label}
                      </span>
                    </button>
                )
            })}
        </nav>

        {/* Center "Home" Button, rendered on top of the nav bar */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
            <div className="p-1.5 bg-slate-900 rounded-full shadow-lg">
                <button
                    onClick={onLogoClick}
                    className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-full shadow-md shadow-teal-500/20 transition-all duration-200 active:scale-95 transform hover:-translate-y-1"
                    aria-label="Início"
                >
                    <HomeIcon className="w-6 h-6" />
                    <span>Início</span>
                </button>
            </div>
        </div>
      </div>

      {/* Desktop: Persistent Sidebar */}
      <nav className="hidden sm:flex sm:flex-col sm:w-64 bg-gray-800 border-r border-gray-700 shrink-0">
        <div className="flex items-center justify-center h-28 border-b border-gray-700">
          <button onClick={onLogoClick} className="flex items-center justify-center gap-3 w-full h-full p-6">
            <LogoIcon className="w-10 h-10 text-blue-500" />
            <h1 className="text-3xl font-extrabold text-white">Foco<span className="text-blue-500">Total</span></h1>
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
                    : 'text-gray-300 hover:bg-gray-700/60'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
        <div className="p-4 border-t border-gray-700">
           <p className="text-xs text-gray-500 text-center">© 2024 FocoTotal Fitness</p>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;