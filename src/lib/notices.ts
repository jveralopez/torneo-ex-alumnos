// Avisos/noticias estáticos para el HomePage
// Editar según necesidad

export interface Notice {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'urgent'
  link?: string
  linkLabel?: string
  publishedAt: string
}

export const notices: Notice[] = [
  {
    id: '1',
    title: 'Próxima Fecha',
    message: 'Fecha 5 programada para este domingo. ¡No falten!',
    type: 'info',
    publishedAt: '2026-04-15',
  },
  {
    id: '2',
    title: 'Recordatorio',
    message: 'Los players deben presentar DNI antes del partido.',
    type: 'warning',
    publishedAt: '2026-04-14',
  },
]

// Ejemplo de aviso con link:
// {
//   id: '3',
//   title: 'Nuevo Reglamento',
//   message: 'Hay cambios importantes. Consultá el nuevo reglamento.',
//   type: 'info',
//   link: '/reglamento',
//   linkLabel: 'Ver Reglamento',
//   publishedAt: '2026-04-10',
// },