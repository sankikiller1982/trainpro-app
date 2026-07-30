/**
 * Script para procesar el dataset de ejercicios y generar:
 * 1. Un JSON liviano con solo los campos necesarios
 * 2. Copiar imágenes y GIFs a public/exercises/
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_PATH = path.resolve('C:/Users/sanki/OneDrive/Documentos/PROGRAMANDO ANDO/GymRatPAW/exercises-dataset');
const OUTPUT_DIR = path.resolve(__dirname, '../public/exercises');
const OUTPUT_JSON = path.resolve(__dirname, '../src/data/datasetExercises.json');

// Mapeo de body_part (inglés) a categoría en español
const CATEGORY_MAP = {
  'back': 'Espalda',
  'cardio': 'Core',
  'chest': 'Pecho',
  'lower arms': 'Brazos',
  'lower legs': 'Piernas',
  'neck': 'Hombros',
  'shoulders': 'Hombros',
  'upper arms': 'Brazos',
  'upper legs': 'Piernas',
  'waist': 'Core',
};

function run() {
  console.log('📦 Leyendo exercises.json (16MB)...');
  const raw = fs.readFileSync(path.join(DATASET_PATH, 'data/exercises.json'), 'utf8');
  const exercises = JSON.parse(raw);
  console.log(`   Encontrados ${exercises.length} ejercicios.`);

  // Crear directorios de salida
  const imgOut = path.join(OUTPUT_DIR, 'images');
  const gifOut = path.join(OUTPUT_DIR, 'videos');
  fs.mkdirSync(imgOut, { recursive: true });
  fs.mkdirSync(gifOut, { recursive: true });

  const processed = [];
  let copiedImg = 0;
  let copiedGif = 0;

  for (const ex of exercises) {
    const category = CATEGORY_MAP[ex.body_part] || 'Core';

    // Extraer instrucciones en español
    let description = '';
    if (ex.instructions && ex.instructions.es) {
      description = ex.instructions.es;
    } else if (ex.instructions && ex.instructions.en) {
      description = ex.instructions.en;
    }

    // Nombre del archivo de imagen y GIF
    const imgFile = path.basename(ex.image); // ej: "0001-2gPfomN.jpg"
    const gifFile = path.basename(ex.gif_url); // ej: "0001-2gPfomN.gif"

    // Copiar imagen
    const imgSrc = path.join(DATASET_PATH, ex.image);
    const imgDst = path.join(imgOut, imgFile);
    if (fs.existsSync(imgSrc) && !fs.existsSync(imgDst)) {
      try {
        fs.copyFileSync(imgSrc, imgDst);
        copiedImg++;
      } catch (err) {
        console.warn(`Warning copying image ${imgSrc}: ${err.message}`);
      }
    }

    // Copiar GIF
    const gifSrc = path.join(DATASET_PATH, ex.gif_url);
    const gifDst = path.join(gifOut, gifFile);
    if (fs.existsSync(gifSrc) && !fs.existsSync(gifDst)) {
      try {
        fs.copyFileSync(gifSrc, gifDst);
        copiedGif++;
      } catch (err) {
        console.warn(`Warning copying gif ${gifSrc}: ${err.message}`);
      }
    }

    processed.push({
      id: `ds-${ex.id}`,
      name: ex.name.charAt(0).toUpperCase() + ex.name.slice(1),
      category: category,
      secondaryMuscles: (ex.secondary_muscles || []).join(', ') || ex.target,
      imageUrl: `/exercises/images/${imgFile}`,
      gifUrl: `/exercises/videos/${gifFile}`,
      description: description.substring(0, 300),
      defaultSets: 3,
      defaultReps: '10-12',
      equipment: ex.equipment || 'body weight',
      target: ex.target || '',
    });
  }

  console.log(`   Imágenes copiadas nuevas: ${copiedImg}`);
  console.log(`   GIFs copiados nuevos: ${copiedGif}`);

  // Escribir JSON procesado
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(processed, null, 0), 'utf8');
  const sizeMB = (fs.statSync(OUTPUT_JSON).size / 1024 / 1024).toFixed(2);
  console.log(`✅ JSON generado: ${OUTPUT_JSON} (${sizeMB} MB, ${processed.length} ejercicios)`);
  console.log('🎉 ¡Proceso completado!');
}

run();
