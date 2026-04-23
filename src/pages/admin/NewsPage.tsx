import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Button } from '../../components/ui'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui'
import { Input, Select } from '../../components/ui'
import { RichTextEditor } from '../../components/ui/RichTextEditor'
import { getActiveNews, createNews, updateNews, deleteNews } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import type { News, NewsType } from '../../types/domain'

export function NewsPage() {
  const { tournamentId } = useTournamentId()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  const { data: newsList = [], isLoading, error: queryError } = useQuery({
    queryKey: ['news', tournamentId],
    queryFn: () => getActiveNews(tournamentId ?? undefined),
  })

  const createMutation = useMutation({
    mutationFn: createNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      setShowForm(false)
      setError(null)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<News> }) =>
      updateNews(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      setEditingNews(null)
      setError(null)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const filteredNews = newsList.filter((n: News) =>
    filterType === 'all' || n.type === filterType
  )

  const typeOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'info', label: 'Información' },
    { value: 'warning', label: 'Aviso' },
    { value: 'success', label: 'Éxito' },
    { value: 'urgent', label: 'Urgente' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Noticias y Avisos</h1>
          <p className="text-sm text-slate-600">
            Gestiona los avisos que appeared en la página principal
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          + Nueva Noticia
        </Button>
      </div>

      {/* Filtros y errores */}
      <div className="flex gap-4 flex-wrap">
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={typeOptions}
          className="w-48"
        />
        {(error || queryError) && (
          <div className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">
            Error: {error || queryError?.message}
          </div>
        )}
      </div>

      {/* Formulario */}
      {(showForm || editingNews) && (
        <NewsForm
          news={editingNews}
          tournamentId={tournamentId ?? null}
          onSave={async (data) => {
            if (editingNews) {
              await updateMutation.mutateAsync({ id: editingNews.id, data })
            } else {
              await createMutation.mutateAsync(data)
            }
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingNews(null)
          }}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Lista */}
      <Card>
        <CardHeader>
          <span className="font-bold text-slate-700">
            {filteredNews.length} avisos
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Cargando...</div>
          ) : filteredNews.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No hay noticias creadas
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Tipo</TableHeader>
                  <TableHeader>Título</TableHeader>
                  <TableHeader>Mensaje</TableHeader>
                  <TableHeader>Publicado</TableHeader>
                  <TableHeader>Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNews.map((item: News) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          item.type === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : item.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : item.type === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {typeOptions.find((t) => t.value === item.type)?.label || item.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.message}
                    </TableCell>
                    <TableCell>
                      {new Date(item.publishedAt).toLocaleDateString('es-AR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingNews(item)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function NewsForm({
  news,
  tournamentId,
  onSave,
  onCancel,
  isSaving,
}: {
  news: News | null
  tournamentId: string | null
  onSave: (data: Partial<News>) => Promise<void>
  onCancel: () => void
  isSaving: boolean
}) {
  const [title, setTitle] = useState(news?.title || '')
  const [message, setMessage] = useState(news?.message || '')
  const [type, setType] = useState<NewsType>(news?.type || 'info')
  const [link, setLink] = useState(news?.link || '')
  const [linkLabel, setLinkLabel] = useState(news?.linkLabel || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Solo enviar campos que existen en la DB
    const data: Record<string, unknown> = {
      title,
      message,
      type,
      active: true,
    }
    if (link) data.link = link
    if (linkLabel) data.link_label = linkLabel
    if (tournamentId) data.tournament_id = tournamentId
    
    await onSave(data as Partial<News>)
  }

  return (
    <Card>
      <CardHeader>
        <span className="font-bold text-slate-700">
          {news ? 'Editar Noticia' : 'Nueva Noticia'}
        </span>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Título *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ej: Próxima Fecha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mensaje *
            </label>
            <RichTextEditor
              value={message}
              onChange={setMessage}
              placeholder="Escribe el mensaje aquí..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tipo *
            </label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as NewsType)}
              options={[
                { value: 'info', label: 'Información' },
                { value: 'warning', label: 'Aviso' },
                { value: 'success', label: 'Éxito' },
                { value: 'urgent', label: 'Urgente' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Link (opcional)
              </label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/reglamento"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Texto del Link
              </label>
              <Input
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="Ver más"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : news ? 'Actualizar' : 'Crear'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}