import { Exercise } from '../types';
import { INITIAL_EXERCISES } from './mockData';
import rawDataset from './datasetExercises.json';

// Exporta la combinación de ejercicios iniciales + dataset completo
export const ALL_DATASET_EXERCISES: Exercise[] = (rawDataset as Exercise[]);

export function getInitialExercisesCombined(): Exercise[] {
  // Evitar duplicados por nombre si ya existen en INITIAL_EXERCISES
  const initialNames = new Set(INITIAL_EXERCISES.map((e) => e.name.toLowerCase()));
  const filteredDataset = ALL_DATASET_EXERCISES.filter(
    (e) => !initialNames.has(e.name.toLowerCase())
  );
  return [...INITIAL_EXERCISES, ...filteredDataset];
}
