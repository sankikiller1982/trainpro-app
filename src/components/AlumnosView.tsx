import React, { useState } from 'react';
import { Student } from '../types';

interface AlumnosViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onAddStudent: (name: string) => void;
}

export const AlumnosView: React.FC<AlumnosViewProps> = ({
  students,
  onSelectStudent,
  onAddStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentLevel, setNewStudentLevel] = useState('Nivel Principiante');

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.currentProgram.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dashboard stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'En Marcha').length;
  const needsReview = students.filter(s => s.status === 'Revisar').length;
  const totalSessionsThisMonth = students.reduce((acc, s) => acc + s.sessionsThisMonth, 0);

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    onAddStudent(newStudentName.trim());
    setNewStudentName('');
    setIsAddingModalOpen(false);
  };

  return (
    <main className="flex-1 px-4 md:px-16 py-6 pb-32 w-full max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-white mb-1">
            Alumnos Activos
          </h2>
          <p className="text-[#c6c9ab] text-sm md:text-base">
            Gestiona tus alumnos y revisa su actividad reciente.
          </p>
        </div>
        <button
          onClick={() => setIsAddingModalOpen(true)}
          className="bg-[#d2f000] text-[#191e00] font-bold text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Añadir Alumno
        </button>
      </div>

      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 stagger-children">
        <div className="glass-card rounded-xl p-4 flex items-center gap-3 border border-[#454932]/50">
          <div className="w-10 h-10 rounded-lg bg-[#d2f000]/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#d2f000]">group</span>
          </div>
          <div>
            <p className="text-[10px] text-[#c6c9ab] uppercase font-bold tracking-wider">Total</p>
            <p className="font-headline text-xl font-bold text-white">{totalStudents}</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3 border border-[#454932]/50">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-green-400">check_circle</span>
          </div>
          <div>
            <p className="text-[10px] text-[#c6c9ab] uppercase font-bold tracking-wider">Activos</p>
            <p className="font-headline text-xl font-bold text-white">{activeStudents}</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3 border border-[#454932]/50">
          <div className="w-10 h-10 rounded-lg bg-[#ffb4ab]/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#ffb4ab]">warning</span>
          </div>
          <div>
            <p className="text-[10px] text-[#c6c9ab] uppercase font-bold tracking-wider">Revisar</p>
            <p className="font-headline text-xl font-bold text-white">{needsReview}</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3 border border-[#454932]/50">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-blue-400">event_available</span>
          </div>
          <div>
            <p className="text-[10px] text-[#c6c9ab] uppercase font-bold tracking-wider">Sesiones/Mes</p>
            <p className="font-headline text-xl font-bold text-white">{totalSessionsThisMonth}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-xl mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#c6c9ab]">
          <span className="material-symbols-outlined">search</span>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar alumnos por nombre..."
          className="w-full bg-[#122131] border border-[#454932] rounded-lg py-2.5 pl-10 pr-4 text-[#d4e4fa] placeholder-[#c6c9ab] focus:outline-none focus:border-[#d2f000] focus:ring-1 focus:ring-[#d2f000] transition-colors text-sm shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#c6c9ab] hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Client List (Bento-style Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            onClick={() => onSelectStudent(student)}
            className="bg-[#122131] rounded-xl p-4 border border-[#454932] hover:border-[#d2f000]/60 transition-all cursor-pointer group active:scale-[1.01] shadow-md"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-[#273647] shrink-0 border-2 border-transparent group-hover:border-[#d2f000] transition-colors">
                <img
                  src={student.avatarUrl}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-headline text-base font-bold text-white truncate">
                  {student.name}
                </h3>
                <p className="text-xs text-[#c6c9ab] flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[15px]">schedule</span>
                  Última actividad: {student.lastActivity}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    student.status === 'En Marcha' ? 'bg-[#d2f000]' :
                    student.status === 'Revisar' ? 'bg-[#ffb4ab] animate-pulse' :
                    'bg-[#c6c9ab]'
                  }`}></span>
                  <span className={`text-[11px] font-semibold ${
                    student.status === 'En Marcha' ? 'text-[#d2f000]' :
                    student.status === 'Revisar' ? 'text-[#ffb4ab]' :
                    'text-[#c6c9ab]'
                  }`}>{student.status || 'En Marcha'}</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#c6c9ab] group-hover:text-[#d2f000] transition-colors">
                chevron_right
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#051424] rounded-lg p-3 border border-[#454932]/30">
              <div>
                <p className="font-semibold text-[10px] text-[#c6c9ab] uppercase tracking-wider">
                  Programa Actual
                </p>
                <p className="text-xs font-medium text-[#d4e4fa] truncate mt-0.5">
                  {student.currentProgram}
                </p>
              </div>

              <div>
                {student.nextSession ? (
                  <>
                    <p className="font-semibold text-[10px] text-[#c6c9ab] uppercase tracking-wider">
                      Próxima Sesión
                    </p>
                    <p className="text-xs font-semibold text-[#d2f000] mt-0.5">
                      {student.nextSession}
                    </p>
                  </>
                ) : student.actionNeeded ? (
                  <>
                    <p className="font-semibold text-[10px] text-[#c6c9ab] uppercase tracking-wider">
                      Acción Necesaria
                    </p>
                    <p className="text-xs font-semibold text-[#ffb4ab] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      {student.actionNeeded}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-[10px] text-[#c6c9ab] uppercase tracking-wider">
                      Sesiones/Mes
                    </p>
                    <p className="text-xs font-medium text-[#d4e4fa] mt-0.5">
                      {student.sessionsThisMonth}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="flex justify-between mt-3 px-1">
              <div className="flex items-center gap-1 text-[11px] text-[#c6c9ab]">
                <span className="material-symbols-outlined text-[14px]">fitness_center</span>
                {student.totalSessions} sesiones
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#c6c9ab]">
                <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                {student.currentStreakWeeks} sem racha
              </div>
            </div>
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#c6c9ab] bg-[#122131]/50 rounded-xl border border-dashed border-[#454932]">
            <span className="material-symbols-outlined text-4xl mb-2">person_search</span>
            <p className="text-base font-semibold">No se encontraron alumnos</p>
            <p className="text-xs text-[#c6c9ab]">Intenta cambiar tu búsqueda o añade un nuevo alumno.</p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isAddingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#122131] border border-[#454932] rounded-xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline text-lg font-bold text-white">Nuevo Alumno</h3>
              <button
                onClick={() => setIsAddingModalOpen(false)}
                className="text-[#c6c9ab] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ej. Laura Fernández"
                  className="w-full bg-[#051424] border border-[#454932] rounded-lg py-2 px-3 text-[#d4e4fa] focus:border-[#d2f000] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c6c9ab] uppercase mb-1">
                  Nivel de Experiencia
                </label>
                <select
                  value={newStudentLevel}
                  onChange={(e) => setNewStudentLevel(e.target.value)}
                  className="w-full bg-[#051424] border border-[#454932] rounded-lg py-2 px-3 text-[#d4e4fa] focus:border-[#d2f000] focus:outline-none text-sm"
                >
                  <option value="Nivel Principiante">Nivel Principiante</option>
                  <option value="Nivel Atleta Intermedio">Nivel Atleta Intermedio</option>
                  <option value="Nivel Atleta Pro">Nivel Atleta Pro</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingModalOpen(false)}
                  className="px-4 py-2 text-sm text-[#c6c9ab] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#d2f000] text-[#191e00] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-all"
                >
                  Guardar Alumno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
