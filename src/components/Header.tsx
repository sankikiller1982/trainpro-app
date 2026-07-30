import React from 'react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenShare }) => {
  return (
    <header className="bg-[#051424] w-full sticky top-0 z-50 border-b border-[#454932] flex justify-between items-center px-4 md:px-16 h-[64px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#d2f000] bg-[#273647] flex items-center justify-center shrink-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxJO8n-RmNZe8wgGvkSOYwoqsXTc9uubJxFoFhz64n032YS3bbfBK4hlajfhJziW1PFa0C-PZM-acyMP6WvTNLPPoBHwGO27tj3H1poaJ5Po8UQmtEGusRr5CT7EodrOjJo2Iewm6zTzzAK0Q-UCE1vqaPZHKjs-nCfq2craeIzdTwhm8V-hokbvaav7uRXi_s3LIQxUF47c3pwLW4gbVNGNJSMyagby1RyUaQCt597sINrC5jVWA"
            alt="Entrenador"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 
          onClick={() => setActiveTab('alumnos')}
          className="font-headline text-xl md:text-2xl font-extrabold text-white tracking-tighter cursor-pointer hover:text-[#d2f000] transition-colors"
        >
          TRAINPRO
        </h1>
      </div>

      {/* Web Navigation (Hidden on Mobile) */}
      <nav className="hidden md:flex items-center gap-6">
        <button
          onClick={() => setActiveTab('ejercicios')}
          className={`font-semibold text-sm transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
            activeTab === 'ejercicios'
              ? 'text-[#d2f000] bg-[#122131]'
              : 'text-[#c6c9ab] hover:text-white hover:bg-[#122131]/50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">fitness_center</span>
          Ejercicios
        </button>

        <button
          onClick={() => setActiveTab('creador')}
          className={`font-semibold text-sm transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
            activeTab === 'creador'
              ? 'text-[#d2f000] bg-[#122131]'
              : 'text-[#c6c9ab] hover:text-white hover:bg-[#122131]/50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">architecture</span>
          Creador
        </button>

        <button
          onClick={() => setActiveTab('alumnos')}
          className={`font-semibold text-sm transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
            activeTab === 'alumnos'
              ? 'text-[#d2f000] bg-[#122131]'
              : 'text-[#c6c9ab] hover:text-white hover:bg-[#122131]/50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">group</span>
          Alumnos
        </button>

        <button
          onClick={() => setActiveTab('progreso')}
          className={`font-semibold text-sm transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
            activeTab === 'progreso'
              ? 'text-[#d2f000] bg-[#122131]'
              : 'text-[#c6c9ab] hover:text-white hover:bg-[#122131]/50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">insights</span>
          Progreso
        </button>
      </nav>

      <button
        onClick={onOpenShare}
        className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:text-[#d2f000] hover:bg-[#122131] transition-all active:scale-95"
        title="Compartir"
      >
        <span className="material-symbols-outlined">share</span>
      </button>
    </header>
  );
};
