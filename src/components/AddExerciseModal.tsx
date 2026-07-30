import React, { useState } from 'react';
import { Exercise, MuscleCategory } from '../types';

interface AddExerciseModalProps {
  exercises: Exercise[];
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  exercises,
  onClose,
  onSelectExercise,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MuscleCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: MuscleCategory[] = [
    'Todos',
    'Pecho',
    'Espalda',
    'Piernas',
    'Hombros',
    'Brazos',
    'Core',
  ];

  const filteredExercises = exercises.filter((ex) => {
    const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.secondaryMuscles.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#122131] border border-[#454932] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-[#454932] flex justify-between items-center bg-[#051424]">
          <div>
            <h3 className="font-headline text-lg font-bold text-white">
              Seleccionar Ejercicio
            </h3>
            <p className="text-xs text-[#c6c9ab]">Añade ejercicios a tu rutina actual</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#c6c9ab] hover:text-white p-1 rounded-full hover:bg-[#122131]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-[#454932]/40 space-y-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#c6c9ab]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full bg-[#051424] border border-[#454932] text-white text-sm rounded-lg py-2 pl-10 pr-3 focus:border-[#d2f000] focus:outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedCategory === cat
                    ? 'bg-[#d2f000] text-[#191e00]'
                    : 'bg-[#051424] text-[#c6c9ab] border border-[#454932]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => onSelectExercise(exercise)}
              className="flex items-center gap-4 bg-[#051424] p-3 rounded-xl border border-[#454932]/40 hover:border-[#d2f000] cursor-pointer transition-all group"
            >
              <img
                src={exercise.imageUrl}
                alt={exercise.name}
                className="w-16 h-16 rounded-lg object-cover bg-[#273647] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-[#d2f000] uppercase tracking-wider block">
                  {exercise.category}
                </span>
                <h4 className="font-headline text-sm font-bold text-white group-hover:text-[#d2f000] truncate">
                  {exercise.name}
                </h4>
                <p className="text-xs text-[#c6c9ab] truncate mt-0.5">
                  {exercise.secondaryMuscles}
                </p>
              </div>
              <button className="bg-[#d2f000] text-[#191e00] p-2 rounded-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-base">add</span>
              </button>
            </div>
          ))}

          {filteredExercises.length === 0 && (
            <div className="text-center py-8 text-[#c6c9ab]">
              No se encontraron ejercicios en esta categoría.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
