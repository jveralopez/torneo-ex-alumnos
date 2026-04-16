import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '../../components/ui'
import { Button } from '../../components/ui'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui'
import { Input, Select } from '../../components/ui'
import { getActiveDocuments, createDocument, updateDocument, deleteDocument } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'
import { uploadDocument, validateDocumentFile } from '../../lib/storage'
import type { Document, DocumentType } from '../../types/domain'

export function DocumentsPage() {
  const { tournamentId } = useTournamentId()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['documents', tournamentId],
    queryFn: () => getActiveDocuments(tournamentId!),
    enabled: !!tournamentId,
  })

  const createMutation = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Document> }) => 
      updateDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setEditingDoc(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })

  const filteredDocs = documents.filter((d: Document) => 
    filterType === 'all' || d.type === filterType
  )

  const typeOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'reglamento', label: 'Reglamento' },
    { value: 'acta', label: 'Acta' },
    { value: 'convocatoria', label: 'Convocatoria' },
    { value: 'otro', label: 'Otro' },
  ]

  const getTypeLabel = (type: DocumentType) => {
    const labels: Record<DocumentType, string> = {
      reglamento: 'Reglamento',
      acta: 'Acta',
      convocatoria: 'Convocatoria',
      otro: 'Otro',
    }
    return labels[type] || type
  }

  if (docsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
      </div>
    )
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Documentos</h1>
          <p className="mt-1 text-sm text-slate-400">Gestiona los documentos del torneo</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          Nuevo Documento
        </Button>
      </div>

      {showForm && (
        <DocumentForm
          tournamentId={tournamentId!}
          editingDocument={editingDoc}
          onClose={() => {
            setShowForm(false)
            setEditingDoc(null)
          }}
          onSubmit={async (data) => {
            if (editingDoc) {
              updateMutation.mutate({ id: editingDoc.id, data })
            } else {
              createMutation.mutate(data as Parameters<typeof createDocument>[0])
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      <Card className="mb-6">
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium">Filtros</span>
        </CardHeader>
        <CardContent>
          <Select
            label="Tipo"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={typeOptions}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <span className="font-medium">Documentos ({filteredDocs.length})</span>
        </CardHeader>
        <CardContent className="p-0">
          {filteredDocs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No hay documentos registrados.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Tipo</TableHeader>
                  <TableHeader>Título</TableHeader>
                  <TableHeader>Archivo</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader className="text-right">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocs.map((doc: Document) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800">
                        {getTypeLabel(doc.type)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:underline"
                        >
                          Ver archivo
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        doc.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {doc.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            updateMutation.mutate({
                              id: doc.id,
                              data: { active: !doc.active },
                            })
                          }}
                        >
                          {doc.active ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingDoc(doc)
                            setShowForm(true)
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(doc.id)}
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
    </section>
  )
}

function DocumentForm({
  tournamentId,
  editingDocument,
  onClose,
  onSubmit,
  isLoading,
}: {
  tournamentId: string
  editingDocument: Document | null
  onClose: () => void
  onSubmit: (data: Partial<Document> & { fileUrl?: string }) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    type: editingDocument?.type || 'otro',
    title: editingDocument?.title || '',
    active: editingDocument?.active ?? true,
  })
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('El título es requerido')
      return
    }

    if (!editingDocument && !file) {
      setError('Debes seleccionar un archivo')
      return
    }

    setError('')
    setUploading(true)

    try {
      let fileUrl = editingDocument?.fileUrl || ''

      if (file) {
        // Validate file
        validateDocumentFile(file)
        
        // Upload file
        const result = await uploadDocument(tournamentId, file, formData.type)
        fileUrl = result.url
      }

      onSubmit({
        tournamentId,
        type: formData.type as DocumentType,
        title: formData.title.trim(),
        fileUrl,
        active: formData.active,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivo')
    } finally {
      setUploading(false)
    }
  }

  const typeOptions = [
    { value: 'reglamento', label: 'Reglamento' },
    { value: 'acta', label: 'Acta' },
    { value: 'convocatoria', label: 'Convocatoria' },
    { value: 'otro', label: 'Otro' },
  ]

  return (
    <Card className="mb-6">
      <CardHeader>
        <span className="font-medium">{editingDocument ? 'Editar Documento' : 'Nuevo Documento'}</span>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Tipo"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as DocumentType })}
              options={typeOptions}
            />
            <Input
              label="Título"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título del documento"
              required
            />
          </div>

          <div>
            <label htmlFor="document-file" className="block text-sm font-medium text-slate-700">
              Archivo {editingDocument ? '(opcional)' : '*'}
            </label>
            <input
              id="document-file"
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setFile(f)
              }}
              className="mt-1 block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-sky-50 file:text-sky-700
                hover:file:bg-sky-100"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {file && (
              <p className="mt-1 text-xs text-slate-500">Seleccionado: {file.name}</p>
            )}
            {editingDocument && !file && editingDocument.fileUrl && (
              <p className="mt-1 text-xs text-slate-500">
                Archivo actual: <a href={editingDocument.fileUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">ver</a>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="active" className="text-sm text-slate-700">
              Documento activo
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading || uploading}>
              {editingDocument ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
