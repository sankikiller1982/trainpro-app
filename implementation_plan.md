# Rediseño del Creador de Rutinas + Dataset de Ejercicios

## Contexto y Problema
El creador actual funciona como un "borrador único global": solo hay una rutina en construcción y no se puede guardar, reutilizar ni asignar a alumnos. Esto lo hace inútil como herramienta real de un entrenador. Además, al crear ejercicios personalizados no se puede elegir imagen/GIF, y el catálogo tiene solo 41 ejercicios hardcodeados.

## Cambios Principales

### 1. Sistema de Rutinas Guardadas (Plantillas)
**Concepto:** Una rutina pasa de ser un "borrador efímero" a ser un **documento con nombre que se guarda en la nube** (Google Sheets) y se puede reutilizar, editar y asignar.

**Flujo del usuario:**
1. Entra al Creador → Ve la lista de sus rutinas guardadas (cards: "Lunes Empuje", "Martes Pierna", etc.)
2. Puede crear una nueva rutina ("+ Nueva Rutina") o editar una existente
3. Al editar, agrega/quita ejercicios, ajusta series/reps/descanso/notas
4. Al terminar le da a **"Guardar Rutina"** → Se persiste en Google Sheets con su nombre
5. Desde la lista puede **Asignar** una rutina a un alumno

### 2. Asignación de Rutinas a Alumnos
- Desde el Creador: botón "Asignar a Alumno" que abre un selector
- Desde ProgresoView (perfil de alumno): se muestra una nueva sección **"Rutinas Asignadas"** donde el entrenador ve las rutinas que le envió a ese alumno
- La relación rutina↔alumno se guarda como un nuevo tipo `assignment` en Google Sheets

### 3. Catálogo Masivo con el Dataset (1,324 ejercicios con GIFs)
**Recurso disponible:** `exercises-dataset` con 1,324 ejercicios, cada uno con:
- Nombre, categoría, `body_part`, `equipment`, `target`, `muscle_group`, `secondary_muscles`
- Instrucciones en español (`instructions.es`, `instruction_steps.es`)
- Imagen thumbnail (180×180 .jpg) en `/images/`
- GIF animado (180×180 .gif) en `/videos/`

**Estrategia:** Como el JSON pesa 16MB (demasiado para cargar de golpe en la app), crearemos un **script de build** que:
1. Lee `exercises.json` y extrae solo los campos relevantes (nombre, categoría, target, músculos, image path, gif path)
2. Genera un archivo JSON liviano (~200KB) con la data esencial
3. Copia las imágenes y GIFs al directorio `public/exercises/` del proyecto para que se sirvan con la app

> [!IMPORTANT]  
> Los archivos de imagen/GIF del dataset pesan ~100MB en total. Para Netlify esto es factible (free tier soporta hasta 500MB de site size), pero el deploy será más lento. Si prefieres reducir el número de ejercicios importados (ej. los primeros 300), avisame.

### 4. Edición de Imagen/GIF en Ejercicios Personalizados
- Al crear un ejercicio personalizado, se agregará un campo de **URL de imagen** que el usuario puede modificar
- Además se mostrará un selector con las imágenes del dataset disponibles como opción rápida

---

## Propuesta de Cambios por Archivo

### Tipos y Datos

#### [MODIFY] [types.ts](file:///c:/Users/sanki/Downloads/trainpro/src/types.ts)
- Nueva interfaz `SavedRoutine`: `{ id, name, description, exercises: RoutineExercise[], createdAt, updatedAt }`
- Nueva interfaz `RoutineAssignment`: `{ id, routineId, routineName, studentId, assignedAt }`
- Agregar `assignedRoutineIds?: string[]` a `Student`
- Agregar `gifUrl?: string` a `Exercise`

#### [NEW] [datasetExercises.ts](file:///c:/Users/sanki/Downloads/trainpro/src/data/datasetExercises.ts)
- JSON procesado del dataset con ~1300 ejercicios en formato liviano
- Cada uno con paths a `images/` y `videos/` copiados a `public/exercises/`

#### [NEW] [scripts/processDataset.ts](file:///c:/Users/sanki/Downloads/trainpro/scripts/processDataset.ts)
- Script Node.js para leer el JSON de 16MB, extraer campos esenciales, y copiar assets a `public/exercises/`

---

### Componentes

#### [MODIFY] [App.tsx](file:///c:/Users/sanki/Downloads/trainpro/src/App.tsx)
- Nuevo estado `savedRoutines: SavedRoutine[]` y `routineAssignments: RoutineAssignment[]`
- Handlers para crear/editar/eliminar/asignar rutinas
- Cargar rutinas guardadas desde Google Sheets al inicio
- Pasar nuevas props a CreadorView y ProgresoView

#### [MODIFY] [CreadorView.tsx](file:///c:/Users/sanki/Downloads/trainpro/src/components/CreadorView.tsx)
- **Vista dual:** Lista de rutinas guardadas (modo "biblioteca") + Editor de rutina (modo "edición")
- Botón "Guardar Rutina" que persiste en Google Sheets
- Botón "Asignar a Alumno" con modal selector
- Mantener drag & drop, notas, descanso y todo lo existente

#### [MODIFY] [EjerciciosView.tsx](file:///c:/Users/sanki/Downloads/trainpro/src/components/EjerciciosView.tsx)
- Usar el dataset expandido como fuente
- Mostrar GIF animado al hacer hover o en el modal de detalle
- En el modal de "Crear Ejercicio", agregar campo editable de URL de imagen/GIF

#### [MODIFY] [ProgresoView.tsx](file:///c:/Users/sanki/Downloads/trainpro/src/components/ProgresoView.tsx)
- Nueva sección "Rutinas Asignadas" en el perfil del alumno
- Mostrar cards con las rutinas enviadas a ese alumno, incluyendo sus ejercicios

#### [MODIFY] [googleSheets.ts](file:///c:/Users/sanki/Downloads/trainpro/src/api/googleSheets.ts)
- Soporte para nuevos tipos: `saved_routine`, `assignment`

---

## Verificación
1. Ejecutar el script de procesamiento del dataset
2. `npm run build` debe compilar sin errores
3. Probar: crear rutina, guardar, asignar a alumno, verificar en ProgresoView
4. Verificar que los ejercicios del dataset muestran imágenes/GIFs correctamente
5. Verificar persistencia en Google Sheets
6. Subir cambios a GitHub → desplegar en Netlify

---

## Open Questions

> [!IMPORTANT]
> **Cantidad de ejercicios del dataset:** ¿Importamos los 1,324 ejercicios completos (las imágenes + GIFs pesan ~100MB) o preferís un subconjunto más liviano (ej. 200-300 ejercicios más populares)?

> [!NOTE]
> **GIFs del dataset:** Los GIFs del dataset son de 180×180px (pequeños). Se verán bien en las tarjetas pero no en pantalla completa. ¿Está bien así o preferís que solo usemos las imágenes estáticas .jpg?
