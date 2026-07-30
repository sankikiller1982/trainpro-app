import React, { useState, useMemo } from 'react';
import { useToast } from './ToastContext';
import { Exercise, MuscleCategory } from '../types';

interface EjerciciosViewProps {
  exercises: Exercise[];
  onAddExerciseToRoutine: (exercise: Exercise) => void;
  onAddCustomExercise: (exercise: Exercise) => void;
  onDeleteExercise: (exercise: Exercise) => void;
}

export const EjerciciosView: React.FC<EjerciciosViewProps> = ({
  exercises,
  onAddExerciseToRoutine,
  onAddCustomExercise,
  onDeleteExercise,
}) => {
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<MuscleCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExerciseModal, setSelectedExerciseModal] = useState<Exercise | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [hoveredExerciseId, setHoveredExerciseId] = useState<string | null>(null);
  const [confirmDeleteExercise, setConfirmDeleteExercise] = useState<Exercise | null>(null);

  // Pagination state for performance with 1300+ items
  const [displayCount, setDisplayCount] = useState(36);

  // Create exercise form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Exclude<MuscleCategory, 'Todos'>>('Pecho');
  const [newMuscles, setNewMuscles] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newGifUrl, setNewGifUrl] = useState('');
  const [newSets, setNewSets] = useState(3);
  const [newReps, setNewReps] = useState('10-12');
  const [showDatasetPicker, setShowDatasetPicker] = useState<'image' | 'gif' | null>(null);

  const datasetExercises = useMemo(() => exercises.filter(e => e.id.startsWith('ds-')), [exercises]);

  const categories: MuscleCategory[] = [
    'Todos',
    'Pecho',
    'Espalda',
    'Piernas',
    'Hombros',
    'Brazos',
    'Core',
  ];

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        ex.name.toLowerCase().includes(query) ||
        ex.secondaryMuscles.toLowerCase().includes(query) ||
        (ex.equipment && ex.equipment.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [exercises, selectedCategory, searchQuery]);

  const visibleExercises = useMemo(() => {
    return filteredExercises.slice(0, displayCount);
  }, [filteredExercises, displayCount]);

  // Count exercises by category
  const categoryCounts = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat] = cat === 'Todos' ? exercises.length : exercises.filter((e) => e.category === cat).length;
      return acc;
    }, {} as Record<string, number>);
  }, [exercises, categories]);

  const handleQuickAdd = (e: React.MouseEvent, exercise: Exercise) => {
    e.stopPropagation();
    onAddExerciseToRoutine(exercise);
  };

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const defaultImg =
      newImageUrl.trim() ||
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80';

    const newExercise: Exercise = {
      id: `ex-custom-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      secondaryMuscles: newMuscles.trim() || newCategory,
      imageUrl: defaultImg,
      gifUrl: newGifUrl.trim() || undefined,
      description: newDescription.trim() || `Ejercicio personalizado: ${newName.trim()}.`,
      defaultSets: newSets,
      defaultReps: newReps,
    };

    onAddCustomExercise(newExercise);
    setNewName('');
    setNewMuscles('');
    setNewDescription('');
    setNewImageUrl('');
    setNewGifUrl('');
    setNewSets(3);
    setNewReps('10-12');
    setIsCreateModalOpen(false);
  };

  return (
    <main className="flex-1 overflow-y-auto pb-32">
      {/* Search & Header Section */}
      <div className="px-4 md:px-16 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-white mb-1">
              Catálogo de Ejercicios
            </h2>
            <p className="text-[#c6c9ab] text-sm">
              <span className="text-[#d2f000] font-bold">{exercises.length}</span> ejercicios disponibles con GIFs animados
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#d2f000] text-[#191e00] font-bold text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] self-start md:self-auto"
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDisplayCount(36); // Reset pagination on search
            }}
            placeholder="Buscar por nombre, músculo o equipamiento (ej: mancuerna, squat)..."
            className="w-full bg-[#122131] border border-[#454932] text-[#d4e4fa] font-medium rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#d2f000] focus:ring-1 focus:ring-[#d2f000] transition-colors placeholder-[#c6c9ab] text-sm shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDisplayCount(36);
              }}
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
              onClick={() => {
                setSelectedCategory(cat);
                setDisplayCount(36);
              }}
              className={`shrink-0 px-4 py-1.5 rounded-full font-semibold text-xs transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-[#d2f000] text-[#191e00] border border-[#d2f000] shadow-md'
                  : 'bg-[#122131] text-[#c6c9ab] border border-[#454932] hover:border-[#d2f000] hover:text-[#d2f000]'
              }`}
            >
              {cat}
              <span className={`text-[10px] font-bold ${selectedCategory === cat ? 'text-[#191e00]/70' : 'text-[#c6c9ab]/70'}`}>
                {categoryCounts[cat]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="px-4 md:px-16 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {visibleExercises.map((exercise) => {
            const isHovered = hoveredExerciseId === exercise.id;
            const currentSrc = isHovered && exercise.gifUrl ? exercise.gifUrl : exercise.imageUrl;

            return (
              <div
                key={exercise.id}
                onClick={() => setSelectedExerciseModal(exercise)}
                onMouseEnter={() => setHoveredExerciseId(exercise.id)}
                onMouseLeave={() => setHoveredExerciseId(null)}
                className="group relative rounded-2xl overflow-hidden bg-[#122131] border border-[#454932] aspect-[4/3] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg hover:border-[#d2f000]/70"
              >
                <img
                  src={currentSrc}
                  alt={exercise.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 exercise-card-overlay flex flex-col justify-end p-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#1c2b3c]/90 text-[#d2f000] font-bold text-[10px] uppercase tracking-wider backdrop-blur-sm border border-[#454932]">
                          {exercise.category}
                        </span>
                        {exercise.gifUrl && (
                          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold text-[9px] uppercase tracking-wider border border-green-500/30 flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            GIF
                          </span>
                        )}
                      </div>
                      <h3 className="font-headline text-base font-bold text-white group-hover:text-[#d2f000] transition-colors leading-snug">
                        {exercise.name}
                      </h3>
                      <p className="text-[11px] text-[#c6c9ab] mt-0.5 truncate">{exercise.secondaryMuscles}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteExercise(exercise); }}
                        className="p-1 text-[#c6c9ab]/60 hover:text-[#ffb4ab] hover:scale-125 transition-all shrink-0"
                        title="Eliminar ejercicio"
                      >
                        <span className="material-symbols-outlined text-xl">remove_circle</span>
                      </button>
                      <button
                        onClick={(e) => handleQuickAdd(e, exercise)}
                        className="p-1 text-[#d2f000] hover:scale-125 transition-transform active:scale-95 shrink-0"
                        title="Añadir a la rutina"
                      >
                        <span className="material-symbols-outlined text-3xl">add_circle</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredExercises.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#c6c9ab] bg-[#122131]/40 rounded-2xl border border-dashed border-[#454932]">
              <span className="material-symbols-outlined text-4xl mb-2">fitness_center</span>
              <p className="text-base font-semibold">No se encontraron ejercicios</p>
              <p className="text-xs text-[#c6c9ab]">Intenta seleccionar otra categoría o cambiar el término de búsqueda.</p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {filteredExercises.length > displayCount && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setDisplayCount((prev) => prev + 36)}
              className="bg-[#122131] border border-[#454932] text-white hover:border-[#d2f000] hover:text-[#d2f000] font-bold text-xs px-6 py-3 rounded-xl transition-all shadow flex items-center gap-2"
            >
              Cargar Más Ejercicios ({filteredExercises.length - displayCount} restantes)
              <span className="material-symbols-outlined text-base">expand_more</span>
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#122131] border border-[#454932] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            <div className="relative h-64 bg-black">
              <img
                src={selectedExerciseModal.gifUrl || selectedExerciseModal.imageUrl}
                alt={selectedExerciseModal.name}
                className="w-full h-full object-contain"
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
                Músculos / Target: <span className="text-white">{selectedExerciseModal.secondaryMuscles}</span>
              </p>

              <p className="text-sm text-[#d4e4fa] leading-relaxed mb-6">
                {selectedExerciseModal.description ||
                  'Ejercicio de alto rendimiento enfocado en estímulo muscular y sobrecarga progresiva.'}
              </p>

              <div className="flex justify-between items-center bg-[#051424] p-3 rounded-xl mb-6 border border-[#454932]/40">
                <div>
                  <span className="text-[10px] text-[#c6c9ab] uppercase font-bold">Series Recomendadas</span>
                  <p className="text-base font-bold text-white">{selectedExerciseModal.defaultSets} series</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#c6c9ab] uppercase font-bold">Repeticiones</span>
                  <p className="text-base font-bold text-[#d2f000]">{selectedExerciseModal.defaultReps} reps</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDeleteExercise(selectedExerciseModal)}
                  className="w-10 h-10 rounded-xl border border-[#ffb4ab]/40 text-[#ffb4ab] hover:bg-[#ffb4ab]/10 flex items-center justify-center shrink-0"
                  title="Eliminar ejercicio"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
                <button
                  onClick={() => setSelectedExerciseModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#454932] text-sm text-[#c6c9ab] hover:text-white font-semibold"
                >
                  Cerrar
                </button>
                <button
                  onClick={(e) => {
                    handleQuickAdd(e, selectedExerciseModal);
                    setSelectedExerciseModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#d2f000] text-[#191e00] font-bold text-sm hover:opacity-90 flex items-center justify-center gap-1 shadow"
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
                  Crear Ejercicio Personalizado
                </h3>
                <p className="text-xs text-[#c6c9ab]">Añade un nuevo ejercicio al catálogo con su imagen o GIF</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#c6c9ab] hover:text-white p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateExercise} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1">
                  Nombre del Ejercicio *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Press Inclinado con Mancuernas"
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
                    {categories.filter((c) => c !== 'Todos').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1">
                    Músculos Principales
                  </label>
                  <input
                    type="text"
                    value={newMuscles}
                    onChange={(e) => setNewMuscles(e.target.value)}
                    placeholder="Ej. Pectoral Superior, Tríceps"
                    className="w-full bg-[#051424] border border-[#454932] rounded-lg py-2 px-3 text-[#d4e4fa] focus:border-[#d2f000] focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1">
                  URL de Imagen (Thumbnail)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg (opcional)"
                    className="flex-1 bg-[#051424] border border-[#454932] rounded-lg py-2 px-3 text-[#d4e4fa] focus:border-[#d2f000] focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDatasetPicker('image')}
                    className="shrink-0 bg-[#1c2b3c] hover:bg-[#273647] border border-[#454932] rounded-lg px-2.5 py-1 text-xs text-[#c6c9ab] font-semibold transition-colors"
                    title="Usar imagen del dataset"
                  >
                    Dataset
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1">
                  URL de GIF Animado
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newGifUrl}
                    onChange={(e) => setNewGifUrl(e.target.value)}
                    placeholder="https://ejemplo.com/animacion.gif (opcional)"
                    className="flex-1 bg-[#051424] border border-[#454932] rounded-lg py-2 px-3 text-[#d4e4fa] focus:border-[#d2f000] focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDatasetPicker('gif')}
                    className="shrink-0 bg-[#1c2b3c] hover:bg-[#273647] border border-[#454932] rounded-lg px-2.5 py-1 text-xs text-[#c6c9ab] font-semibold transition-colors"
                    title="Usar GIF del dataset"
                  >
                    Dataset
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1">
                  Instrucciones o Descripción
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detalles sobre técnica o postura..."
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
                    placeholder="Ej. 10-12"
                    className="w-full bg-[#051424] border border-[#454932] rounded-lg py-2 px-3 text-[#d4e4fa] focus:border-[#d2f000] focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-[#c6c9ab] hover:text-white font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#d2f000] text-[#191e00] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-1 shadow"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  Guardar Ejercicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#122131] border border-[#454932] rounded-xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ffb4ab]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ffb4ab]">delete</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-white">¿Eliminar ejercicio?</h3>
            </div>
            <p className="text-sm text-[#c6c9ab] mb-2">
              Vas a eliminar <span className="text-white font-semibold">{confirmDeleteExercise.name}</span> del catálogo.
            </p>
            <p className="text-xs text-[#c6c9ab]/70 mb-6">
              Esta acción no afecta las rutinas que ya lo incluyen.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteExercise(null)}
                className="px-4 py-2 text-sm text-[#c6c9ab] hover:text-white font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteExercise(confirmDeleteExercise);
                  setConfirmDeleteExercise(null);
                  setSelectedExerciseModal(null);
                }}
                className="bg-[#ffb4ab] text-[#690005] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dataset Image Picker Modal */}
      {showDatasetPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#122131] border border-[#454932] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl animate-scale-in flex flex-col">
            <div className="p-4 border-b border-[#454932] flex items-center justify-between bg-[#051424] shrink-0">
              <h3 className="font-headline text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d2f000]">photo_library</span>
                {showDatasetPicker === 'image' ? 'Seleccionar Imagen' : 'Seleccionar GIF'} del Dataset
              </h3>
              <button
                onClick={() => setShowDatasetPicker(null)}
                className="text-[#c6c9ab] hover:text-white p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {datasetExercises.map((ex) => {
                  const src = showDatasetPicker === 'gif' && ex.gifUrl ? ex.gifUrl : ex.imageUrl;
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => {
                        if (showDatasetPicker === 'gif' && ex.gifUrl) {
                          setNewGifUrl(ex.gifUrl);
                        } else {
                          setNewImageUrl(ex.imageUrl);
                        }
                        setShowDatasetPicker(null);
                      }}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-[#454932] hover:border-[#d2f000] transition-all bg-[#051424]"
                    >
                      <img
                        src={src}
                        alt={ex.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                        <span className="text-[10px] text-white font-semibold text-center leading-tight truncate">
                          {ex.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
