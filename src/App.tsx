import { useState, useEffect, useCallback, useRef } from 'react';
import { AddExerciseModal } from './components/AddExerciseModal';
import { AlumnosView } from './components/AlumnosView';
import { BottomNav } from './components/BottomNav';
import { CreadorView } from './components/CreadorView';
import { EjerciciosView } from './components/EjerciciosView';
import { Header } from './components/Header';
import { ProgresoView } from './components/ProgresoView';
import { ShareModal } from './components/ShareModal';
import { ToastProvider, useToast } from './components/ToastContext';
import { INITIAL_EXERCISES, INITIAL_STUDENTS } from './data/mockData';
import { Exercise, RoutineExercise, Student, TabType } from './types';
import { sheetsApi } from './api/googleSheets';

// Hook para guardar automáticamente tras dejar de escribir
function useDebouncedEffect(effect: () => void, deps: any[], delay: number) {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}

function AppContent() {
  const { addToast } = useToast();
  
  // Estado de carga inicial
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<TabType>('alumnos');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [routineTitle, setRoutineTitle] = useState('Lunes: Día de Empuje');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Carga inicial de datos desde Google Sheets
  useEffect(() => {
    async function loadData() {
      try {
        const db = await sheetsApi.fetchAll();
        
        const loadedStudents = db.filter((r: any) => r.type === 'student').map((r: any) => r.data as Student);
        const loadedExercises = db.filter((r: any) => r.type === 'exercise').map((r: any) => r.data as Exercise);
        
        // Busca si hay una rutina guardada
        const globalRoutineRecord = db.find((r: any) => r.type === 'routine' && r.id === 'global_routine')?.data;
        const routineTitleRecord = db.find((r: any) => r.type === 'routine_title' && r.id === 'global_title')?.data;

        // Si la base de datos está vacía, usamos los datos iniciales
        if (loadedStudents.length > 0) {
          setStudents(loadedStudents);
          setSelectedStudent(loadedStudents[0]);
        } else {
          setStudents(INITIAL_STUDENTS);
          setSelectedStudent(INITIAL_STUDENTS[3]); // Alex Chen
        }

        if (loadedExercises.length > 0) {
          setExercises(loadedExercises);
        } else {
          setExercises(INITIAL_EXERCISES);
        }

        if (globalRoutineRecord) setRoutineExercises(globalRoutineRecord);
        if (routineTitleRecord) setRoutineTitle(routineTitleRecord.title);

      } catch(err) {
        console.error("Error al cargar la app:", err);
        addToast('Error de conexión. Trabajando offline.', 'error');
        // Fallback a inicial
        setStudents(INITIAL_STUDENTS);
        setSelectedStudent(INITIAL_STUDENTS[3]);
        setExercises(INITIAL_EXERCISES);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [addToast]);

  // Guardado automático de la Rutina (con Debounce para no saturar Google Sheets)
  const isFirstRender = useRef(true);
  useDebouncedEffect(() => {
    if (isLoading) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    sheetsApi.saveRecord('global_routine', 'routine', routineExercises).catch(console.error);
    sheetsApi.saveRecord('global_title', 'routine_title', { title: routineTitle }).catch(console.error);
  }, [routineExercises, routineTitle], 1500);

  // ----------------------------------------------------
  // Handlers
  // ----------------------------------------------------

  const handleSelectStudent = useCallback((student: Student) => {
    setSelectedStudent(student);
    setActiveTab('progreso');
  }, []);

  const handleCreateNewProgram = useCallback((student: Student) => {
    setSelectedStudent(student);
    setRoutineTitle(`Nuevo Plan - ${student.name}`);
    setActiveTab('creador');
  }, []);

  const handleAddExerciseToRoutine = useCallback((exercise: Exercise) => {
    const newRoutineEx: RoutineExercise = {
      id: `re-${Date.now()}-${Math.random()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      targetMuscles: exercise.secondaryMuscles,
      imageUrl: exercise.imageUrl,
      sets: exercise.defaultSets || 3,
      reps: exercise.defaultReps || '10',
      restTime: '60 seg',
      notes: '',
    };
    setRoutineExercises((prev) => [...prev, newRoutineEx]);
    addToast(`"${exercise.name}" añadido a la rutina`, 'success');
  }, [addToast]);

  const handleUpdateExercise = useCallback((id: string, updates: Partial<RoutineExercise>) => {
    setRoutineExercises((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const handleRemoveExercise = useCallback((id: string) => {
    setRoutineExercises((prev) => prev.filter((item) => item.id !== id));
    addToast('Ejercicio eliminado de la rutina', 'info');
  }, [addToast]);

  const handleReorderExercises = useCallback((reordered: RoutineExercise[]) => {
    setRoutineExercises(reordered);
  }, []);

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
    
    // Guardar en Google Sheets individualmente
    sheetsApi.saveRecord(newStudent.id, 'student', newStudent).catch(console.error);
  }, [addToast]);

  const handleAddCustomExercise = useCallback((exercise: Exercise) => {
    setExercises((prev) => [exercise, ...prev]);
    addToast(`Ejercicio "${exercise.name}" subido a la nube`, 'success');
    
    // Guardar en Google Sheets individualmente
    sheetsApi.saveRecord(exercise.id, 'exercise', exercise).catch(console.error);
  }, [addToast]);

  // Pantalla de Carga Inicial
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#051424] text-[#d4e4fa]">
        <div className="w-16 h-16 border-4 border-[#454932] border-t-[#d2f000] rounded-full animate-spin mb-6"></div>
        <h1 className="font-headline text-2xl font-extrabold text-white tracking-tighter mb-2">TRAINPRO</h1>
        <p className="text-[#c6c9ab] text-sm animate-pulse">Sincronizando con Google Sheets...</p>
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
          />
        )}

        {activeTab === 'progreso' && selectedStudent && (
          <ProgresoView
            students={students}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
            onCreateNewProgram={handleCreateNewProgram}
          />
        )}

        {activeTab === 'ejercicios' && (
          <EjerciciosView
            exercises={exercises}
            onAddExerciseToRoutine={handleAddExerciseToRoutine}
            onAddCustomExercise={handleAddCustomExercise}
          />
        )}

        {activeTab === 'creador' && selectedStudent && (
          <CreadorView
            students={students}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
            routineExercises={routineExercises}
            onUpdateExercise={handleUpdateExercise}
            onRemoveExercise={handleRemoveExercise}
            onReorderExercises={handleReorderExercises}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            routineTitle={routineTitle}
            setRoutineTitle={setRoutineTitle}
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
            handleAddExerciseToRoutine(ex);
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
