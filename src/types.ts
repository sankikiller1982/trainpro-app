export type MuscleCategory = 'Todos' | 'Pecho' | 'Espalda' | 'Piernas' | 'Hombros' | 'Brazos' | 'Core';

export interface Exercise {
  id: string;
  name: string;
  category: Exclude<MuscleCategory, 'Todos'>;
  secondaryMuscles: string;
  imageUrl: string;
  description?: string;
  defaultSets: number;
  defaultReps: string;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetMuscles: string;
  imageUrl: string;
  sets: number;
  reps: string;
  restTime?: string;
  notes?: string;
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
}

export type TabType = 'ejercicios' | 'creador' | 'alumnos' | 'progreso';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}
