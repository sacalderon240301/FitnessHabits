// Catálogo unificado de ejercicios (casa / parque / gimnasio), curado a
// partir de dos guías de referencia (entrenamiento en casa y musculación de
// gimnasio). Reemplaza a los antiguos homeExercises.js/parkExercises.js —
// ahora el entorno ("dónde lo hice") es un dato del REGISTRO (exercise_logs),
// no del ejercicio: `defaultLocation` acá es solo el valor sugerido al
// registrar, el usuario puede cambiarlo.
//
// `tracking`: 'reps' (repeticiones por serie) | 'time' (segundos por serie).
// `trackWeight`: si además se anota peso por serie (aplica a ambos tracking).

export const muscleGroups = [
  { id: 'pecho', label: 'Pecho' },
  { id: 'espalda', label: 'Espalda' },
  { id: 'hombros', label: 'Hombros' },
  { id: 'biceps', label: 'Bíceps' },
  { id: 'triceps', label: 'Tríceps' },
  { id: 'core', label: 'Core / Abdomen' },
  { id: 'lumbar', label: 'Espalda baja' },
  { id: 'cadera', label: 'Cadera / Glúteos' },
  { id: 'piernas', label: 'Piernas' },
  { id: 'gemelos', label: 'Gemelos' },
  { id: 'cardio', label: 'Cardio / Full body' },
  { id: 'otro', label: 'Otro' },
]

export function muscleGroupLabel(id) {
  return muscleGroups.find((g) => g.id === id)?.label ?? 'Otro'
}

export const exerciseLocations = [
  { id: 'casa', label: 'Casa' },
  { id: 'parque', label: 'Parque' },
  { id: 'gimnasio', label: 'Gimnasio' },
]

export function locationLabel(id) {
  return exerciseLocations.find((l) => l.id === id)?.label ?? id
}

