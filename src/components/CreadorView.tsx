import React, { useState, useRef } from 'react';
import { RoutineExercise, SavedRoutine, Student } from '../types';

interface CreadorViewProps {
  students: Student[];
  savedRoutines: SavedRoutine[];
  onSaveRoutine: (routine: SavedRoutine) => void;
  onDeleteRoutine: (routineId: string) => void;
  onAssignRoutine: (routine: SavedRoutine, studentId: string) => void;
  onOpenAddModal: () => void;
}

export const CreadorView: React.FC<CreadorViewProps> = ({
  students,
  savedRoutines,
  onSaveRoutine,
  onDeleteRoutine,
  onAssignRoutine,
  onOpenAddModal,
}) => {
  // Mode: 'library' (routine list) or 'editor' (building/editing a routine)
  const [mode, setMode] = useState<'library' | 'editor'>('library');

  // Currently editing routine state
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineTitle, setRoutineTitle] = useState('Rutina Hipertrofia A');
  const [routineDescription, setRoutineDescription] = useState('Enfoque en tensión mecánica y sobrecarga progresiva.');
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);

  // Modals & UI states
  const [assignModalRoutine, setAssignModalRoutine] = useState<SavedRoutine | null>(null);
  const [selectedStudentForAssign, setSelectedStudentForAssign] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteExId, setConfirmDeleteExId] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  // Drag & Drop refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // ----------------------------------------------------
  // Actions for Library
  // ----------------------------------------------------

  const handleStartNewRoutine = () => {
    setEditingRoutineId(null);
    setRoutineTitle('Nueva Rutina Personalizada');
    setRoutineDescription('');
    setRoutineExercises([]);
    setMode('editor');
  };

  const handleEditRoutine = (routine: SavedRoutine) => {
    setEditingRoutineId(routine.id);
    setRoutineTitle(routine.name);
    setRoutineDescription(routine.description || '');
    setRoutineExercises([...routine.exercises]);
    setMode('editor');
  };

  const handleSaveCurrentRoutine = () => {
    if (!routineTitle.trim()) return;

    const routineToSave: SavedRoutine = {
      id: editingRoutineId || `rt-${Date.now()}`,
      name: routineTitle.trim(),
      description: routineDescription.trim(),
      exercises: routineExercises,
      createdAt: editingRoutineId
        ? savedRoutines.find((r) => r.id === editingRoutineId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveRoutine(routineToSave);
    setEditingRoutineId(routineToSave.id);
  };

  // ----------------------------------------------------
  // Drag & Drop Handlers
  // ----------------------------------------------------

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

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateExercise = (id: string, updates: Partial<RoutineExercise>) => {
    setRoutineExercises((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeExercise = (id: string) => {
    setRoutineExercises((prev) => prev.filter((item) => item.id !== id));
  };

  // Expose function for external add modal
  // Note: App.tsx will call onAddExerciseToRoutine which we handle via updating routineExercises
  React.useEffect(() => {
    (window as any).__addExerciseToEditor = (ex: any) => {
      const newRoutineEx: RoutineExercise = {
        id: `re-${Date.now()}-${Math.random()}`,
        exerciseId: ex.id,
        exerciseName: ex.name,
        targetMuscles: ex.secondaryMuscles,
        imageUrl: ex.imageUrl,
        gifUrl: ex.gifUrl,
        sets: ex.defaultSets || 3,
        reps: ex.defaultReps || '10',
        restTime: '60 seg',
        notes: '',
      };
      setRoutineExercises((prev) => [...prev, newRoutineEx]);
    };
  }, []);

  const handleConfirmAssign = () => {
    if (assignModalRoutine && selectedStudentForAssign) {
      onAssignRoutine(assignModalRoutine, selectedStudentForAssign);
      setAssignModalRoutine(null);
      setSelectedStudentForAssign('');
    }
  };

  const totalSets = routineExercises.reduce((acc, ex) => acc + ex.sets, 0);

  return (
    <main className="flex-grow px-4 md:px-16 py-6 max-w-7xl mx-auto w-full pb-36">
      {/* MODE 1: ROUTINE LIBRARY */}
      {mode === 'library' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Quick Create */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#122131] rounded-2xl p-6 border border-[#454932] shadow-xl">
            <div>
              <span className="px-3 py-1 rounded-full bg-[#d2f000]/10 text-[#d2f000] font-bold text-xs uppercase tracking-wider mb-2 inline-block">
                Creador & Gestión
              </span>
              <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-white">
                Rutinas e Itinerarios
              </h2>
              <p className="text-[#c6c9ab] text-sm mt-1">
                Crea, reutiliza y asigna rutinas con un identificador único para cada alumno.
              </p>
            </div>
            <button
              onClick={handleStartNewRoutine}
              className="bg-[#d2f000] text-[#191e00] font-headline font-extrabold text-sm px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] cursor-pointer self-start md:self-auto"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Crear Nueva Rutina
            </button>
          </div>

          {/* Routine List Grid */}
          <div>
            <h3 className="font-headline text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#d2f000]">folder_copy</span>
              Rutinas Guardadas ({savedRoutines.length})
            </h3>

            {savedRoutines.length === 0 ? (
              <div className="text-center py-16 px-4 bg-[#122131]/40 rounded-2xl border border-dashed border-[#454932] flex flex-col items-center">
                <span className="material-symbols-outlined text-5xl text-[#c6c9ab] mb-3">fitness_center</span>
                <h4 className="font-headline text-lg font-bold text-white mb-1">No hay rutinas creadas aún</h4>
                <p className="text-xs text-[#c6c9ab] max-w-md mb-4">
                  Crea tu primera plantilla de entrenamiento para asignársela a tus alumnos o reutilizarla cuando quieras.
                </p>
                <button
                  onClick={handleStartNewRoutine}
                  className="bg-[#d2f000] text-[#191e00] font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 hover:opacity-90 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Crear Mi Primera Rutina
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
                {savedRoutines.map((routine) => (
                  <div
                    key={routine.id}
                    className="bg-[#122131] rounded-2xl p-5 border border-[#454932] hover:border-[#d2f000]/60 transition-all shadow-lg flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-headline text-lg font-bold text-white group-hover:text-[#d2f000] transition-colors">
                          {routine.name}
                        </h4>
                        <button
                          onClick={() => setConfirmDeleteId(routine.id)}
                          className="text-[#c6c9ab] hover:text-[#ffb4ab] p-1 transition-colors"
                          title="Eliminar rutina"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>

                      <p className="text-xs text-[#c6c9ab] line-clamp-2 mb-4">
                        {routine.description || 'Sin descripción.'}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-[#d4e4fa] bg-[#051424] p-3 rounded-xl mb-4 border border-[#454932]/40">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-[#d2f000]">fitness_center</span>
                          <span className="font-bold">{routine.exercises.length}</span> ejercicios
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-blue-400">repeat</span>
                          <span className="font-bold">{routine.exercises.reduce((a, b) => a + b.sets, 0)}</span> series
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[#454932]/40">
                      <button
                        onClick={() => handleEditRoutine(routine)}
                        className="flex-1 py-2 rounded-lg bg-[#1c2b3c] hover:bg-[#273647] text-white text-xs font-semibold flex items-center justify-center gap-1 border border-[#454932]"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setAssignModalRoutine(routine);
                          if (students.length > 0) setSelectedStudentForAssign(students[0].id);
                        }}
                        className="flex-1 py-2 rounded-lg bg-[#d2f000] text-[#191e00] hover:opacity-90 text-xs font-bold flex items-center justify-center gap-1 shadow"
                      >
                        <span className="material-symbols-outlined text-sm">person_add</span>
                        Asignar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: EDITOR */}
      {mode === 'editor' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Bar Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#122131] p-4 rounded-xl border border-[#454932]">
            <button
              onClick={() => setMode('library')}
              className="flex items-center gap-1 text-xs text-[#c6c9ab] hover:text-white font-semibold self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Volver a Rutinas Guardadas
            </button>

            <div className="flex gap-2 self-end sm:self-auto">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 text-xs font-semibold text-[#c6c9ab] hover:text-white bg-[#051424] px-3 py-2 rounded-lg border border-[#454932]"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                PDF
              </button>
              <button
                onClick={handleSaveCurrentRoutine}
                className="flex items-center gap-1 text-xs font-bold bg-[#d2f000] text-[#191e00] px-4 py-2 rounded-lg hover:opacity-90 shadow"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                Guardar Rutina
              </button>
            </div>
          </div>

          {/* Routine Header Info */}
          <div className="bg-[#122131] rounded-2xl p-6 border border-[#454932] space-y-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#c6c9ab] block mb-1">Nombre Identificador de la Rutina</label>
              <input
                type="text"
                value={routineTitle}
                onChange={(e) => setRoutineTitle(e.target.value)}
                placeholder="Ej. Torso Pesado - Día 1"
                className="w-full bg-[#051424] border border-[#454932] text-white font-headline text-xl font-bold rounded-lg py-2 px-3 focus:border-[#d2f000] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-[#c6c9ab] block mb-1">Descripción u Objetivos</label>
              <input
                type="text"
                value={routineDescription}
                onChange={(e) => setRoutineDescription(e.target.value)}
                placeholder="Ej. Enfoque en pectoral superior e hipertrofia de hombros."
                className="w-full bg-[#051424] border border-[#454932] text-[#d4e4fa] text-xs rounded-lg py-2 px-3 focus:border-[#d2f000] focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Stats */}
          {routineExercises.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#122131] rounded-xl p-3 border border-[#454932]/50 text-center">
                <p className="text-[10px] text-[#c6c9ab] uppercase font-bold">Ejercicios</p>
                <p className="font-headline text-xl font-bold text-[#d2f000]">{routineExercises.length}</p>
              </div>
              <div className="bg-[#122131] rounded-xl p-3 border border-[#454932]/50 text-center">
                <p className="text-[10px] text-[#c6c9ab] uppercase font-bold">Series Total</p>
                <p className="font-headline text-xl font-bold text-white">{totalSets}</p>
              </div>
              <div className="bg-[#122131] rounded-xl p-3 border border-[#454932]/50 text-center">
                <p className="text-[10px] text-[#c6c9ab] uppercase font-bold">Estado</p>
                <p className="font-headline text-xs font-bold text-green-400 mt-1">Listo para guardar</p>
              </div>
            </div>
          )}

          {/* Add Exercise Button */}
          <div className="flex justify-between items-center">
            <h3 className="font-headline text-lg font-bold text-white">Ejercicios de la Rutina</h3>
            <button
              onClick={onOpenAddModal}
              className="bg-[#d2f000] text-[#191e00] font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1 hover:opacity-90 shadow"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Añadir Ejercicio desde Catálogo
            </button>
          </div>

          {/* Exercise List Canvas */}
          {routineExercises.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#122131]/40 rounded-2xl border border-dashed border-[#454932] flex flex-col items-center">
              <span className="material-symbols-outlined text-5xl text-[#c6c9ab] mb-3">architecture</span>
              <h4 className="font-headline text-lg font-bold text-white mb-1">Sin ejercicios agregados</h4>
              <p className="text-xs text-[#c6c9ab] max-w-sm mb-4">
                Usa el botón de arriba para seleccionar ejercicios del catálogo y armar tu rutina.
              </p>
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
                  {/* Card Media Header */}
                  <div
                    className="bg-cover bg-center w-full h-36 relative cursor-grab active:cursor-grabbing"
                    style={{ backgroundImage: `url('${item.gifUrl || item.imageUrl}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#122131] via-black/40 to-black/60" />

                    <div className="absolute top-2 left-2 text-white/60 hover:text-white bg-black/40 rounded p-0.5">
                      <span className="material-symbols-outlined text-sm">drag_indicator</span>
                    </div>

                    <div className="absolute top-2 left-10 bg-[#d2f000] text-[#191e00] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>

                    <div className="absolute bottom-2 left-3 right-8">
                      <h4 className="font-headline text-base font-bold text-white leading-tight">
                        {item.exerciseName}
                      </h4>
                      <p className="text-xs text-[#c6c9ab] truncate mt-0.5">{item.targetMuscles}</p>
                    </div>

                    <button
                      onClick={() => setConfirmDeleteExId(item.id)}
                      className="absolute top-2 right-2 text-[#c6c9ab] hover:text-[#ffb4ab] transition-colors bg-black/60 rounded-full p-1"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>

                  {/* Card Inputs */}
                  <div className="p-3 bg-[#122131] flex flex-col gap-2">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="font-bold text-[10px] text-[#c6c9ab] uppercase block mb-1">
                          Series
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={item.sets}
                          onChange={(e) => updateExercise(item.id, { sets: parseInt(e.target.value) || 1 })}
                          className="w-full bg-[#051424] border border-[#454932] text-white font-headline text-lg font-bold rounded focus:border-[#d2f000] text-center py-1"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="font-bold text-[10px] text-[#c6c9ab] uppercase block mb-1">
                          Reps
                        </label>
                        <input
                          type="text"
                          value={item.reps}
                          onChange={(e) => updateExercise(item.id, { reps: e.target.value })}
                          className="w-full bg-[#051424] border border-[#454932] text-white font-headline text-lg font-bold rounded focus:border-[#d2f000] text-center py-1"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="font-bold text-[10px] text-[#c6c9ab] uppercase block mb-1">
                          Descanso
                        </label>
                        <input
                          type="text"
                          value={item.restTime || ''}
                          onChange={(e) => updateExercise(item.id, { restTime: e.target.value })}
                          placeholder="60s"
                          className="w-full bg-[#051424] border border-[#454932] text-white font-headline text-xs font-bold rounded focus:border-[#d2f000] text-center py-1.5"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => toggleNotes(item.id)}
                      className="flex items-center gap-1 text-[10px] text-[#c6c9ab] hover:text-[#d2f000] transition-colors font-semibold uppercase self-start mt-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {expandedNotes.has(item.id) ? 'expand_less' : 'note_add'}
                      </span>
                      {expandedNotes.has(item.id) ? 'Ocultar Notas' : 'Notas'}
                    </button>

                    {expandedNotes.has(item.id) && (
                      <textarea
                        value={item.notes || ''}
                        onChange={(e) => updateExercise(item.id, { notes: e.target.value })}
                        placeholder="Notas para el alumno..."
                        rows={2}
                        className="w-full bg-[#051424] border border-[#454932] text-[#d4e4fa] text-xs rounded py-2 px-2 focus:border-[#d2f000] focus:outline-none resize-none"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ASSIGN ROUTINE TO STUDENT */}
      {assignModalRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#122131] border border-[#454932] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d2f000]">send</span>
                Asignar Rutina a Alumno
              </h3>
              <button
                onClick={() => setAssignModalRoutine(null)}
                className="text-[#c6c9ab] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-[#051424] p-3 rounded-xl border border-[#454932]/50 mb-4">
              <p className="text-xs text-[#c6c9ab] uppercase font-bold">Rutina a enviar:</p>
              <p className="text-base font-bold text-white">{assignModalRoutine.name}</p>
              <p className="text-xs text-[#d2f000]">{assignModalRoutine.exercises.length} ejercicios incluidos</p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1">
                Selecciona el Alumno:
              </label>
              {students.length === 0 ? (
                <p className="text-xs text-[#ffb4ab]">No tienes alumnos registrados.</p>
              ) : (
                <select
                  value={selectedStudentForAssign}
                  onChange={(e) => setSelectedStudentForAssign(e.target.value)}
                  className="w-full bg-[#051424] border border-[#454932] rounded-lg py-2 px-3 text-[#d4e4fa] focus:border-[#d2f000] focus:outline-none text-sm"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} — ({st.level})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAssignModalRoutine(null)}
                className="px-4 py-2 text-sm text-[#c6c9ab] hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAssign}
                disabled={!selectedStudentForAssign}
                className="bg-[#d2f000] text-[#191e00] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-1 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">send</span>
                Confirmar y Asignar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ROUTINE CONFIRMATION MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#122131] border border-[#454932] rounded-xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
            <h3 className="font-headline text-lg font-bold text-white mb-2">¿Eliminar esta rutina guardada?</h3>
            <p className="text-xs text-[#c6c9ab] mb-6">Esta acción no se puede deshacer. Se borrará de la nube.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs text-[#c6c9ab] hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteRoutine(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="bg-[#ffb4ab] text-[#690005] font-bold text-xs px-4 py-2 rounded-lg hover:opacity-90"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE EXERCISE FROM EDITOR MODAL */}
      {confirmDeleteExId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#122131] border border-[#454932] rounded-xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
            <h3 className="font-headline text-lg font-bold text-white mb-2">¿Quitar ejercicio de la rutina?</h3>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setConfirmDeleteExId(null)}
                className="px-4 py-2 text-xs text-[#c6c9ab] hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  removeExercise(confirmDeleteExId);
                  setConfirmDeleteExId(null);
                }}
                className="bg-[#ffb4ab] text-[#690005] font-bold text-xs px-4 py-2 rounded-lg"
              >
                Quitar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
