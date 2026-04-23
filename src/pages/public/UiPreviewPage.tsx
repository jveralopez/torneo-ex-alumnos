import { Card, CardContent, CardFooter, CardHeader, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, NoticeBadge, Input, Select } from '../../components/ui'

function StatusBadge({ tone, label }: { tone: 'scheduled' | 'played' | 'suspended'; label: string }) {
  const styles: Record<typeof tone, string> = {
    scheduled: 'bg-slate-100 text-slate-700 ring-slate-200',
    played: 'bg-green-100 text-green-800 ring-green-200',
    suspended: 'bg-red-100 text-red-800 ring-red-200',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[tone]}`}>
      {label}
    </span>
  )
}

function MatchCard({
  home,
  away,
  homeGoals,
  awayGoals,
  meta,
  status,
}: {
  home: string
  away: string
  homeGoals: number | null
  awayGoals: number | null
  meta: string
  status: 'Programado' | 'Jugado' | 'Suspendido'
}) {
  const score = typeof homeGoals === 'number' && typeof awayGoals === 'number'

  const tone = status === 'Jugado' ? 'played' : status === 'Suspendido' ? 'suspended' : 'scheduled'

  return (
    <div className="group rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/60">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Partido</p>
            <StatusBadge tone={tone} label={status} />
          </div>
          <p className="mt-2 text-sm text-slate-500">{meta}</p>
        </div>
        <div className="hidden shrink-0 sm:block">
          <div className="h-10 w-10 rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.25),_transparent_60%),linear-gradient(135deg,_rgba(15,118,110,0.2),_rgba(34,197,94,0.12))]" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-900">{home}</p>
        </div>

        <div className="rounded-2xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition-transform duration-200 group-hover:scale-[1.02]">
          {score ? `${homeGoals} - ${awayGoals}` : 'vs'}
        </div>

        <div className="min-w-0 text-right">
          <p className="truncate text-base font-semibold text-slate-900">{away}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button size="sm" className="active:scale-[0.98]">
          Ver planilla
        </Button>
        <Button variant="secondary" size="sm" className="active:scale-[0.98]">
          Cargar resultado
        </Button>
        <Button variant="ghost" size="sm" className="active:scale-[0.98]">
          Detalles
        </Button>
      </div>
    </div>
  )
}

export function UiPreviewPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Vista previa</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Maqueta visual (sin cambios funcionales)</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Esta pagina es solo para ver como quedaria el look & feel: tarjetas de partidos, tablas, badges, formularios,
          botones y transiciones.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <NoticeBadge type="info" />
          <NoticeBadge type="warning" />
          <NoticeBadge type="success" />
          <NoticeBadge type="urgent" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <MatchCard
          home="33 DE ORO"
          away="PERDRIEL 137"
          homeGoals={1}
          awayGoals={0}
          status="Jugado"
          meta="Fecha 2 · Cancha Central · 18:30"
        />
        <MatchCard
          home="SAN MARTIN"
          away="LOS PIBES"
          homeGoals={null}
          awayGoals={null}
          status="Programado"
          meta="Fecha 3 · Predio Norte · Sab 16:00"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Tabla de posiciones (estilo)</h2>
              <p className="mt-1 text-sm text-slate-600">Zebra rows, hover y numeros alineados.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="active:scale-[0.98]">Exportar</Button>
              <Button variant="secondary" size="sm" className="active:scale-[0.98]">Imprimir</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>#</TableHeader>
                <TableHeader>Equipo</TableHeader>
                <TableHeader className="text-right">PJ</TableHeader>
                <TableHeader className="text-right">GF</TableHeader>
                <TableHeader className="text-right">GC</TableHeader>
                <TableHeader className="text-right">DG</TableHeader>
                <TableHeader className="text-right">Pts</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4].map((pos) => (
                <TableRow key={pos}>
                  <TableCell className="font-semibold text-slate-900">{pos}</TableCell>
                  <TableCell className="font-semibold text-slate-900">Equipo {pos}</TableCell>
                  <TableCell className="text-right tabular-nums">{pos + 1}</TableCell>
                  <TableCell className="text-right tabular-nums">{pos * 3}</TableCell>
                  <TableCell className="text-right tabular-nums">{pos}</TableCell>
                  <TableCell className="text-right tabular-nums">{pos * 2}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-slate-900">{pos * 3}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-slate-600">Tip: encabezado sticky y chips de estado en filas de partidos.</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-slate-900">Formularios (estilo)</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Equipo" placeholder="Buscar..." />
            <Select
              label="Estado"
              value="jugado"
              onChange={() => {}}
              options={[
                { value: 'programado', label: 'Programado' },
                { value: 'jugado', label: 'Jugado' },
                { value: 'suspendido', label: 'Suspendido' },
              ]}
            />
            <Input label="Observaciones" placeholder="..." />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button className="active:scale-[0.98]">Guardar</Button>
            <Button variant="secondary" className="active:scale-[0.98]">Cancelar</Button>
            <Button variant="danger" className="active:scale-[0.98]">Eliminar</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
