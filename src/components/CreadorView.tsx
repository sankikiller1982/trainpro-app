import React, { useState, useRef } from 'react';
import { RoutineExercise, Student } from '../types';

interface CreadorViewProps {
  students: Student[];
  selectedStudent: Student;
  onSelectStudent: (student: Student) => void;
  routineExercises: RoutineExercise[];
  onUpdateExercise: (id: string, updates: Partial<RoutineExercise>) => void;
  onRemoveExercise: (id: string) => void;
  onReorderExercises: (exercises: RoutineExercise[]) => void;
  onOpenAddModal: () => void;
  routineTitle: string;
  setRoutineTitle: (title: string) => void;
}

type RoutineType = 'Día' | 'Semana' | 'Mes';

export const CreadorView: React.FC<CreadorViewProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  routineExercises,
  onUpdateExercise,
  onRemoveExercise,
  onReorderExercises,
  onOpenAddModal,
  routineTitle,
  setRoutineTitle,
}) => {
  const [routineType, setRoutineType] = useState<RoutineType>('Día');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  // Drag & Drop state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

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
      onReorderExercises(reordered);
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleConfirmDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleDeleteConfirmed = () => {
    if (confirmDeleteId) {
      onRemoveExercise(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    let text = `🏋️ *TRAINPRO - Rutina para ${selectedStudent.name}*\n`;
    text += `📅 *Tipo:* ${routineType} - ${routineTitle}\n\n`;

    if (routineExercises.length === 0) {
      text += `(Sin ejercicios asignados aún)`;
    } else {
      routineExercises.forEach((ex, i) => {
        text += `${i + 1}. *${ex.exerciseName}* (${ex.targetMuscles})\n`;
        text += `   • Series: ${ex.sets} | Reps: ${ex.reps}`;
        if (ex.restTime) text += ` | Descanso: ${ex.restTime}`;
        text += `\n`;
        if (ex.notes) text += `   📝 ${ex.notes}\n`;
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

  return (
    <main className="flex-grow px-4 md:px-16 py-6 max-w-7xl mx-auto w-full pb-36">
      <div className="flex flex-col gap-6">
        {/* Student Selector & Routine Type */}
        <section className="bg-[#122131] rounded-xl p-4 md:p-5 border border-[#454932] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-lg animate-fade-in-up">
          <div className="flex flex-col w-full md:w-auto">
            <label className="font-semibold text-xs text-[#c6c9ab] mb-1 uppercase tracking-wider">
              Seleccionar Alumno
            </label>
            <div className="relative">
              <select
                value={selectedStudent.id}
                onChange={(e) => {
                  const st = students.find((s) => s.id === e.target.value);
                  if (st) onSelectStudent(st);
                }}
                className="bg-[#051424] border border-[#454932] text-[#d4e4fa] font-medium text-sm rounded-lg focus:border-[#d2f000] focus:ring-1 focus:ring-[#d2f000] w-full md:w-64 py-2 px-3 pr-8 appearance-none cursor-pointer"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 pointer-events-none text-[#c6c9ab]">
                arrow_drop_down
              </span>
            </div>
          </div>

          <div className="flex flex-col w-full md:w-auto">
            <label className="font-semibold text-xs text-[#c6c9ab] mb-1 uppercase tracking-wider">
              Tipo de Rutina
            </label>
            <div className="flex bg-[#051424] rounded-lg p-1 border border-[#454932]">
              {(['Día', 'Semana', 'Mes'] as RoutineType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setRoutineType(type)}
                  className={`flex-1 px-4 py-1.5 rounded-md font-semibold text-xs transition-all ${
                    routineType === type
                      ? 'bg-[#d2f000] text-[#191e00] shadow'
                      : 'text-[#c6c9ab] hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={routineTitle}
                onChange={(e) => setRoutineTitle(e.target.value)}
                className="bg-transparent font-headline text-lg md:text-xl font-bold text-white border-b border-transparent hover:border-[#454932] focus:border-[#d2f000] focus:outline-none px-1 py-0.5 rounded transition-colors"
                placeholder="Ej. Lunes: Día de Empuje"
              />
              <span className="material-symbols-outlined text-[#c6c9ab] text-sm">edit</span>
            </div>

            <div className="flex gap-2 self-start sm:self-auto">
              {routineExercises.length > 0 && (
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 text-[#c6c9ab] hover:text-white transition-colors font-semibold text-sm bg-[#122131] px-3 py-2 rounded-lg border border-[#454932] hover:border-[#c6c9ab]"
                  title="Exportar como PDF"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  PDF
                </button>
              )}
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 text-[#d2f000] hover:opacity-80 transition-opacity font-bold text-sm bg-[#122131] px-4 py-2 rounded-lg border border-[#d2f000]/30 hover:border-[#d2f000]"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Añadir Ejercicio
              </button>
            </div>
          </div>

          {/* Exercise List */}
          {routineExercises.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#122131]/40 rounded-xl border border-dashed border-[#454932] flex flex-col items-center animate-fade-in">
              <span className="material-symbols-outlined text-5xl text-[#c6c9ab] mb-3">architecture</span>
              <h3 className="font-headline text-lg font-bold text-white mb-1">Rutina vacía</h3>
              <p className="text-xs text-[#c6c9ab] max-w-sm mb-4">
                Añade ejercicios desde el catálogo para estructurar la rutina diaria de {selectedStudent.name}.
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
                    style={{ backgroundImage: `url('${item.imageUrl}')` }}
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
                      onClick={() => handleConfirmDelete(item.id)}
                      className="absolute top-2 right-2 text-[#c6c9ab] hover:text-[#ffb4ab] transition-colors bg-black/60 rounded-full p-1 hover:bg-black"
                      title="Eliminar ejercicio"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>

                  {/* Inputs Section */}
                  <div className="p-3 bg-[#122131] flex flex-col gap-2">
                    <div className="flex gap-3">
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
                            onUpdateExercise(item.id, { sets: parseInt(e.target.value) || 1 })
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
                          onChange={(e) => onUpdateExercise(item.id, { reps: e.target.value })}
                          className="w-full bg-[#051424] border border-[#454932] text-white font-headline text-xl font-bold rounded focus:border-[#d2f000] focus:ring-1 focus:ring-[#d2f000] text-center py-1"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="font-bold text-[10px] text-[#c6c9ab] uppercase tracking-wider block mb-1">
                          Descanso
                        </label>
                        <input
                          type="text"
                          value={item.restTime || ''}
                          onChange={(e) => onUpdateExercise(item.id, { restTime: e.target.value })}
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
                        onChange={(e) => onUpdateExercise(item.id, { notes: e.target.value })}
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

      {/* Floating Action WhatsApp Button */}
      <div className="fixed bottom-22 md:bottom-6 left-0 w-full px-4 md:px-16 z-40 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-end pointer-events-auto">
          <button
            onClick={handleShareWhatsApp}
            className="bg-[#25D366] hover:bg-[#128C7E] text-white font-headline text-sm md:text-base font-bold px-6 py-3.5 rounded-full flex items-center gap-2.5 shadow-[0_8px_24px_rgba(37,211,102,0.4)] transition-transform active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">send</span>
            Compartir por WhatsApp
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
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
                onClick={handleDeleteConfirmed}
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
