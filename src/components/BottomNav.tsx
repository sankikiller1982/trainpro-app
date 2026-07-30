import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'ejercicios', label: 'Ejercicios', icon: 'fitness_center' },
    { id: 'creador', label: 'Creador', icon: 'architecture' },
    { id: 'alumnos', label: 'Alumnos', icon: 'group' },
    { id: 'progreso', label: 'Progreso', icon: 'insights' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 bg-[#122131] border-t border-[#454932]/40 flex justify-around items-center h-20 px-4 pb-safe">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-105 ${
              isActive
                ? 'bg-[#d2f000] text-[#2c3400] rounded-xl px-4 py-1.5 shadow-lg shadow-[#d2f000]/10'
                : 'text-[#c6c9ab] hover:text-white px-2 py-1'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {tab.icon}
            </span>
            <span className="font-semibold text-[11px] mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
