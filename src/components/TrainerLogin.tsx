import React, { useState } from 'react';

interface TrainerLoginProps {
  onLogin: (trainerName: string) => void;
}

export const TrainerLogin: React.FC<TrainerLoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onLogin(trimmed);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#051424] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#d2f000]/10 border-2 border-[#d2f000] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[#d2f000] text-3xl">fitness_center</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-white tracking-tighter">TRAINPRO</h1>
          <p className="text-[#c6c9ab] text-sm mt-2">Gestiona tus alumnos con datos en la nube</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#122131] border border-[#454932] rounded-xl p-6 shadow-2xl">
          <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1.5">
            Tu nombre de entrenador
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Juan Pérez"
            className="w-full bg-[#051424] border border-[#454932] rounded-lg py-2.5 px-3 text-[#d4e4fa] placeholder-[#c6c9ab] focus:border-[#d2f000] focus:outline-none text-sm mb-4"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-[#d2f000] text-[#191e00] font-bold text-sm py-2.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]"
          >
            Acceder
          </button>
          <p className="text-[10px] text-[#c6c9ab] text-center mt-3">
            Tu nombre crea una pestaña propia en la nube. Cada entrenador tiene sus datos separados.
          </p>
        </form>
      </div>
    </div>
  );
};