export const exerciseCatalog = [
  // ---------- PECHO ----------
  { id: 'press-banca-plano', name: 'Press de banca plano', muscleGroup: 'pecho', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Baja la barra controlada hasta rozar el pecho, sube sin bloquear los codos de golpe.' },
  { id: 'press-banca-inclinado', name: 'Press de banca inclinado', muscleGroup: 'pecho', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Banco a 45-60°, más énfasis en pectoral superior.' },
  { id: 'press-pecho-mancuernas', name: 'Press de pecho con mancuernas', muscleGroup: 'pecho', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Mayor recorrido que con barra.' },
  { id: 'aperturas-mancuerna', name: 'Aperturas con mancuerna', muscleGroup: 'pecho', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'No cambies el ángulo del codo durante el recorrido.' },
  { id: 'cruces-polea-alta', name: 'Cruces en polea alta', muscleGroup: 'pecho', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'A mayor inclinación de tronco, más específico para pectoral.' },
  { id: 'fondos-paralelas', name: 'Fondos en paralelas', muscleGroup: 'pecho', defaultLocation: 'parque', tracking: 'reps', trackWeight: true, pose: 'dips', tip: 'Mayor separación de codos = más pecho; codos pegados = más tríceps.' },
  { id: 'flexiones-pecho', name: 'Flexiones de pecho', muscleGroup: 'pecho', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Manos más anchas que los hombros, baja el pecho cerca del piso sin hundir la cadera.' },
  { id: 'flexiones-declinadas', name: 'Flexiones declinadas', muscleGroup: 'pecho', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, pose: 'declinepushup', tip: 'Pies elevados en una banca, cuerpo en línea recta sin que la cadera se hunda.' },

  // ---------- ESPALDA ----------
  { id: 'dominadas-agarre-abierto', name: 'Dominadas — agarre abierto', muscleGroup: 'espalda', defaultLocation: 'parque', tracking: 'reps', trackWeight: true, pose: 'pullup', tip: 'Manos más anchas que los hombros, sube hasta pasar la barbilla, controla la bajada.' },
  { id: 'dominadas-agarre-neutro', name: 'Dominadas — agarre neutro', muscleGroup: 'espalda', defaultLocation: 'parque', tracking: 'reps', trackWeight: true, pose: 'pullup', tip: 'Palmas enfrentadas — agarre más amigable para el hombro.' },
  { id: 'dominadas-agarre-supino', name: 'Dominadas — agarre supino', muscleGroup: 'espalda', defaultLocation: 'parque', tracking: 'reps', trackWeight: true, pose: 'pullup', tip: 'Palmas hacia ti, mete más bíceps al movimiento.' },
  { id: 'jalon-polea-alta', name: 'Jalón en polea alta', muscleGroup: 'espalda', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Buena alternativa mientras no puedas hacer dominadas completas.' },
  { id: 'remo-con-barra', name: 'Remo con barra', muscleGroup: 'espalda', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Cuida la posición lumbar durante todo el recorrido.' },
  { id: 'remo-mancuerna-cintura', name: 'Remo a la cintura con mancuerna', muscleGroup: 'espalda', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Énfasis en dorsal bajo, no gires el tronco al tirar.' },
  { id: 'remo-polea-baja', name: 'Remo en polea baja', muscleGroup: 'espalda', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Evita desplazar el tronco al tirar.' },
  { id: 'table-pull-up', name: 'Remo horizontal bajo mesa o barra baja', muscleGroup: 'espalda', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Cuerpo recto, tira el pecho hacia la barra o el borde de la mesa.' },

  // ---------- HOMBROS ----------
  { id: 'press-militar-barra', name: 'Press militar con barra', muscleGroup: 'hombros', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'No arquees la lumbar para ganar recorrido.' },
  { id: 'press-hombro-mancuernas', name: 'Press de hombro con mancuernas', muscleGroup: 'hombros', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'No bloquees los codos ni gires las muñecas con carga alta.' },
  { id: 'elevaciones-laterales', name: 'Elevaciones laterales', muscleGroup: 'hombros', defaultLocation: 'casa', tracking: 'reps', trackWeight: true, tip: 'Codos siempre más altos que las muñecas.' },
  { id: 'elevaciones-frontales', name: 'Elevaciones frontales', muscleGroup: 'hombros', defaultLocation: 'casa', tracking: 'reps', trackWeight: true, tip: 'Evita balancear el tronco para tomar impulso.' },
  { id: 'pajaro-vuelos-posteriores', name: 'Vuelos posteriores (pájaro)', muscleGroup: 'hombros', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Tronco flexionado hacia adelante, énfasis en deltoides posterior.' },
  { id: 'encogimientos-trapecio', name: 'Encogimientos de hombros', muscleGroup: 'hombros', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Sube los hombros hacia las orejas, sin rotarlos.' },
  { id: 'pino-caminata', name: 'Caminata en pino (walking handstand)', muscleGroup: 'hombros', defaultLocation: 'casa', tracking: 'time', trackWeight: false, tip: 'Ejercicio avanzado de hombro y core — apóyate en una pared si es necesario.' },

  // ---------- BÍCEPS ----------
  { id: 'curl-biceps-barra', name: 'Curl de bíceps con barra', muscleGroup: 'biceps', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'No separes los codos del cuerpo ni uses impulso lumbar.' },
  { id: 'curl-biceps-mancuerna', name: 'Curl de bíceps con mancuerna', muscleGroup: 'biceps', defaultLocation: 'casa', tracking: 'reps', trackWeight: true, tip: 'Alterna brazos o hazlo simultáneo, controla la bajada.' },
  { id: 'curl-concentrado', name: 'Curl concentrado', muscleGroup: 'biceps', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'El más específico para bíceps — apoya el codo en el muslo.' },
  { id: 'curl-martillo', name: 'Curl martillo (agarre neutro)', muscleGroup: 'biceps', defaultLocation: 'casa', tracking: 'reps', trackWeight: true, tip: 'Trabaja también el braquial y el antebrazo.' },
  { id: 'curl-banco-predicador', name: 'Curl en banco predicador (Scott)', muscleGroup: 'biceps', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Aísla bien el bíceps, cuida no hiperextender el codo.' },

  // ---------- TRÍCEPS ----------
  { id: 'press-frances', name: 'Extensión de tríceps con barra tumbado (press francés)', muscleGroup: 'triceps', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Mantén la distancia entre codos constante durante el recorrido.' },
  { id: 'extension-triceps-polea', name: 'Extensión de tríceps en polea alta', muscleGroup: 'triceps', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'No separes los codos del cuerpo.' },
  { id: 'patada-triceps', name: 'Patada de tríceps con mancuerna', muscleGroup: 'triceps', defaultLocation: 'casa', tracking: 'reps', trackWeight: true, tip: 'Brazo paralelo al piso, extiende solo el antebrazo.' },
  { id: 'fondos-banco', name: 'Fondos entre bancos o sillas', muscleGroup: 'triceps', defaultLocation: 'casa', tracking: 'reps', trackWeight: true, tip: 'Manos atrás en el borde, baja controlado sin hundir los hombros.' },
  { id: 'flexiones-diamante', name: 'Flexiones diamante', muscleGroup: 'triceps', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Manos juntas bajo el pecho, énfasis en tríceps.' },
  { id: 'triceps-pared', name: 'Tríceps en pared', muscleGroup: 'triceps', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Variante asistida, buena para empezar.' },

  // ---------- CORE / ABDOMEN ----------
  { id: 'plancha-frontal', name: 'Plancha frontal', muscleGroup: 'core', defaultLocation: 'casa', tracking: 'time', trackWeight: false, tip: 'Cuerpo en línea recta, no dejes caer la cadera.' },
  { id: 'plancha-lateral', name: 'Plancha lateral', muscleGroup: 'core', defaultLocation: 'casa', tracking: 'time', trackWeight: false, tip: 'Cadera arriba, alinea hombro-cadera-tobillo.' },
  { id: 'crunch-abdominal', name: 'Crunch abdominal', muscleGroup: 'core', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Zona lumbar pegada al piso, sube solo los omóplatos.' },
  { id: 'abdominales-colgado', name: 'Abdominales colgado de barra', muscleGroup: 'core', defaultLocation: 'parque', tracking: 'reps', trackWeight: false, pose: 'hangingabs', tip: 'Sube las rodillas hacia el pecho sin balancearte.' },
  { id: 'abdominal-bicicleta', name: 'Abdominal bicicleta', muscleGroup: 'core', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Codo hacia la rodilla contraria, alterna controlado.' },
  { id: 'rotacion-tronco-pica', name: 'Rotación de tronco con barra o pica', muscleGroup: 'core', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: false, tip: 'No reduce la cintura — trabaja los oblicuos.' },
  { id: 'hollow-body-hold', name: 'Hollow body hold', muscleGroup: 'core', defaultLocation: 'casa', tracking: 'time', trackWeight: false, tip: 'Zona lumbar pegada al piso, brazos y piernas extendidos.' },
  { id: 'abdominal-v', name: 'Abdominal en V (cortapluma)', muscleGroup: 'core', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Sube tronco y piernas a la vez formando una V.' },

  // ---------- ESPALDA BAJA / LUMBAR ----------
  { id: 'hiperextension-banco', name: 'Hiperextensión en banco lumbar', muscleGroup: 'lumbar', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Sube hasta alinear el tronco, sin lanzar el movimiento.' },
  { id: 'peso-muerto', name: 'Peso muerto con barra', muscleGroup: 'lumbar', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Barra pegada al cuerpo durante todo el recorrido.' },
  { id: 'peso-muerto-unipodal', name: 'Peso muerto unipodal', muscleGroup: 'lumbar', defaultLocation: 'casa', tracking: 'reps', trackWeight: true, tip: 'Equilibrio en una pierna, espalda recta.' },
  { id: 'buenos-dias', name: 'Buenos días con barra', muscleGroup: 'lumbar', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Solo con carga ligera y buena técnica de bisagra de cadera.' },
  { id: 'bird-dog', name: 'Bird-dog alternado', muscleGroup: 'lumbar', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Brazo y pierna opuestos, estabilidad de zona lumbar y core.' },
  { id: 'extension-dorsal-suelo', name: 'Extensión dorsal en el suelo (superman)', muscleGroup: 'lumbar', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Levanta pecho y piernas a la vez, sin forzar el cuello.' },

  // ---------- CADERA / GLÚTEOS ----------
  { id: 'hip-thrust', name: 'Hip thrust con carga', muscleGroup: 'cadera', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Barbilla metida, aprieta el glúteo arriba del todo.' },
  { id: 'puente-gluteo', name: 'Puente de glúteo', muscleGroup: 'cadera', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Aprieta glúteo arriba, baja controlado.' },
  { id: 'hip-thrust-unipodal', name: 'Hip thrust unipodal', muscleGroup: 'cadera', defaultLocation: 'casa', tracking: 'reps', trackWeight: true, tip: 'Una pierna a la vez, más exigente por lado.' },
  { id: 'abduccion-cadera-polea', name: 'Abducción de cadera en polea baja', muscleGroup: 'cadera', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Mueve lo menos posible el resto del cuerpo.' },
  { id: 'patada-gluteo-cuadrupedia', name: 'Patada de glúteo en cuadrupedia', muscleGroup: 'cadera', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Empuja el talón hacia el techo sin arquear la lumbar.' },

  // ---------- PIERNAS ----------
  { id: 'sentadilla-barra', name: 'Sentadilla con barra', muscleGroup: 'piernas', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'El más global de los ejercicios de pierna — la posición de los pies determina el énfasis.' },
  { id: 'sentadilla-goblet', name: 'Sentadilla goblet con mancuerna', muscleGroup: 'piernas', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Mancuerna pegada al pecho, buena para aprender la técnica.' },
  { id: 'prensa-piernas', name: 'Prensa de piernas', muscleGroup: 'piernas', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Menos presión en la columna que la sentadilla libre.' },
  { id: 'extension-cuadriceps', name: 'Extensión de cuádriceps en máquina', muscleGroup: 'piernas', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'No rotes el pie — evita el pinzamiento de menisco.' },
  { id: 'curl-femoral', name: 'Curl femoral en máquina', muscleGroup: 'piernas', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Saca ambas piernas a la vez al terminar la serie.' },
  { id: 'sentadilla-bulgara', name: 'Sentadilla búlgara', muscleGroup: 'piernas', defaultLocation: 'casa', tracking: 'reps', trackWeight: true, tip: 'Pie trasero elevado, baja controlado en una pierna.' },
  { id: 'sentadilla-profunda', name: 'Sentadilla profunda (peso corporal)', muscleGroup: 'piernas', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Pies al ancho de hombros, baja como si te sentaras en una silla, peso en los talones.' },
  { id: 'zancada-adelante', name: 'Zancada hacia adelante', muscleGroup: 'piernas', defaultLocation: 'casa', tracking: 'reps', trackWeight: true, tip: 'Un paso largo hacia adelante, rodilla trasera casi toca el piso.' },
  { id: 'subida-al-banco', name: 'Subida al banco o escalón', muscleGroup: 'piernas', defaultLocation: 'casa', tracking: 'reps', trackWeight: true, tip: 'Empuja con el talón del pie de arriba, no con el impulso de la pierna de abajo.' },

  // ---------- GEMELOS ----------
  { id: 'elevacion-talones-de-pie', name: 'Elevación de talones de pie', muscleGroup: 'gemelos', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'La posición de los talones determina la zona interna/externa que más trabaja.' },
  { id: 'elevacion-talones-sentado', name: 'Elevación de talones sentado', muscleGroup: 'gemelos', defaultLocation: 'gimnasio', tracking: 'reps', trackWeight: true, tip: 'Énfasis en el sóleo.' },
  { id: 'elevacion-talones-escalon', name: 'Elevación de talones en escalón', muscleGroup: 'gemelos', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Mayor recorrido que a nivel del piso.' },
  { id: 'elevacion-talones-unipodal', name: 'Elevación de talones unipodal', muscleGroup: 'gemelos', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Una pierna a la vez, más exigente por lado.' },

  // ---------- CARDIO / FULL BODY ----------
  { id: 'burpees', name: 'Burpees', muscleGroup: 'cardio', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Combina sentadilla, plancha y salto — mantén un ritmo constante.' },
  { id: 'jumping-jacks', name: 'Jumping jacks', muscleGroup: 'cardio', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Activación cardiovascular rápida, buena para calentar.' },
  { id: 'mountain-climbers', name: 'Mountain climbers', muscleGroup: 'cardio', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Rodillas al pecho alternando, mantén la cadera estable.' },
  { id: 'climb-doble', name: 'Climb doble', muscleGroup: 'cardio', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Variante de mountain climber con salto.' },
  { id: 'sentadilla-salto', name: 'Sentadilla con salto', muscleGroup: 'cardio', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Aterriza suave, flexionando las rodillas.' },
  { id: 'desplazamiento-lateral', name: 'Desplazamiento lateral en plancha o step', muscleGroup: 'cardio', defaultLocation: 'casa', tracking: 'reps', trackWeight: false, tip: 'Mantén el centro de gravedad bajo durante el desplazamiento.' },
  { id: 'colgarse-barra', name: 'Colgarse de la barra (dead hang)', muscleGroup: 'cardio', defaultLocation: 'parque', tracking: 'time', trackWeight: true, pose: 'deadhang', tip: 'Hombros activos, no completamente relajados — bueno para agarre y movilidad.' },
  { id: 'trote-en-el-lugar', name: 'Trote o skipping en el lugar', muscleGroup: 'cardio', defaultLocation: 'casa', tracking: 'time', trackWeight: false, tip: 'Rodillas altas, ritmo sostenido.' },
]

export function exerciseById(id, customExercises = []) {
  return exerciseCatalog.find((e) => e.id === id) ?? customExercises.find((e) => e.id === id) ?? null
}
