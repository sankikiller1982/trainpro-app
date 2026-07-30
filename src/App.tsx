import { useState, useEffect, useCallback } from 'react';
import { AddExerciseModal } from './components/AddExerciseModal';
import { AlumnosView } from './components/AlumnosView';
import { BottomNav } from './components/BottomNav';
import { CreadorView } from './components/CreadorView';
import { EjerciciosView } from './components/EjerciciosView';
import { Header } from './components/Header';
import { ProgresoView } from './components/ProgresoView';
import { ShareModal } from './components/ShareModal';
import { ToastProvider, useToast } from './components/ToastContext';
import { INITIAL_STUDENTS } from './data/mockData';
import { getInitialExercisesCombined } from './data/allExercises';
import { Exercise, RoutineAssignment, SavedRoutine, Student, TabType } from './types';
import { sheetsApi } from './api/googleSheets';

function AppContent() {
  const { addToast } = useToast();
  
  // Estado de carga inicial
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<TabType>('alumnos');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [savedRoutines, setSavedRoutines] = useState<SavedRoutine[]>([]);
  const [assignments, setAssignments] = useState<RoutineAssignment[]>([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Carga inicial de datos desde Google Sheets y Dataset
  useEffect(() => {
    async function loadData() {
      try {
        const db = await sheetsApi.fetchAll();
        
        const loadedStudents = db.filter((r: any) => r.type === 'student').map((r: any) => r.data as Student);
        const loadedExercises = db.filter((r: any) => r.type === 'exercise').map((r: any) => r.data as Exercise);
        const loadedRoutines = db.filter((r: any) => r.type === 'saved_routine').map((r: any) => r.data as SavedRoutine);
        const loadedAssignments = db.filter((r: any) => r.type === 'assignment').map((r: any) => r.data as RoutineAssignment);

        // Estudiantes
        if (loadedStudents.length > 0) {
          setStudents(loadedStudents);
          setSelectedStudent(loadedStudents[0]);
        } else {
          setStudents(INITIAL_STUDENTS);
          setSelectedStudent(INITIAL_STUDENTS[3]);
        }

        // Combinar ejercicios iniciales + dataset completo + custom creados
        const baseCombined = getInitialExercisesCombined();
        if (loadedExercises.length > 0) {
          // Agregar custom exercises subidos previamente por el usuario, evitando duplicados
          const customOnly = loadedExercises.filter((e) => !baseCombined.some((b) => b.id === e.id || b.name.toLowerCase() === e.name.toLowerCase()));
          setExercises([...customOnly, ...baseCombined]);
        } else {
          setExercises(baseCombined);
        }

        // Rutinas Guardadas y Asignaciones
        if (loadedRoutines.length > 0) {
          setSavedRoutines(loadedRoutines);
        }
        if (loadedAssignments.length > 0) {
          setAssignments(loadedAssignments);
        }

      } catch (err) {
        console.error("Error al cargar la app:", err);
        addToast('Error de conexión. Trabajando offline.', 'error');
        setStudents(INITIAL_STUDENTS);
        setSelectedStudent(INITIAL_STUDENTS[3]);
        setExercises(getInitialExercisesCombined());
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [addToast]);

  // ----------------------------------------------------
  // Handlers para Rutinas Guardadas & Asignación
  // ----------------------------------------------------

  const handleSaveRoutine = useCallback((routine: SavedRoutine) => {
    setSavedRoutines((prev) => {
      const exists = prev.some((r) => r.id === routine.id);
      if (exists) {
        return prev.map((r) => (r.id === routine.id ? routine : r));
      }
      return [routine, ...prev];
    });

    addToast(`Rutina "${routine.name}" guardada en la nube`, 'success');
    sheetsApi.saveRecord(routine.id, 'saved_routine', routine).catch(console.error);
  }, [addToast]);

  const handleDeleteRoutine = useCallback((routineId: string) => {
    setSavedRoutines((prev) => prev.filter((r) => r.id !== routineId));
    addToast('Rutina eliminada de la nube', 'info');
    sheetsApi.deleteRecord(routineId, 'saved_routine').catch(console.error);
  }, [addToast]);

  const handleAssignRoutine = useCallback((routine: SavedRoutine, studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const newAssignment: RoutineAssignment = {
      id: `as-${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name,
      studentId: student.id,
      studentName: student.name,
      assignedAt: new Date().toISOString(),
      exercises: routine.exercises,
    };

    setAssignments((prev) => [newAssignment, ...prev]);
    addToast(`Rutina "${routine.name}" asignada a ${student.name}`, 'success');
    sheetsApi.saveRecord(newAssignment.id, 'assignment', newAssignment).catch(console.error);
  }, [students, addToast]);

  // ----------------------------------------------------
  // Handlers para Alumnos y Ejercicios
  // ----------------------------------------------------

  const handleSelectStudent = useCallback((student: Student) => {
    setSelectedStudent(student);
    setActiveTab('progreso');
  }, []);

  const handleCreateNewProgram = useCallback((student: Student) => {
    setSelectedStudent(student);
    setActiveTab('creador');
  }, []);

  const handleDeleteStudent = useCallback((studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setSelectedStudent((prev) => (prev?.id === studentId ? null : prev));
    addToast('Alumno eliminado', 'info');
    sheetsApi.deleteRecord(studentId, 'student').catch(console.error);
  }, [addToast]);

  const handleUpdateStudent = useCallback((updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedStudent((prev) => (prev?.id === updated.id ? updated : prev));
    addToast(`Alumno "${updated.name}" actualizado`, 'success');
    sheetsApi.saveRecord(updated.id, 'student', updated).catch(console.error);
  }, [addToast]);

  const handleAddStudent = useCallback((name: string) => {
    const newStudent: Student = {
      id: `st-${Date.now()}`,
      name,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      lastActivity: 'Recientemente',
      currentProgram: 'Evaluación Inicial',
      status: 'En Marcha',
      level: 'Nivel Principiante',
      totalSessions: 0,
      sessionsThisMonth: 0,
      totalVolumeKg: '0k',
      bodyWeightKg: 70.0,
      bodyWeightChange: '0.0kg',
      currentStreakWeeks: 1,
      oneRepMax: {
        Sentadilla: [60, 65, 70, 75, 80],
        'Press de Banca': [40, 45, 50, 52, 55],
        'Peso Muerto': [70, 75, 80, 85, 90],
        OHP: [25, 28, 30, 32, 35],
      },
      programHistory: [
        {
          id: `ph-${Date.now()}`,
          status: 'ACTUAL',
          dates: 'Hoy - Actual',
          title: 'Evaluación Inicial',
          description: 'Acondicionamiento físico y aprendizaje de técnica.',
          tags: ['3 Días/Sem', 'Principiante'],
        },
      ],
    };
    setStudents((prev) => [newStudent, ...prev]);
    setSelectedStudent(newStudent);
    addToast(`Alumno "${name}" guardado en la nube`, 'success');
    sheetsApi.saveRecord(newStudent.id, 'student', newStudent).catch(console.error);
  }, [addToast]);

  const handleAddCustomExercise = useCallback((exercise: Exercise) => {
    setExercises((prev) => [exercise, ...prev]);
    addToast(`Ejercicio "${exercise.name}" subido a la nube`, 'success');
    sheetsApi.saveRecord(exercise.id, 'exercise', exercise).catch(console.error);
  }, [addToast]);

  const handleDeleteExercise = useCallback((exercise: Exercise) => {
    setExercises((prev) => prev.filter((e) => e.id !== exercise.id));
    addToast(`Ejercicio "${exercise.name}" eliminado del catálogo`, 'info');
    sheetsApi.deleteRecord(exercise.id, 'exercise').catch(console.error);
  }, [addToast]);

  const handleAddExerciseToRoutineFromCatalog = useCallback((exercise: Exercise) => {
    // Si la función global existe (en modo Editor de CreadorView), invocarla
    if ((window as any).__addExerciseToEditor) {
      (window as any).__addExerciseToEditor(exercise);
      addToast(`"${exercise.name}" añadido a la rutina`, 'success');
    }
  }, [addToast]);

  // Pantalla de Carga Inicial
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#051424] text-[#d4e4fa]">
        <div className="w-16 h-16 border-4 border-[#454932] border-t-[#d2f000] rounded-full animate-spin mb-6"></div>
        <h1 className="font-headline text-2xl font-extrabold text-white tracking-tighter mb-2">TRAINPRO</h1>
        <p className="text-[#c6c9ab] text-sm animate-pulse">Sincronizando rutinas y catálogo en la nube...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#051424] text-[#d4e4fa]">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      <div className="flex-1 flex flex-col relative z-0">
        {activeTab === 'alumnos' && (
          <AlumnosView
            students={students}
            onSelectStudent={handleSelectStudent}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
            onUpdateStudent={handleUpdateStudent}
          />
        )}

        {activeTab === 'progreso' && selectedStudent && (
          <ProgresoView
            students={students}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
            onCreateNewProgram={handleCreateNewProgram}
            assignments={assignments}
          />
        )}

        {activeTab === 'ejercicios' && (
          <EjerciciosView
            exercises={exercises}
            onAddExerciseToRoutine={handleAddExerciseToRoutineFromCatalog}
            onAddCustomExercise={handleAddCustomExercise}
            onDeleteExercise={handleDeleteExercise}
          />
        )}

        {activeTab === 'creador' && (
          <CreadorView
            students={students}
            savedRoutines={savedRoutines}
            onSaveRoutine={handleSaveRoutine}
            onDeleteRoutine={handleDeleteRoutine}
            onAssignRoutine={handleAssignRoutine}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Add Exercise Modal */}
      {isAddModalOpen && (
        <AddExerciseModal
          exercises={exercises}
          onClose={() => setIsAddModalOpen(false)}
          onSelectExercise={(ex) => {
            handleAddExerciseToRoutineFromCatalog(ex);
            setIsAddModalOpen(false);
          }}
        />
      )}

      {/* Share Modal */}
      {isShareModalOpen && selectedStudent && (
        <ShareModal
          onClose={() => setIsShareModalOpen(false)}
          activeStudentName={selectedStudent.name}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
