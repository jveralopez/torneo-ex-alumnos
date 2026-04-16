import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui'
import { getRegulation } from '../../services/database'
import { useTournamentId } from '../../hooks/useTournament'

export function RegulationPage() {
  const { tournamentId } = useTournamentId()
  
  const { data: regulation, isLoading } = useQuery({
    queryKey: ['regulation', tournamentId],
    queryFn: () => getRegulation(tournamentId!),
    enabled: !!tournamentId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
      </div>
    )
  }

  if (!regulation) {
    return (
      <section className="rounded-[2rem] border border-green-200 bg-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-green-800">Reglamento</h1>
        <p className="mt-3 text-sm leading-7 text-green-600">
          El reglamento del torneo no está disponible actualmente.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-green-200 bg-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-green-800">Reglamento</h1>
        <p className="mt-1 text-sm text-green-600 font-medium">
          {regulation.title}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          {regulation.fileUrl ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-green-600">
                Descarga el documento completo del reglamento:
              </p>
              <a
                href={regulation.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar PDF
              </a>
            </div>
          ) : regulation.content ? (
            <div className="prose prose-green max-w-none" dangerouslySetInnerHTML={{ __html: regulation.content }} />
          ) : (
            <div className="prose prose-green max-w-none">
              <p className="text-green-600">Contenido del reglamento no disponible.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
