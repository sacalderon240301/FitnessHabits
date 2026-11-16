// Categorías para los bloques del planificador de día. Cada una con un
// color para que la línea de tiempo se lea de un vistazo, igual que tu
// ejemplo de Google Sheets pero visual.

export const planCategories = [
  { id: 'descanso', label: 'Descanso', color: 'var(--ink-muted)' },
  { id: 'rutina', label: 'Rutina', color: 'var(--focus-teal)' },
  { id: 'ejercicio', label: 'Ejercicio', color: 'var(--thread-gold)' },
  { id: 'preparacion', label: 'Preparación', color: 'var(--plan-blue)' },
  { id: 'trabajo', label: 'Trabajo', color: 'var(--plan-brown)' },
  { id: 'comida', label: 'Comida', color: 'var(--plan-orange)' },
  { id: 'estudio', label: 'Estudio', color: 'var(--plan-purple)' },
  { id: 'proyecto', label: 'Proyecto personal', color: 'var(--plan-green)' },
  { id: 'ocio', label: 'Ocio', color: 'var(--plan-pink)' },
  { id: 'hogar', label: 'Hogar', color: 'var(--slip-rust)' },
  { id: 'personal', label: 'Personal', color: 'var(--plan-tan)' },
  { id: 'otro', label: 'Otro', color: 'var(--thread-dim)' },
]

export function categoryColor(categoryId) {
  return planCategories.find((c) => c.id === categoryId)?.color ?? 'var(--thread-dim)'
}

export function categoryLabel(categoryId) {
  return planCategories.find((c) => c.id === categoryId)?.label ?? 'Otro'
}
