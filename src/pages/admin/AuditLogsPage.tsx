import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Card, CardContent, CardHeader } from '../../components/ui'
import { Select, Input } from '../../components/ui'
import { getAuditLogs } from '../../services/database'

const tableOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'team', label: 'Equipos' },
  { value: 'player', label: 'Jugadores' },
  { value: 'match_day', label: 'Fechas' },
  { value: 'match', label: 'Partidos' },
  { value: 'goal', label: 'Goles' },
  { value: 'card', label: 'Tarjetas' },
  { value: 'sanction', label: 'Sanciones' },
  { value: 'document', label: 'Documentos' },
  { value: 'news', label: 'Noticias' },
  { value: 'tournament', label: 'Torneo' },
  { value: 'admin_user', label: 'Usuarios admin' },
]

const actionOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'create', label: 'Crear' },
  { value: 'update', label: 'Actualizar' },
  { value: 'delete', label: 'Eliminar' },
]

export function AuditLogsPage() {
  const [tableName, setTableName] = useState<string>('all')
  const [action, setAction] = useState<string>('all')
  const [search, setSearch] = useState<string>('')

  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['auditLogs', tableName],
    queryFn: () => getAuditLogs({ tableName: tableName === 'all' ? undefined : tableName, limit: 200 }),
  })

  const filteredLogs = useMemo(() => {
    const needle = search.trim().toLowerCase()

    return logs.filter((l) => {
      if (action !== 'all' && l.action !== action) return false
      if (!needle) return true

      const haystack = [
        l.table_name,
        l.record_id,
        l.action,
        l.description || '',
        l.admin_user_id || '',
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(needle)
    })
  }, [logs, action, search])

  return (
    <section className="space-y-6">
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div>
            <h2 className="text-2xl font-semibold">Auditoria</h2>
            <p className="mt-2 text-sm text-slate-300">
              Historial de cambios en el sistema (ultimos 200 registros).
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Select
              label="Tabla"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              options={tableOptions}
            />
            <Select
              label="Accion"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              options={actionOptions}
            />
            <Input
              label="Buscar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="tabla, descripcion, record_id..."
            />
          </div>

          {isLoading ? (
            <div className="py-8 text-sm text-slate-300">Cargando...</div>
          ) : error ? (
            <div className="py-8 text-sm text-red-300">Error al cargar auditoria.</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-8 text-sm text-slate-300">Sin registros.</div>
          ) : (
            <div className="overflow-auto rounded-2xl border border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5 text-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Tabla</th>
                    <th className="px-3 py-2 text-left">Accion</th>
                    <th className="px-3 py-2 text-left">Record</th>
                    <th className="px-3 py-2 text-left">Usuario</th>
                    <th className="px-3 py-2 text-left">Descripcion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((l) => (
                    <tr key={l.id} className="border-t border-white/10 text-slate-100">
                      <td className="px-3 py-2 whitespace-nowrap text-slate-300">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{l.table_name}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{l.action}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-300">{l.record_id}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-300">{l.admin_user_name || l.admin_user_id || '-'}</td>
                      <td className="px-3 py-2 min-w-[20rem]">{l.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
