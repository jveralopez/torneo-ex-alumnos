# Plan por sprints - Web Torneo Ex Alumnos

## Fuente
- Documento analizado: `funcional/requisitos.md`
- Fecha del analisis: 2026-04-15

## Conclusion ejecutiva
La especificacion define una plataforma web con dos frentes: sitio publico y panel administrador.
La recomendacion del documento es consistente y viable para una primera version de bajo costo:
- React + Vite + TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form + Zod
- Supabase para Auth, Postgres y Storage
- Cloudflare Pages para despliegue del frontend

## Decision de arquitectura para arrancar
Para acelerar salida a produccion y reducir complejidad operativa, conviene iniciar con una sola aplicacion frontend modular en lugar de un monorepo con `/apps/web-public` y `/apps/admin`.

### Arquitectura propuesta para la v1
```txt
/src
  /app
  /components
  /modules
    /auth
    /teams
    /players
    /fixtures
    /matches
    /results
    /standings
    /discipline
    /topscorers
    /documents
    /stats
  /pages
    /public
    /admin
  /services
  /lib
  /types
  /hooks
  /utils
```

### Por que esta decision
- reduce tiempo de setup y costo cognitivo
- simplifica deploy y variables de entorno
- facilita compartir componentes, tipos y servicios
- permite separar lo publico y lo privado por rutas, layouts y guards
- deja abierta una migracion futura a monorepo si el producto crece

## Lineamientos tecnicos que quedan fijados antes de construir
- Mobile-first desde el layout base
- Supabase como unica fuente de verdad
- RLS en tablas expuestas y politicas por rol
- Buckets separados para `team-shields`, `team-photos`, `player-photos` y `documents`
- Regla de negocio parametrizable para suspension por amarillas
- Tabla de posiciones, goleadores y estadisticas calculadas, no cargadas manualmente
- Publicacion progresiva del fixture mediante `visible_publicamente` y estado de publicacion
- Criterios de desempate preparados para extension

## Skills instaladas desde skills.sh
Se instalaron skills externas puntuales para apoyar la implementacion:
- `supabase/agent-skills@supabase`: guia operativa y de seguridad para Auth, RLS, Storage y uso de Supabase
- `supabase/agent-skills@supabase-postgres-best-practices`: buenas practicas de schema, indices, rendimiento y RLS
- `github/awesome-copilot@playwright-generate-test`: apoyo para generar y validar flujos E2E cuando la app ya este navegable

## Backlog estructurado por entregables
### Fundaciones
- bootstrap Vite + React + TypeScript + Tailwind
- routing publico/admin
- cliente Supabase
- variables de entorno
- layouts, navegacion y sistema UI base

### Datos y seguridad
- modelo de datos inicial
- migraciones base
- autenticacion admin
- roles `admin` y `carga_datos`
- RLS y politicas de storage

### Modulos admin
- ABM equipos
- ABM jugadores
- ABM fechas
- ABM partidos
- carga de resultados
- tarjetas, sanciones y documentos

### Modulos publicos
- home
- fixture
- resultados
- tabla
- goleadores
- sanciones
- jugadores al limite
- equipos
- detalle de equipo
- reglamento
- estadisticas

### Calidad y operacion
- seed inicial
- validaciones
- pruebas E2E minimas
- optimizacion responsive
- deploy
- README

## Plan por sprints
Se propone trabajar en 6 sprints de 1 semana efectiva cada uno. Si el equipo es muy chico, se pueden ejecutar como 6 bloques quincenales sin cambiar el orden.

## Sprint 1 - Base tecnica y arquitectura
### Objetivo
Dejar lista la plataforma base, la estructura modular y la integracion inicial con Supabase.

### Alcance
- crear proyecto con Vite + React + TypeScript + Tailwind
- configurar React Router y layouts publico/admin
- definir arquitectura por modulos
- configurar cliente Supabase y manejo de variables de entorno
- modelar tipos base del dominio
- definir design tokens, estilos base y componentes fundacionales
- preparar esquema inicial de base de datos

### Entregables
- proyecto ejecutando localmente
- estructura de carpetas definitiva para v1
- navegacion base publica y privada
- documento de decisiones tecnicas iniciales
- borrador de esquema SQL/ERD

### Criterio de cierre
- la app compila
- existen layouts y rutas base
- Supabase queda conectado en entorno local

## Sprint 2 - Auth admin, datos base y storage
### Objetivo
Cerrar la base de seguridad y persistencia para que todo lo demas se construya arriba sin rehacer cimientos.

### Alcance
- crear tablas iniciales: torneo, equipo, jugador, fecha, partido, gol, tarjeta, sancion, documento, usuario_admin
- definir enums y constraints de estados
- aplicar RLS y politicas iniciales
- implementar login admin con Supabase Auth
- proteger rutas privadas
- configurar buckets de storage y reglas de acceso
- crear semillas minimas para desarrollo

