import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Exercise, RoutineExercise, SavedRoutine, Student } from '../types';
import { useToast } from './ToastContext';

interface CreadorViewProps {
  students: Student[];
  savedRoutines: SavedRoutine[];
  onSaveRoutine: (routine: SavedRoutine) => void;
  onDeleteRoutine: (routineId: string) => void;
  onAssignRoutine: (routine: SavedRoutine, studentId: string) => void;
  onOpenAddModal: () => void;
}

type EditorMode = 'list' | 'editor';

export const CreadorView: React.FC<CreadorViewProps> = ({
  students,
  savedRoutines,
  onSaveRoutine,
  onDeleteRoutine,
  onAssignRoutine,
  onOpenAddModal,
}) => {
  const { addToast } = useToast();

  // Editor mode: list of saved routines vs editing a routine
  const [mode, setMode] = useState<EditorMode>('list');

  // Internal editor state
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineTitle, setRoutineTitle] = useState('Nueva Rutina');
  const [routineDescription, setRoutineDescription] = useState('');
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);

  // UI state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [assignModalRoutine, setAssignModalRoutine] = useState<SavedRoutine | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Drag & Drop state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Expose a function on window so AddExerciseModal can add exercises to the editor
  const handleAddExerciseFromCatalog = useCallback((exercise: Exercise) => {
    const newRoutineEx: RoutineExercise = {
      id: `re-${Date.now()}-${Math.random()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      targetMuscles: exercise.secondaryMuscles,
      imageUrl: exercise.imageUrl,
      gifUrl: exercise.gifUrl,
      sets: exercise.defaultSets || 3,
      reps: exercise.defaultReps || '10',
      restTime: '60 seg',
      notes: '',
    };
    setRoutineExercises((prev) => [...prev, newRoutineEx]);
  }, []);

  useEffect(() => {
    if (mode === 'editor') {
      (window as any).__addExerciseToEditor = handleAddExerciseFromCatalog;
    }
    return () => {
      delete (window as any).__addExerciseToEditor;
    };
  }, [mode, handleAddExerciseFromCatalog]);

  // Drag handlers
  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
    setDraggingIdx(idx);
  };

  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
    setDragOverIdx(idx);
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const reordered = [...routineExercises];
      const [removed] = reordered.splice(dragItem.current, 1);
      reordered.splice(dragOverItem.current, 0, removed);
      setRoutineExercises(reordered);
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleUpdateExercise = (id: string, updates: Partial<RoutineExercise>) => {
    setRoutineExercises((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveExercise = (id: string) => {
    setRoutineExercises((prev) => prev.filter((item) => item.id !== id));
    addToast('Ejercicio eliminado de la rutina', 'info');
    setConfirmDeleteId(null);
  };

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // New routine
  const handleNewRoutine = () => {
    setEditingRoutineId(null);
    setRoutineTitle('Nueva Rutina');
    setRoutineDescription('');
    setRoutineExercises([]);
    setExpandedNotes(new Set());
    setMode('editor');
  };

  // Edit existing
  const handleEditRoutine = (routine: SavedRoutine) => {
    setEditingRoutineId(routine.id);
    setRoutineTitle(routine.name);
    setRoutineDescription(routine.description || '');
    setRoutineExercises([...routine.exercises]);
    setExpandedNotes(new Set());
    setMode('editor');
  };

  // Save
  const handleSave = () => {
    if (!routineTitle.trim()) {
      addToast('Ingresa un nombre para la rutina', 'error');
      return;
    }
    if (routineExercises.length === 0) {
      addToast('Añade al menos un ejercicio', 'error');
      return;
    }

    const now = new Date().toISOString();
    const routine: SavedRoutine = {
      id: editingRoutineId || `rt-${Date.now()}`,
      name: routineTitle.trim(),
      description: routineDescription.trim(),
      exercises: routineExercises,
      createdAt: editingRoutineId
        ? (savedRoutines.find((r) => r.id === editingRoutineId)?.createdAt || now)
        : now,
      updatedAt: now,
    };

    onSaveRoutine(routine);
    setMode('list');
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    let text = `🏋️ *TRAINPRO - ${routineTitle}*\n\n`;

    if (routineExercises.length === 0) {
      text += `(Sin ejercicios asignados aún)`;
    } else {
      routineExercises.forEach((ex, i) => {
        text += `${i + 1}. *${ex.exerciseName}* (${ex.targetMuscles})\n`;
        text += `   • Series: ${ex.sets} | Reps: ${ex.reps}`;
        if (ex.weight) text += ` | Peso: ${ex.weight}kg`;
        if (ex.restTime) text += ` | Descanso: ${ex.restTime}`;
        text += `\n`;
        if (ex.notes) text += `   📝 ${ex.notes}\n`;
        const gifSrc = ex.gifUrl || ex.imageUrl;
        if (gifSrc) text += `   🎬 ${window.location.origin}${gifSrc}\n`;
        text += `\n`;
      });
    }

    text += `¡A darlo todo hoy en el entrenamiento! 💪🔥`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  // Computed stats
  const totalSets = routineExercises.reduce((acc, ex) => acc + ex.sets, 0);
  const uniqueMuscles = [...new Set(routineExercises.flatMap(ex => ex.targetMuscles.split(', ')))];

  // ========================================
  //  RENDER: List of Saved Routines
  // ========================================
  if (mode === 'list') {
    return (
      <main className="flex-grow px-4 md:px-16 py-6 max-w-7xl mx-auto w-full pb-36">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-white mb-1">
              Creador de Rutinas
            </h2>
            <p className="text-[#c6c9ab] text-sm">
              {savedRoutines.length} rutinas guardadas · Crea, edita y asigna rutinas a tus alumnos
            </p>
          </div>
          <button
            onClick={handleNewRoutine}
            className="bg-[#d2f000] text-[#191e00] font-bold text-sm px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nueva Rutina
          </button>
        </div>

        {savedRoutines.length === 0 ? (
          <div className="text-center py-20 px-4 bg-[#122131]/40 rounded-2xl border border-dashed border-[#454932] flex flex-col items-center animate-fade-in">
            <span className="material-symbols-outlined text-6xl text-[#c6c9ab] mb-4">architecture</span>
            <h3 className="font-headline text-xl font-bold text-white mb-2">Sin rutinas todavía</h3>
            <p className="text-sm text-[#c6c9ab] max-w-md mb-6">
              Crea tu primera rutina seleccionando ejercicios del catálogo, configura series y repeticiones, y guárdala para asignarla a tus alumnos.
            </p>
            <button
              onClick={handleNewRoutine}
              className="bg-[#d2f000] text-[#191e00] font-bold text-sm px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Crear mi Primera Rutina
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {savedRoutines.map((routine) => (
              <div
                key={routine.id}
                className="bg-[#122131] rounded-xl border border-[#454932] overflow-hidden shadow-lg hover:border-[#d2f000]/50 transition-all group flex flex-col"
              >
                {/* Preview: first exercise image or placeholder */}
                <div className="relative h-36 bg-[#051424] overflow-hidden">
                  {routine.exercises.length > 0 ? (
                    <img
                      src={routine.exercises[0].gifUrl || routine.exercises[0].imageUrl}
                      alt={routine.exercises[0].exerciseName}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-[#454932]">fitness_center</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#122131] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-headline text-lg font-bold text-white group-hover:text-[#d2f000] transition-colors truncate">
                      {routine.name}
                    </h3>
                    {routine.description && (
                      <p className="text-xs text-[#c6c9ab] truncate mt-0.5">{routine.description}</p>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <span className="bg-[#1c2b3c]/80 backdrop-blur-sm text-[#d2f000] font-bold text-[10px] px-2 py-0.5 rounded-full border border-[#454932]">
                      {routine.exercises.length} ej.
                    </span>
                  </div>
                </div>

                {/* Exercise mini-list */}
                <div className="p-4 flex-1">
                  <div className="space-y-1.5 mb-4 max-h-[120px] overflow-y-auto scrollbar-hide">
                    {routine.exercises.slice(0, 4).map((ex, idx) => (
                      <div key={ex.id || idx} className="flex items-center gap-2 text-xs">
                        <span className="text-[#d2f000] font-bold w-4 text-right">{idx + 1}.</span>
                        <span className="text-white truncate flex-1">{ex.exerciseName}</span>
                        <span className="text-[#c6c9ab] shrink-0">{ex.sets}×{ex.reps}</span>
                      </div>
                    ))}
                    {routine.exercises.length > 4 && (
                      <p className="text-[10px] text-[#c6c9ab] pl-6">+{routine.exercises.length - 4} más...</p>
                    )}
                  </div>

                  <p className="text-[10px] text-[#c6c9ab] mb-3">
                    Actualizada: {new Date(routine.updatedAt).toLocaleDateString('es-ES')}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="p-4 pt-0 flex gap-2">
                  <button
                    onClick={() => handleEditRoutine(routine)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 rounded-lg border border-[#454932] text-[#c6c9ab] hover:text-white hover:border-[#c6c9ab] transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setAssignModalRoutine(routine);
                      if (students.length > 0) setSelectedStudentId(students[0].id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-bold py-2 rounded-lg bg-[#d2f000] text-[#191e00] hover:opacity-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    Asignar
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(routine.id)}
                    className="flex items-center justify-center p-2 rounded-lg border border-[#454932] text-[#c6c9ab] hover:text-[#ffb4ab] hover:border-[#ffb4ab] transition-all"
                    title="Eliminar rutina"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#122131] border border-[#454932] rounded-xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#ffb4ab]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#ffb4ab]">delete</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-white">¿Eliminar rutina?</h3>
              </div>
              <p className="text-sm text-[#c6c9ab] mb-6">
                Esta acción eliminará la rutina permanentemente de la nube. Las asignaciones existentes se mantendrán.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 text-sm text-[#c6c9ab] hover:text-white font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onDeleteRoutine(confirmDeleteId);
                    setConfirmDeleteId(null);
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

        {/* Assign to Student Modal */}
        {assignModalRoutine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#122131] border border-[#454932] rounded-xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in">
              <div className="p-5 border-b border-[#454932] bg-[#051424]">
                <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#d2f000]">person_add</span>
                  Asignar Rutina
                </h3>
                <p className="text-xs text-[#c6c9ab] mt-1">
                  Asignar "<span className="text-white font-semibold">{assignModalRoutine.name}</span>" a un alumno
                </p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1.5">
                    Seleccionar Alumno
                  </label>
                  <div className="relative">
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full bg-[#051424] border border-[#454932] text-[#d4e4fa] font-medium text-sm rounded-lg py-2.5 px-3 pr-8 focus:border-[#d2f000] focus:outline-none appearance-none cursor-pointer"
                    >
                      {students.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-2.5 pointer-events-none text-[#c6c9ab] text-base">
                      arrow_drop_down
                    </span>
                  </div>
                </div>

                <div className="bg-[#051424] rounded-lg p-3 border border-[#454932]/40">
                  <p className="text-[10px] text-[#c6c9ab] uppercase font-bold mb-1">Resumen de la rutina</p>
                  <p className="text-sm text-white font-semibold">{assignModalRoutine.exercises.length} ejercicios</p>
                  <p className="text-xs text-[#c6c9ab] mt-0.5">
                    {assignModalRoutine.exercises.reduce((a, e) => a + e.sets, 0)} series totales
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setAssignModalRoutine(null)}
                    className="px-4 py-2 text-sm text-[#c6c9ab] hover:text-white font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (selectedStudentId) {
                        onAssignRoutine(assignModalRoutine, selectedStudentId);
                        setAssignModalRoutine(null);
                      }
                    }}
                    className="bg-[#d2f000] text-[#191e00] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">check</span>
                    Asignar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // ========================================
  //  RENDER: Routine Editor
  // ========================================
  return (
    <main className="flex-grow px-4 md:px-16 py-6 max-w-7xl mx-auto w-full pb-36">
      <div className="flex flex-col gap-6">
        {/* Editor Header */}
        <section className="bg-[#122131] rounded-xl p-4 md:p-5 border border-[#454932] shadow-lg animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setMode('list')}
              className="flex items-center gap-1 text-[#c6c9ab] hover:text-white transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Volver a Rutinas
            </button>
            <div className="flex gap-2">
              {routineExercises.length > 0 && (
                <>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-[#c6c9ab] hover:text-white transition-colors text-xs font-semibold bg-[#051424] px-3 py-2 rounded-lg border border-[#454932]"
                    title="Exportar como PDF"
                  >
                    <span className="material-symbols-outlined text-sm">print</span>
                    PDF
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-1 text-white text-xs font-bold bg-[#25D366] px-3 py-2 rounded-lg hover:bg-[#128C7E] transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    WhatsApp
                  </button>
                </>
              )}
              <button
                onClick={handleSave}
                className="flex items-center gap-1 text-[#191e00] text-xs font-bold bg-[#d2f000] px-4 py-2 rounded-lg hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                Guardar Rutina
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-xs text-[#c6c9ab] mb-1 uppercase tracking-wider block">
                Nombre de la Rutina *
              </label>
              <input
                type="text"
                value={routineTitle}
                onChange={(e) => setRoutineTitle(e.target.value)}
                className="w-full bg-[#051424] border border-[#454932] text-white font-headline text-lg font-bold rounded-lg focus:border-[#d2f000] focus:outline-none px-3 py-2 transition-colors"
                placeholder="Ej. Lunes: Día de Empuje"
              />
            </div>
            <div>
              <label className="font-semibold text-xs text-[#c6c9ab] mb-1 uppercase tracking-wider block">
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={routineDescription}
                onChange={(e) => setRoutineDescription(e.target.value)}
                className="w-full bg-[#051424] border border-[#454932] text-[#d4e4fa] text-sm rounded-lg focus:border-[#d2f000] focus:outline-none px-3 py-2.5 transition-colors"
                placeholder="Ej. Rutina de fuerza para principiantes"
              />
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        {routineExercises.length > 0 && (
          <div className="grid grid-cols-3 gap-3 animate-fade-in-up">
            <div className="bg-[#122131] rounded-lg p-3 border border-[#454932]/50 text-center">
              <p className="text-[10px] text-[#c6c9ab] uppercase font-bold">Ejercicios</p>
              <p className="font-headline text-xl font-bold text-[#d2f000]">{routineExercises.length}</p>
            </div>
            <div className="bg-[#122131] rounded-lg p-3 border border-[#454932]/50 text-center">
              <p className="text-[10px] text-[#c6c9ab] uppercase font-bold">Series Total</p>
              <p className="font-headline text-xl font-bold text-white">{totalSets}</p>
            </div>
            <div className="bg-[#122131] rounded-lg p-3 border border-[#454932]/50 text-center">
              <p className="text-[10px] text-[#c6c9ab] uppercase font-bold">Grupos</p>
              <p className="font-headline text-xl font-bold text-white">{uniqueMuscles.length}</p>
            </div>
          </div>
        )}

        {/* Workout Builder Canvas */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#d2f000]">format_list_numbered</span>
              Ejercicios de la Rutina
            </h3>
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 text-[#d2f000] hover:opacity-80 transition-opacity font-bold text-sm bg-[#122131] px-4 py-2 rounded-lg border border-[#d2f000]/30 hover:border-[#d2f000]"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Añadir Ejercicio
            </button>
          </div>

          {/* Exercise List */}
          {routineExercises.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#122131]/40 rounded-xl border border-dashed border-[#454932] flex flex-col items-center animate-fade-in">
              <span className="material-symbols-outlined text-5xl text-[#c6c9ab] mb-3">architecture</span>
              <h3 className="font-headline text-lg font-bold text-white mb-1">Rutina vacía</h3>
              <p className="text-xs text-[#c6c9ab] max-w-sm mb-4">
                Añade ejercicios desde el catálogo para construir esta rutina.
              </p>
              <button
                onClick={onOpenAddModal}
                className="bg-[#d2f000] text-[#191e00] font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1 hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Seleccionar Ejercicio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {routineExercises.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`bg-[#122131] rounded-xl overflow-hidden border relative group shadow-lg flex flex-col transition-all duration-200 ${
                    draggingIdx === index ? 'opacity-50 scale-[0.97] border-[#454932]' : ''
                  } ${
                    dragOverIdx === index && draggingIdx !== index ? 'border-[#d2f000] bg-[#122131]/80' : 'border-[#454932]'
                  }`}
                >
                  {/* Image Header */}
                  <div
                    className="bg-cover bg-center w-full h-32 relative cursor-grab active:cursor-grabbing"
                    style={{ backgroundImage: `url('${item.gifUrl || item.imageUrl}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#122131] via-black/40 to-black/60" />

                    {/* Drag Handle */}
                    <div className="absolute top-2 left-2 text-white/60 hover:text-white bg-black/40 rounded p-0.5">
                      <span className="material-symbols-outlined text-sm">drag_indicator</span>
                    </div>

                    {/* Exercise Number Badge */}
                    <div className="absolute top-2 left-10 bg-[#d2f000] text-[#191e00] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>

                    <div className="absolute bottom-2 left-3 right-8">
                      <h3 className="font-headline text-base font-bold text-white leading-tight">
                        {item.exerciseName}
                      </h3>
                      <p className="text-xs text-[#c6c9ab] truncate mt-0.5">{item.targetMuscles}</p>
                    </div>

                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="absolute top-2 right-2 text-[#c6c9ab] hover:text-[#ffb4ab] transition-colors bg-black/60 rounded-full p-1 hover:bg-black"
                      title="Eliminar ejercicio"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>

                  {/* Inputs Section */}
                  <div className="p-3 bg-[#122131] flex flex-col gap-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="font-bold text-[10px] text-[#c6c9ab] uppercase tracking-wider block mb-1">
                          Series
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={item.sets}
                          onChange={(e) =>
                            handleUpdateExercise(item.id, { sets: parseInt(e.target.value) || 1 })
                          }
                          className="w-full bg-[#051424] border border-[#454932] text-white font-headline text-xl font-bold rounded focus:border-[#d2f000] focus:ring-1 focus:ring-[#d2f000] text-center py-1"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="font-bold text-[10px] text-[#c6c9ab] uppercase tracking-wider block mb-1">
                          Reps
                        </label>
                        <input
                          type="text"
                          value={item.reps}
                          onChange={(e) => handleUpdateExercise(item.id, { reps: e.target.value })}
                          className="w-full bg-[#051424] border border-[#454932] text-white font-headline text-xl font-bold rounded focus:border-[#d2f000] focus:ring-1 focus:ring-[#d2f000] text-center py-1"
                        />
                      </div>

                      <div className="flex-[0.7]">
                        <label className="font-bold text-[10px] text-[#c6c9ab] uppercase tracking-wider block mb-1">
                          Peso
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={item.weight ?? ''}
                          onChange={(e) =>
                            handleUpdateExercise(item.id, { weight: e.target.value ? parseFloat(e.target.value) : undefined })
                          }
                          placeholder="kg"
                          className="w-full bg-[#051424] border border-[#454932] text-white font-headline text-sm font-bold rounded focus:border-[#d2f000] focus:ring-1 focus:ring-[#d2f000] text-center py-1.5"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="font-bold text-[10px] text-[#c6c9ab] uppercase tracking-wider block mb-1">
                          Descanso
                        </label>
                        <input
                          type="text"
                          value={item.restTime || ''}
                          onChange={(e) => handleUpdateExercise(item.id, { restTime: e.target.value })}
                          placeholder="60s"
                          className="w-full bg-[#051424] border border-[#454932] text-white font-headline text-sm font-bold rounded focus:border-[#d2f000] focus:ring-1 focus:ring-[#d2f000] text-center py-1.5"
                        />
                      </div>
                    </div>

                    {/* Notes Toggle */}
                    <button
                      onClick={() => toggleNotes(item.id)}
                      className="flex items-center gap-1 text-[10px] text-[#c6c9ab] hover:text-[#d2f000] transition-colors font-semibold uppercase tracking-wider self-start"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {expandedNotes.has(item.id) ? 'expand_less' : 'note_add'}
                      </span>
                      {expandedNotes.has(item.id) ? 'Ocultar Notas' : 'Notas'}
                      {item.notes && !expandedNotes.has(item.id) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d2f000]"></span>
                      )}
                    </button>

                    {expandedNotes.has(item.id) && (
                      <textarea
                        value={item.notes || ''}
                        onChange={(e) => handleUpdateExercise(item.id, { notes: e.target.value })}
                        placeholder="Notas del entrenador..."
                        rows={2}
                        className="w-full bg-[#051424] border border-[#454932] text-[#d4e4fa] text-xs rounded py-2 px-2 focus:border-[#d2f000] focus:outline-none resize-none"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Delete Exercise Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#122131] border border-[#454932] rounded-xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ffb4ab]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ffb4ab]">delete</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-white">¿Eliminar ejercicio?</h3>
            </div>
            <p className="text-sm text-[#c6c9ab] mb-6">
              Esta acción eliminará el ejercicio de la rutina actual. Puedes volver a añadirlo desde el catálogo.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm text-[#c6c9ab] hover:text-white font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRemoveExercise(confirmDeleteId)}
                className="bg-[#ffb4ab] text-[#690005] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
