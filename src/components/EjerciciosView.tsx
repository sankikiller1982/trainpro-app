import React, { useState } from 'react';
import { useToast } from './ToastContext';
import { Exercise, MuscleCategory } from '../types';

interface EjerciciosViewProps {
  exercises: Exercise[];
  onAddExerciseToRoutine: (exercise: Exercise) => void;
  onAddCustomExercise: (exercise: Exercise) => void;
}

export const EjerciciosView: React.FC<EjerciciosViewProps> = ({
  exercises,
  onAddExerciseToRoutine,
  onAddCustomExercise,
}) => {
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<MuscleCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExerciseModal, setSelectedExerciseModal] = useState<Exercise | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Create exercise form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Exclude<MuscleCategory, 'Todos'>>('Pecho');
  const [newMuscles, setNewMuscles] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSets, setNewSets] = useState(3);
  const [newReps, setNewReps] = useState('10');

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

  // Count exercises by category
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = cat === 'Todos' ? exercises.length : exercises.filter(e => e.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const handleQuickAdd = (e: React.MouseEvent, exercise: Exercise) => {
    e.stopPropagation();
    onAddExerciseToRoutine(exercise);
  };

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newExercise: Exercise = {
      id: `ex-custom-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      secondaryMuscles: newMuscles.trim() || newCategory,
      imageUrl: `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80`,
      description: newDescription.trim() || `Ejercicio personalizado: ${newName.trim()}.`,
      defaultSets: newSets,
      defaultReps: newReps,
    };

    onAddCustomExercise(newExercise);
    setNewName('');
    setNewMuscles('');
    setNewDescription('');
    setNewSets(3);
    setNewReps('10');
    setIsCreateModalOpen(false);
  };

  return (
    <main className="flex-1 overflow-y-auto pb-32">
      {/* Search Section */}
      <div className="px-4 md:px-16 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-white mb-1">
              Catálogo de Ejercicios
            </h2>
            <p className="text-[#c6c9ab] text-sm">
              {exercises.length} ejercicios disponibles · Filtra por grupo muscular
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#d2f000] text-[#191e00] font-bold text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Crear Ejercicio
          </button>
        </div>

        <div className="relative w-full max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#c6c9ab]">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ejercicios..."
            className="w-full bg-[#122131] border border-[#454932] text-[#d4e4fa] font-medium rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-[#d2f000] focus:ring-1 focus:ring-[#d2f000] transition-colors placeholder-[#c6c9ab] text-sm shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#c6c9ab] hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="px-4 md:px-16 pb-4">
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full font-semibold text-xs transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-[#d2f000] text-[#191e00] border border-[#d2f000] shadow-md'
                  : 'bg-[#122131] text-[#c6c9ab] border border-[#454932] hover:border-[#d2f000] hover:text-[#d2f000]'
              }`}
            >
              {cat}
              <span className={`text-[10px] font-bold ${selectedCategory === cat ? 'text-[#191e00]/60' : 'text-[#c6c9ab]/60'}`}>
                {categoryCounts[cat]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="px-4 md:px-16 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => setSelectedExerciseModal(exercise)}
              className="group relative rounded-xl overflow-hidden bg-[#122131] border border-[#454932] aspect-[4/3] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg hover:border-[#d2f000]/70"
            >
              <img
                src={exercise.imageUrl}
                alt={exercise.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 exercise-card-overlay flex flex-col justify-end p-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1c2b3c]/80 text-[#d2f000] font-bold text-[10px] mb-1 inline-block uppercase tracking-wider backdrop-blur-sm border border-[#454932]">
                      {exercise.category}
                    </span>
                    <h3 className="font-headline text-lg font-bold text-white group-hover:text-[#d2f000] transition-colors">
                      {exercise.name}
                    </h3>
                    <p className="text-[11px] text-[#c6c9ab] mt-0.5">{exercise.secondaryMuscles}</p>
                  </div>
                  <button
                    onClick={(e) => handleQuickAdd(e, exercise)}
                    className="p-1 text-[#d2f000] hover:scale-125 transition-transform active:scale-95"
                    title="Añadir a la rutina"
                  >
                    <span className="material-symbols-outlined text-3xl">add_circle</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredExercises.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#c6c9ab] bg-[#122131]/40 rounded-xl border border-dashed border-[#454932]">
              <span className="material-symbols-outlined text-4xl mb-2">fitness_center</span>
              <p className="text-base font-semibold">No se encontraron ejercicios</p>
              <p className="text-xs text-[#c6c9ab]">Intenta seleccionar otra categoría o cambiar el término de búsqueda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#122131] border border-[#454932] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            <div className="relative h-56">
              <img
                src={selectedExerciseModal.imageUrl}
                alt={selectedExerciseModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#122131] via-transparent to-black/40" />
              <button
                onClick={() => setSelectedExerciseModal(null)}
                className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1.5 hover:bg-black"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
              <span className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-[#d2f000] text-[#191e00] font-bold text-xs uppercase tracking-wider">
                {selectedExerciseModal.category}
              </span>
            </div>

            <div className="p-6">
              <h3 className="font-headline text-xl font-bold text-white mb-1">
                {selectedExerciseModal.name}
              </h3>
              <p className="text-xs text-[#c6c9ab] mb-4">
                Músculos secundarios: <span className="text-white">{selectedExerciseModal.secondaryMuscles}</span>
              </p>

              <p className="text-sm text-[#d4e4fa] leading-relaxed mb-6">
                {selectedExerciseModal.description ||
                  'Ejercicio de alto rendimiento enfocado en estímulo muscular y sobrecarga progresiva.'}
              </p>

              <div className="flex justify-between items-center bg-[#051424] p-3 rounded-lg mb-6 border border-[#454932]/40">
                <div>
                  <span className="text-[10px] text-[#c6c9ab] uppercase font-bold">Series Recomendadas</span>
                  <p className="text-base font-bold text-white">{selectedExerciseModal.defaultSets} series</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#c6c9ab] uppercase font-bold">Repeticiones</span>
                  <p className="text-base font-bold text-[#d2f000]">{selectedExerciseModal.defaultReps} reps</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedExerciseModal(null)}
                  className="flex-1 py-2.5 rounded-lg border border-[#454932] text-sm text-[#c6c9ab] hover:text-white"
                >
                  Cerrar
                </button>
                <button
                  onClick={(e) => {
                    handleQuickAdd(e, selectedExerciseModal);
                    setSelectedExerciseModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-[#d2f000] text-[#191e00] font-bold text-sm hover:opacity-90 flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Añadir a Rutina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Exercise Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#122131] border border-[#454932] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-5 border-b border-[#454932] flex justify-between items-center bg-[#051424]">
              <div>
                <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#d2f000]">add_circle</span>
                  Crear Ejercicio
                </h3>
                <p className="text-xs text-[#c6c9ab]">Añade un ejercicio personalizado al catálogo</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#c6c9ab] hover:text-white p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateExercise} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1">
                  Nombre del Ejercicio *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Sentadilla Frontal"
                  className="w-full bg-[#051424] border border-[#454932] rounded-lg py-2 px-3 text-[#d4e4fa] focus:border-[#d2f000] focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1">
                    Categoría *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Exclude<MuscleCategory, 'Todos'>)}
                    className="w-full bg-[#051424] border border-[#454932] rounded-lg py-2 px-3 text-[#d4e4fa] focus:border-[#d2f000] focus:outline-none text-sm"
                  >
                    {categories.filter(c => c !== 'Todos').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1">
                    Músculos
                  </label>
                  <input
                    type="text"
                    value={newMuscles}
                    onChange={(e) => setNewMuscles(e.target.value)}
                    placeholder="Ej. Cuádriceps, Core"
                    className="w-full bg-[#051424] border border-[#454932] rounded-lg py-2 px-3 text-[#d4e4fa] focus:border-[#d2f000] focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1">
                  Descripción
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descripción del ejercicio..."
                  rows={2}
                  className="w-full bg-[#051424] border border-[#454932] rounded-lg py-2 px-3 text-[#d4e4fa] focus:border-[#d2f000] focus:outline-none text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1">
                    Series por Defecto
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newSets}
                    onChange={(e) => setNewSets(parseInt(e.target.value) || 3)}
                    className="w-full bg-[#051424] border border-[#454932] rounded-lg py-2 px-3 text-[#d4e4fa] focus:border-[#d2f000] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1">
                    Reps por Defecto
                  </label>
                  <input
                    type="text"
                    value={newReps}
                    onChange={(e) => setNewReps(e.target.value)}
                    placeholder="Ej. 8-10"
                    className="w-full bg-[#051424] border border-[#454932] rounded-lg py-2 px-3 text-[#d4e4fa] focus:border-[#d2f000] focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-[#c6c9ab] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#d2f000] text-[#191e00] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  Crear Ejercicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