### Entregables
- esquema de DB operativo
- auth funcional para panel
- storage operativo para imagenes y PDFs
- perfiles/roles basicos listos

### Criterio de cierre
- un usuario admin puede iniciar sesion y acceder al panel
- las tablas y buckets estan listos para ABMs

## Sprint 3 - ABM de equipos y jugadores
### Objetivo
Habilitar la carga del universo base del torneo: equipos, escudos, fotos y planteles.

### Alcance
- ABM de equipos
- ABM de jugadores
- carga de escudo y foto de equipo
- carga de foto individual
- activacion/desactivacion logica
- validaciones con React Hook Form + Zod
- listados, filtros y formularios del panel

### Entregables
- panel de equipos operativo
- panel de jugadores operativo
- assets subidos a Supabase Storage

### Criterio de cierre
- la comision puede crear equipos y jugadores sin tocar codigo
- las imagenes se visualizan correctamente

## Sprint 4 - Fixture, partidos y publicacion progresiva
### Objetivo
Resolver el flujo mas sensible del torneo: carga completa del fixture con control fino de visibilidad publica.

### Alcance
- ABM de fechas
- ABM de partidos dentro de cada fecha
- horarios, canchas, observaciones y reprogramaciones
- flags `visible_publicamente` y `publicada`
- consultas publicas para mostrar solo fechas visibles
- pagina publica de fixture
- home con proxima fecha habilitada

### Entregables
- admin de fechas y partidos
- fixture publico navegable
- logica de publicacion progresiva terminada

### Criterio de cierre
- la comision puede cargar todo el fixture y publicar solo lo confirmado
- el sitio publico nunca expone fechas ocultas

## Sprint 5 - Resultados, tabla, goleadores y vistas publicas MVP
### Objetivo
Entregar el nucleo del MVP publico con informacion deportiva actualizada automaticamente.

### Alcance
- carga de resultados por partido
- carga de goles por jugador
- calculo automatico de tabla
- calculo de goleadores
- pantallas publicas de resultados, tabla y goleadores
- pantalla de equipos y detalle de equipo basico
- seccion de reglamento con PDF y/o HTML

### Entregables
- resultados visibles al publico
- tabla automatica
- goleadores
- equipos y detalle de equipo
- reglamento publicado

### Criterio de cierre
- el MVP publico ya ofrece valor real a participantes y comision
- los cambios de resultados recalculan las vistas derivadas

## Sprint 6 - Disciplina, estadisticas, QA y deploy
### Objetivo
Cerrar negocio, calidad y operacion para dejar una primera version desplegable y administrable.

### Alcance
- carga de amarillas y rojas
- gestion de sanciones
- calculo de jugadores al limite y suspendidos por acumulacion
- parametro configurable de amarillas para suspension
- estadisticas generales del torneo
- dashboard admin basico
- pruebas E2E sobre flujos criticos
- optimizacion responsive y performance
- deploy en Cloudflare Pages
- README operativo

### Entregables
- modulo disciplinario completo
- estadisticas generales
- despliegue operativo
- documentacion de entorno y despliegue

### Criterio de cierre
- panel y sitio publico quedan listos para uso real
- el proyecto puede desplegarse en infraestructura gratuita con instrucciones claras

## Dependencias y orden critico
- Sprint 2 bloquea todo lo que dependa de auth, DB y storage
- Sprint 3 debe cerrarse antes de resultados si se quiere estadistica por jugador
- Sprint 4 bloquea la home publica real y el fixture visible
- Sprint 5 depende de partidos y equipos correctamente modelados
- Sprint 6 depende de resultados y tarjetas para estadisticas completas

## Riesgos a controlar desde el dia 1
- sobrecomplicar la arquitectura con monorepo demasiado pronto
- dejar RLS y storage para el final
- mezclar calculos de negocio en componentes UI
- hardcodear reglas disciplinarias o criterios de desempate
- no definir semilla minima para probar flujos reales temprano
- no probar mobile-first desde los primeros layouts

## Fuera de MVP pero preparados
- noticias o destacados enriquecidos
- historico de torneos
- fichas avanzadas por jugador
- reportes administrativos
- criterio manual/mixto de desempate

## Definicion de listo antes de empezar a construir
Antes de abrir el Sprint 1 deberian quedar confirmados estos puntos:
- nombre oficial del torneo y branding base
- si el reglamento inicial se publicara como PDF, HTML o ambos
- si el criterio de puntaje sera 3/1/0 o la variante 3/2/1 mencionada en una seccion del documento
- quienes seran los primeros usuarios admin
- contenido semilla minimo para demo: 1 torneo, 4-8 equipos, 1-2 fechas, escudos, reglamento

## Recomendacion operativa final
La mejor estrategia es construir primero una v1 integrada, con fuerte foco en calidad de datos, admin simple y vistas publicas claras. El mayor riesgo no es tecnico sino funcional: hay una inconsistencia en el documento sobre el puntaje de empate/derrota, asi que ese punto debe definirse antes de implementar la logica definitiva de tabla.
