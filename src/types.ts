export type MuscleCategory = 'Todos' | 'Pecho' | 'Espalda' | 'Piernas' | 'Hombros' | 'Brazos' | 'Core';

export interface Exercise {
  id: string;
  name: string;
  category: Exclude<MuscleCategory, 'Todos'>;
  secondaryMuscles: string;
  imageUrl: string;
  gifUrl?: string;
  description?: string;
  defaultSets: number;
  defaultReps: string;
  equipment?: string;
  target?: string;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetMuscles: string;
  imageUrl: string;
  gifUrl?: string;
  sets: number;
  reps: string;
  weight?: number;
  restTime?: string;
  notes?: string;
}

export interface SavedRoutine {
  id: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface RoutineAssignment {
  id: string;
  routineId: string;
  routineName: string;
  studentId: string;
  studentName: string;
  assignedAt: string;
  exercises: RoutineExercise[];
}

export interface ProgramHistoryItem {
  id: string;
  status: 'ACTUAL' | 'COMPLETADO';
  dates: string;
  title: string;
  description: string;
  tags: string[];
}

export interface Student {
  id: string;
  name: string;
  avatarUrl: string;
  lastActivity: string;
  currentProgram: string;
  nextSession?: string;
  status?: 'En Marcha' | 'Revisar' | 'Inactivo';
  actionNeeded?: string;
  level: string;
  totalSessions: number;
  sessionsThisMonth: number;
  totalVolumeKg: string;
  bodyWeightKg: number;
  bodyWeightChange: string;
  currentStreakWeeks: number;
  oneRepMax: {
    [key in 'Sentadilla' | 'Press de Banca' | 'Peso Muerto' | 'OHP']: number[];
  };
  programHistory: ProgramHistoryItem[];
  assignedRoutines?: RoutineAssignment[];
}

export type TabType = 'ejercicios' | 'creador' | 'alumnos' | 'progreso';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}
