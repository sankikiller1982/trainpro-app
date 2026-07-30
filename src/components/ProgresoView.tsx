import React, { useState } from 'react';
import { RoutineAssignment, Student } from '../types';

interface ProgresoViewProps {
  students: Student[];
  selectedStudent: Student;
  onSelectStudent: (student: Student) => void;
  onCreateNewProgram: (student: Student) => void;
  assignments?: RoutineAssignment[];
}

type LiftType = 'Sentadilla' | 'Press de Banca' | 'Peso Muerto' | 'OHP';

export const ProgresoView: React.FC<ProgresoViewProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  onCreateNewProgram,
  assignments = [],
}) => {
  const [selectedLift, setSelectedLift] = useState<LiftType>('Sentadilla');
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; val: number } | null>(null);

  // Filter assignments for selected student
  const studentAssignments = assignments.filter((a) => a.studentId === selectedStudent.id);

  const liftData = selectedStudent.oneRepMax[selectedLift] || [100, 110, 120, 130, 140];
  const xLabels = ['S1', 'S4', 'S8', 'S12', 'S16'];

  // Normalize lift values for SVG rendering
  const minVal = Math.min(...liftData) - 10;
  const maxVal = Math.max(...liftData) + 15;
  const range = maxVal - minVal || 1;

  const points = liftData.map((val, idx) => {
    const x = (idx / (liftData.length - 1)) * 360 + 20;
    const y = 180 - ((val - minVal) / range) * 140;
    return { x, y, val, label: xLabels[idx] };
  });

  // Construct SVG path string with quadratic curve
  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} 200 L ${points[0].x} 200 Z`;

  return (
    <main className="flex-1 overflow-y-auto px-4 md:px-16 py-6 pb-32 max-w-7xl mx-auto w-full">
      {/* Student Selector & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-[#122131] p-5 rounded-2xl border border-[#454932]">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border border-[#454932] shrink-0 bg-[#273647]">
            <img
              src={selectedStudent.avatarUrl}
              alt={selectedStudent.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={selectedStudent.id}
                onChange={(e) => {
                  const s = students.find((st) => st.id === e.target.value);
                  if (s) onSelectStudent(s);
                }}
                className="bg-transparent font-headline text-xl md:text-2xl font-bold text-white focus:outline-none cursor-pointer border-b border-dashed border-[#c6c9ab] pb-0.5"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id} className="bg-[#122131] text-white">
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="font-medium text-sm text-[#c6c9ab] flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm text-[#d2f000]">workspace_premium</span>
              {selectedStudent.level}
            </p>
          </div>
        </div>

        <button
          onClick={() => onCreateNewProgram(selectedStudent)}
          className="bg-[#d2f000] text-[#191e00] font-headline text-sm font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuevo Programa
        </button>
      </div>

      {/* Assigned Routines Section */}
      <div className="mb-8">
        <h3 className="font-headline text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#d2f000]">assignment_turned_in</span>
          Rutinas Asignadas ({studentAssignments.length})
        </h3>

        {studentAssignments.length === 0 ? (
          <div className="bg-[#122131]/40 border border-dashed border-[#454932] rounded-xl p-6 text-center">
            <p className="text-sm text-[#c6c9ab]">No hay rutinas asignadas a este alumno aún.</p>
            <p className="text-xs text-[#c6c9ab]/70 mt-1">
              Asigna una rutina guardada desde la pestaña Creador.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentAssignments.map((assign) => (
              <div key={assign.id} className="bg-[#122131] border border-[#454932] rounded-xl p-5 shadow-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold text-[10px] uppercase tracking-wider mb-1 inline-block border border-green-500/30">
                      Asignada {new Date(assign.assignedAt).toLocaleDateString('es-ES')}
                    </span>
                    <h4 className="font-headline text-base font-bold text-white">
                      {assign.routineName}
                    </h4>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="text-[#c6c9ab] hover:text-white p-1"
                    title="Imprimir / Exportar"
                  >
                    <span className="material-symbols-outlined text-base">print</span>
                  </button>
                </div>

                <div className="space-y-2 mt-3 pt-3 border-t border-[#454932]/40">
                  {assign.exercises.map((ex, idx) => (
                    <div key={ex.id || idx} className="flex items-center justify-between bg-[#051424] p-2.5 rounded-lg text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={ex.gifUrl || ex.imageUrl} alt={ex.exerciseName} className="w-8 h-8 rounded object-cover shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-white truncate">{ex.exerciseName}</p>
                          <p className="text-[10px] text-[#c6c9ab]">{ex.targetMuscles}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-[#d2f000]">{ex.sets} series</span> × <span className="font-medium text-white">{ex.reps}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="glass-card rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden shadow-lg">
          <div className="absolute -right-4 -bottom-4 opacity-10 text-white pointer-events-none">
            <span className="material-symbols-outlined text-[100px]">calendar_month</span>
          </div>
          <p className="font-semibold text-xs md:text-sm text-[#c6c9ab] z-10 uppercase tracking-wider">
            Sesiones Totales
          </p>
          <div className="z-10">
            <p className="font-headline text-2xl md:text-3xl font-extrabold text-white">
              {selectedStudent.totalSessions}
            </p>
            <p className="text-[12px] text-[#d2f000] mt-0.5 font-medium">
              +{selectedStudent.sessionsThisMonth} este mes
            </p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden shadow-lg">
          <div className="absolute -right-4 -bottom-4 opacity-10 text-white pointer-events-none">
            <span className="material-symbols-outlined text-[100px]">fitness_center</span>
          </div>
          <p className="font-semibold text-xs md:text-sm text-[#c6c9ab] z-10 uppercase tracking-wider">
            Volumen Total (kg)
          </p>
          <div className="z-10">
            <p className="font-headline text-2xl md:text-3xl font-extrabold text-white">
              {selectedStudent.totalVolumeKg}
            </p>
            <p className="text-[12px] text-[#d2f000] mt-0.5 font-medium">Top 5%</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden shadow-lg">
          <div className="absolute -right-4 -bottom-4 opacity-10 text-white pointer-events-none">
            <span className="material-symbols-outlined text-[100px]">scale</span>
          </div>
          <p className="font-semibold text-xs md:text-sm text-[#c6c9ab] z-10 uppercase tracking-wider">
            Peso Corporal
          </p>
          <div className="z-10">
            <p className="font-headline text-2xl md:text-3xl font-extrabold text-white">
              {selectedStudent.bodyWeightKg}
              <span className="text-base font-normal text-[#c6c9ab] ml-0.5">kg</span>
            </p>
            <p className="text-[12px] text-[#c6c9ab] mt-0.5">{selectedStudent.bodyWeightChange}</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden shadow-lg">
          <div className="absolute -right-4 -bottom-4 opacity-10 text-white pointer-events-none">
            <span className="material-symbols-outlined text-[100px]">local_fire_department</span>
          </div>
          <p className="font-semibold text-xs md:text-sm text-[#c6c9ab] z-10 uppercase tracking-wider">
            Racha Actual
          </p>
          <div className="z-10">
            <p className="font-headline text-2xl md:text-3xl font-extrabold text-white">
              {selectedStudent.currentStreakWeeks}
            </p>
            <p className="text-[12px] text-[#c6c9ab] mt-0.5">Semanas activo</p>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <h3 className="font-headline text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#d2f000]">trending_up</span>
        Progresión de Fuerza (1RM)
      </h3>

      <div className="glass-card rounded-xl p-4 md:p-6 mb-8 border border-[#454932]">
        {/* Filter Chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {(['Sentadilla', 'Press de Banca', 'Peso Muerto', 'OHP'] as LiftType[]).map((lift) => (
            <button
              key={lift}
              onClick={() => setSelectedLift(lift)}
              className={`px-4 py-1.5 rounded-full font-semibold text-xs transition-all whitespace-nowrap ${
                selectedLift === lift
                  ? 'bg-[#d2f000] text-[#191e00] shadow-md'
                  : 'border border-[#454932] text-[#c6c9ab] bg-[#0d1c2d] hover:border-[#d2f000] hover:text-white'
              }`}
            >
              {lift}
            </button>
          ))}
        </div>

        {/* Chart Area */}
        <div className="w-full h-64 chart-grid relative rounded-lg border border-[#454932]/40 flex items-end p-2 overflow-hidden">
          {/* Y Axis Labels */}
          <div className="absolute left-2 top-2 bottom-6 flex flex-col justify-between text-[11px] text-[#c6c9ab] font-mono pointer-events-none">
            <span>{Math.round(maxVal)} kg</span>
            <span>{Math.round((maxVal + minVal) / 2)} kg</span>
            <span>{Math.round(minVal)} kg</span>
          </div>

          {/* SVG Line Chart */}
          <svg className="w-full h-full absolute inset-0 z-10 pt-4 px-10 pb-8 overflow-visible" viewBox="0 0 400 200">
            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#d2f000" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#d2f000" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area under curve */}
            <path d={areaD} fill="url(#chartGradient)" />

            {/* Main Path */}
            <path
              d={pathD}
              fill="none"
              stroke="#d2f000"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Circles */}
            {points.map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint?.index === idx ? '7' : '5'}
                  fill="#051424"
                  stroke="#d2f000"
                  strokeWidth="2.5"
                  className="cursor-pointer transition-all duration-200 hover:scale-125"
                  onMouseEnter={() => setHoveredPoint({ index: idx, val: pt.val })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="2"
                  fill="#ffffff"
                  className="pointer-events-none"
                />
              </g>
            ))}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-3 right-3 bg-[#122131] border border-[#d2f000] text-white text-xs px-3 py-1.5 rounded-lg shadow-xl z-20 font-mono">
              <span className="text-[#c6c9ab]">Semana {hoveredPoint.index * 4 || 1}: </span>
              <span className="text-[#d2f000] font-bold">{hoveredPoint.val} kg</span>
            </div>
          )}

          {/* X Axis Labels */}
          <div className="absolute bottom-1 left-10 right-10 flex justify-between text-[11px] text-[#c6c9ab] font-mono pointer-events-none">
            {xLabels.map((lbl, i) => (
              <span key={i}>{lbl}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Routine History Timeline */}
      <h3 className="font-headline text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#d2f000]">history</span>
        Historial de Programas
      </h3>

      <div className="space-y-4 relative before:absolute before:inset-0 before:left-[19px] md:before:left-1/2 before:-translate-x-px before:h-full before:w-0.5 before:bg-[#454932]/50">
        {selectedStudent.programHistory.map((item) => {
          const isActual = item.status === 'ACTUAL';
          return (
            <div
              key={item.id}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-4"
            >
              {/* Marker Icon */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 z-10 ${
                  isActual
                    ? 'border-[#d2f000] bg-[#122131] text-[#d2f000] shadow-[0_0_12px_rgba(210,240,0,0.3)]'
                    : 'border-[#454932] bg-[#051424] text-[#c6c9ab]'
                } md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isActual ? 'radio_button_checked' : 'check_circle'}
                </span>
              </div>

              {/* Card */}
              <div
                className={`w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] glass-card p-4 rounded-xl ml-4 md:ml-0 md:group-odd:mr-4 md:group-even:ml-4 border ${
                  isActual ? 'border-[#d2f000]/40 shadow-lg' : 'border-[#454932]/40 opacity-80'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      isActual ? 'text-[#d2f000]' : 'text-[#c6c9ab]'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-xs text-[#c6c9ab]">{item.dates}</span>
                </div>
                <h4 className="font-headline text-base font-bold text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-[#c6c9ab] mb-3 leading-relaxed">{item.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#1c2b3c] rounded text-[10px] font-semibold text-[#c6c9ab] border border-[#454932]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
