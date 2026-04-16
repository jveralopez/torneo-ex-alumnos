# Requerimiento funcional y técnico

## Web del Torneo de Ex Alumnos

### Objetivo

Construir una plataforma web para el torneo de ex alumnos del colegio, orientada a la publicación y administración de información deportiva del campeonato.

La solución debe permitir mostrar de forma pública la información del torneo y, a su vez, brindar un panel de administración para la comisión organizadora.

El proyecto debe pensarse con criterio de bajo costo o costo cero en infraestructura, contemplando despliegue gratuito, escalabilidad gradual y una primera versión simple de mantener.

---

# 1. Objetivo general del sistema

Desarrollar un sitio web del torneo que permita:

* Publicar fixture y próximas fechas.
* Mostrar resultados.
* Calcular y exponer tabla de posiciones.
* Administrar sancionados y jugadores al límite de sanción por amarillas.
* Gestionar estadísticas del torneo.
* Publicar reglamento.
* Administrar equipos, escudos, jugadores y fotos.
* Controlar qué fechas del fixture son visibles al público.

La plataforma deberá contemplar dos grandes frentes:

1. **Sitio público** para consulta de información.
2. **Panel administrador** para carga y mantenimiento de datos por parte de la comisión.

---

# 2. Alcance funcional

## 2.1. Módulo público

El sitio público deberá contar, como mínimo, con las siguientes secciones:

### Inicio

Debe funcionar como portada del torneo y mostrar información destacada.

Contenido sugerido:

* próxima fecha habilitada
* últimos resultados cargados
* acceso rápido a tabla, sanciones, goleadores y reglamento
* banner o imagen institucional del torneo
* noticias o destacados de la fecha (opcional en primera etapa)

### Fixture

Debe permitir visualizar el cronograma del torneo.

Requerimientos:

* visualizar fechas del torneo
* cada fecha podrá estar visible u oculta
* la comisión podrá definir qué fecha está publicada
* podrá mostrarse solo la próxima fecha confirmada o, si se desea, más de una fecha visible
* cada partido deberá mostrar:

  * local
  * visitante
  * día
  * horario
  * estado del partido

Estados posibles del partido:

* programado
* reprogramado
* jugado
* suspendido

### Resultados

Debe mostrar los resultados ya disputados.

Información mínima por partido:

* fecha del torneo
* equipo local
* equipo visitante
* goles local
* goles visitante
* estado final
* observaciones opcionales

### Tabla de posiciones

Debe calcularse automáticamente en base a los resultados cargados.

Columnas mínimas:

* posición
* equipo
* PJ
* PG
* PE
* PP
* GF
* GC
* DG
* PTS

Opcionales:

* partidos suspendidos
* rendimiento últimos 5 partidos

### Sanciones

Debe permitir consultar jugadores sancionados.

Datos mínimos:

* jugador
* equipo
* motivo
* cantidad total de fechas de sanción
* fechas cumplidas
* fechas pendientes
* estado de sanción vigente o cumplida

### Amonestados / Al límite

Debe existir una pantalla o bloque específico para mostrar jugadores en riesgo de sanción por acumulación de amarillas.

Requerimientos:

* mostrar cantidad de amarillas acumuladas por jugador
* identificar jugadores que llegarían al límite en la próxima fecha
* destacar visualmente a los jugadores “al borde de suspensión”

Ejemplo de estados:

* normal
* en observación
* al límite
* suspendido por acumulación

### Goleadores

Debe publicarse una tabla de goleadores.

Datos mínimos:

* jugador
* equipo
* cantidad de goles

### Equipos

Debe existir una pantalla general de equipos.

Debe mostrar:

* nombre del equipo
* escudo
* foto del plantel o foto institucional
* breve descripción opcional

### Detalle de equipo

Cada equipo debe tener una página propia.

Información a mostrar:

* escudo
* foto principal del equipo
* listado de jugadores
* foto individual de jugadores si se dispone
* estadísticas del equipo
* posición actual
* goles a favor / en contra
* sancionados vigentes
* historial de resultados del equipo

### Reglamento

Debe existir una sección para publicar el reglamento del torneo.

Opciones válidas:

* mostrar reglamento en HTML dentro del sitio
* permitir descarga de PDF
* hacer ambas cosas

### Estadísticas generales

Debe existir una sección de estadísticas del torneo.

Ejemplos:

* equipo más goleador
* equipo menos vencido
* valla menos vencida
* jugador con más goles
* equipo con más amonestados
* equipo con más expulsados
* cantidad total de goles del torneo
* promedio de gol por fecha

---

## 2.2. Panel administrador

Debe existir un panel privado para la comisión.

Objetivo:
permitir la carga y administración de toda la información del torneo sin editar código manualmente.

### Acceso

* acceso con usuario y contraseña
* roles mínimos sugeridos:

  * administrador
  * carga de datos

### Gestión de equipos

Debe permitir:

* alta de equipo
* modificación de equipo
* baja lógica si fuera necesaria
* carga de escudo
* carga de foto de equipo
* administración del plantel

### Gestión de jugadores

Debe permitir:

* alta de jugador
* modificación de jugador
* asociación a equipo
* carga de foto individual
* estado activo/inactivo

### Gestión de fixture

Debe permitir:

* alta de fechas
* alta de partidos dentro de cada fecha
* modificación de horarios
* modificación de canchas
* reprogramación de partidos
* definir visibilidad pública de cada fecha
* opción para publicar solo fechas confirmadas

Regla importante:
la comisión podrá cargar todo el fixture por adelantado, pero definir mediante un flag qué fechas son visibles al público.

Ejemplo de campo:

* `visiblePublicamente: true/false`

### Gestión de resultados

Debe permitir:

* carga del resultado de cada partido
* definir si el partido fue jugado, suspendido o reprogramado
* actualizar automáticamente estadísticas derivadas

### Gestión disciplinaria

Debe permitir:

* registrar amarillas por jugador
* registrar rojas por jugador
* generar sanciones manuales
* marcar cumplimiento de fechas de suspensión
* visualizar jugadores al límite por acumulación de amarillas

### Gestión de reglamento

Debe permitir:

* subir archivo PDF
* reemplazar reglamento vigente
* opcionalmente editar contenido enriquecido desde panel

### Gestión de destacados o noticias

Opcional para primera versión, recomendable para segunda etapa.

Debe permitir:

* cargar noticia breve
* cargar imagen
* destacar información de la fecha

---

# 3. Reglas de negocio

## 3.1. Publicación de fechas

* una fecha no debe verse públicamente hasta que la comisión la marque como visible
* el sistema debe permitir ocultar fechas futuras aunque ya estén cargadas
* si una fecha cambia de horario o de orden, la comisión podrá modificarla antes de publicarla o incluso luego de publicada

## 3.2. Tabla de posiciones

* debe calcularse automáticamente con los resultados cargados
* no debe editarse manualmente salvo excepción administrativa futura
* el cálculo debe contemplar al menos:

  * victoria = 3 puntos
  * empate = 2 punto
  * derrota = 1 puntos
  * no presentarse = 0 puntos
* criterio de desempate configurable o parametrizable

Criterio inicial sugerido:

1. puntos
2. diferencia de gol
3. goles a favor
4. resultado entre sí
5. sorteo/manual

## 3.3. Amonestaciones y límite de suspensión

* el sistema debe llevar acumulación de amarillas por jugador
* debe indicar qué jugadores se encuentran al borde de suspensión
* debe poder reflejar cuando un jugador queda automáticamente suspendido por acumulación, según reglamento vigente

Importante:
la cantidad de amarillas que genera suspensión debe ser un parámetro configurable.

Ejemplo:

* suspensión al llegar a 2 amarillas consecutivas (2 partidos seguidos).
* suspensión al llegar a 4 amarillas no consecutivas

## 3.4. Sanciones

* una sanción debe asociarse a jugador, equipo, motivo y cantidad de fechas
* debe indicarse cuántas fechas ya cumplió y cuántas restan
* debe poder marcarse como vigente, cumplida o anulada

## 3.5. Estadísticas

* las estadísticas deben derivarse automáticamente a partir de los datos cargados
* no deben cargarse manualmente, salvo observaciones excepcionales

---

# 4. Arquitectura sugerida

## 4.1. Enfoque recomendado

Se recomienda una arquitectura moderna, económica y escalable, compuesta por:

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS

### Backend / BaaS

* Supabase

### Hosting frontend

* Cloudflare Pages o Netlify

### Almacenamiento de imágenes y archivos

* Supabase Storage

### Base de datos

* PostgreSQL administrado por Supabase

## 4.2. Motivo de la recomendación

Esta arquitectura permite:

* costo cero o muy bajo al inicio
* hosting gratuito del frontend
* base de datos gratuita en plan inicial
* almacenamiento de imágenes
* autenticación simple
* posibilidad de crecimiento futuro

---

# 5. Modelo de datos sugerido

## 5.1. Entidad Torneo

Campos sugeridos:

* id
* nombre
* año
* descripcion
* estado
* reglamentoUrl
* cantidadAmarillasSuspension

## 5.2. Entidad Equipo

Campos sugeridos:

* id
* torneoId
* nombre
* descripcion
* escudoUrl
* fotoEquipoUrl
* activo

## 5.3. Entidad Jugador

Campos sugeridos:

* id
* equipoId
* nombre
* apellido
* fotoUrl
* numeroCamiseta
* posicion
* activo

## 5.4. Entidad Fecha

Campos sugeridos:

* id
* torneoId
* numero
* titulo
* visiblePublicamente
* publicada
* fechaReferencia
* observaciones

## 5.5. Entidad Partido

Campos sugeridos:

* id
* fechaId
* localId
* visitanteId
* diaHora
* cancha
* estado
* golesLocal
* golesVisitante
* observaciones

## 5.6. Entidad Tarjeta

Campos sugeridos:

* id
* partidoId
* jugadorId
* tipo
* minuto opcional
* observaciones

Tipos posibles:

* amarilla
* roja

## 5.7. Entidad Sancion

Campos sugeridos:

* id
* jugadorId
* equipoId
* motivo
* fechasTotales
* fechasCumplidas
* estado
* origen
* observaciones

Estados posibles:

* vigente
* cumplida
* anulada

## 5.8. Entidad Gol

Campos sugeridos:

* id
* partidoId
* jugadorId
* equipoId
* cantidad

## 5.9. Entidad Documento

Campos sugeridos:

* id
* torneoId
* tipo
* titulo
* archivoUrl
* vigente

## 5.10. Entidad UsuarioAdmin

Campos sugeridos:

* id
* nombre
* email
* rol
* activo

---

# 6. Pantallas del sistema

## 6.1. Sitio público

1. Home
2. Fixture
3. Resultados
4. Tabla de posiciones
5. Sanciones
6. Amonestados / al límite
7. Goleadores
8. Equipos
9. Detalle de equipo
10. Reglamento
11. Estadísticas

## 6.2. Panel administrador

1. Login
2. Dashboard
3. Gestión de equipos
4. Gestión de jugadores
5. Gestión de fechas
6. Gestión de partidos
7. Gestión de resultados
8. Gestión disciplinaria
9. Gestión de reglamento
10. Gestión de contenidos destacados

---

# 7. Flujos principales

## 7.1. Flujo de publicación de una fecha

1. La comisión crea la fecha en el panel.
2. Carga los partidos con horarios y canchas.
3. Ajusta el orden según disponibilidad de equipos.
4. Deja la fecha oculta mientras esté sujeta a cambios.
5. Cuando la fecha queda confirmada, marca la fecha como visible/publicada.
6. El sitio público muestra esa fecha automáticamente.

## 7.2. Flujo de carga de resultado

1. La comisión ingresa al panel.
2. Selecciona el partido disputado.
3. Carga goles local y visitante.
4. Carga goles por jugador si se requiere estadística individual.
5. Registra tarjetas y sanciones si corresponde.
6. El sistema recalcula tabla, goleadores, estadísticas y estado disciplinario.

## 7.3. Flujo de sanciones por amarillas

1. Se registran amarillas en un partido.
2. El sistema actualiza acumulado del jugador.
3. Si el jugador alcanza el umbral configurable, el sistema lo identifica como suspendido o al límite, según regla definida.
4. La sección pública de “jugadores al límite” refleja esa situación.

## 7.4. Flujo de gestión de equipo

1. La comisión crea el equipo.
2. Sube escudo.
3. Sube foto del plantel.
4. Carga jugadores.
5. Sube fotos individuales si dispone.
6. El equipo queda disponible en la sección pública.

---

# 8. Requerimientos no funcionales

## Usabilidad

* interfaz clara y simple
* buena visualización desde celular
* navegación rápida entre módulos

## Responsive

* prioridad mobile-first
* correcto funcionamiento en desktop y tablet

## Performance

* imágenes optimizadas
* carga rápida de páginas
* uso de caché en frontend cuando corresponda

## Seguridad

* panel privado protegido con autenticación
* almacenamiento seguro de imágenes y documentos
* permisos diferenciados por rol si se implementa

## Mantenibilidad

* código modular
* componentes reutilizables
* separación clara entre frontend, datos y servicios

---

# 9. Estructura técnica sugerida del proyecto

```txt
/apps
  /web-public
  /admin
/packages
  /ui
  /types
  /utils
  /supabase
```

## Alternativa simple de arranque

Si se desea comenzar más rápido, puede implementarse un único frontend con:

* área pública
* área admin protegida por login

Ejemplo:

```txt
/src
  /components
  /pages
    /public
    /admin
  /modules
    /teams
    /players
    /fixtures
    /results
    /discipline
    /stats
  /services
  /lib
  /types
```

---

# 10. Stack recomendado para el agente

## Opción recomendada

* React
* Vite
* TypeScript
* Tailwind CSS
* React Router
* Supabase Auth
* Supabase Database
* Supabase Storage
* React Query o TanStack Query
* Zod para validaciones
* Cloudflare Pages o Netlify para deploy

## Librerías útiles

* react-hook-form
* zod
* @tanstack/react-query
* date-fns
* lucide-react
* recharts o chart.js para estadísticas

---

# 11. Roadmap sugerido de implementación

## Etapa 1 – MVP

Objetivo: salir rápido con valor visible.

Incluir:

* Home
* Fixture con visibilidad por fecha
* Resultados
* Tabla de posiciones automática
* Goleadores
* Sanciones
* Reglamento
* Equipos
* Detalle de equipo básico

## Etapa 2 – Panel administrador completo

Incluir:

* Login
* Gestión de equipos
* Gestión de jugadores
* Gestión de fixture
* Gestión de resultados
* Gestión disciplinaria
* Carga de imágenes y PDF

## Etapa 3 – Estadísticas avanzadas y mejoras

Incluir:

* estadísticas ampliadas
* destacados de la fecha
* noticias
* histórico de torneos
* fichas completas por equipo y jugador

---

# 12. Entregable esperado para desarrollo

El desarrollo deberá contemplar como mínimo:

## Front público

* navegación principal
* home
* fixture visible por fecha
* resultados
* tabla
* goleadores
* sancionados
* jugadores al límite
* equipos
* detalle de equipo
* reglamento
* estadísticas

## Backoffice

* login
* ABM equipos
* ABM jugadores
* ABM fechas
* ABM partidos
* carga de resultados
* carga de tarjetas
* carga de sanciones
* carga de documentos
* publicación / ocultamiento de fechas

## Infraestructura

* repositorio Git
* deploy automático a hosting gratuito
* proyecto Supabase configurado
* buckets de storage para escudos, fotos y reglamento

---

# 13. Consideraciones funcionales importantes

* El fixture no debe mostrarse completo obligatoriamente; debe poder publicarse de manera progresiva.
* La comisión necesita flexibilidad para cambiar horarios y orden de partidos según disponibilidad.
* La solución debe permitir publicar información institucional del torneo además de la puramente deportiva.
* La carga de imágenes de equipos y jugadores es parte del alcance.
* El control disciplinario debe contemplar sancionados vigentes y jugadores próximos a sanción por amarillas.
* La solución debe priorizar facilidad de administración por personas no técnicas.

---

# 14. Recomendación final de implementación

Para este proyecto se recomienda construir una primera versión con:

* frontend en React + Vite + TypeScript
* estilos con Tailwind
* backend y base sobre Supabase
* imágenes en Supabase Storage
* deploy del frontend en Cloudflare Pages

Este enfoque permite lanzar una versión profesional, económica y escalable, sin depender de hosting tradicional pago.

---

# 15. Instrucción directa para agente de desarrollo

Construir una plataforma web del torneo de ex alumnos con sitio público y panel administrador. La plataforma debe permitir administrar equipos, jugadores, fixture, resultados, estadísticas, sanciones, amonestaciones, goleadores y reglamento. Debe contemplar carga de imágenes, publicación progresiva de fechas y cálculo automático de tabla y métricas del torneo. Debe ser responsive, fácil de administrar y desplegable en infraestructura gratuita.

---

# 16. Prompt maestro para agente de desarrollo

## Rol esperado del agente

Actuar como un desarrollador full stack senior con criterio de arquitectura, foco en experiencia de usuario, mantenibilidad y despliegue en servicios gratuitos.

## Contexto del proyecto

Se debe construir una plataforma web para un torneo de ex alumnos de un colegio.

La plataforma tendrá dos áreas:

1. un sitio público para consulta de la información del torneo
2. un panel administrador para la comisión organizadora

El objetivo es centralizar y publicar toda la información relevante del campeonato, permitiendo administrar fixture, resultados, tabla, sanciones, amonestaciones, goleadores, estadísticas, reglamento, equipos, jugadores e imágenes.

La solución debe pensarse con costo cero o costo mínimo de infraestructura, evitando hosting tradicional pago.

## Objetivo del desarrollo

Construir una aplicación web responsive, moderna y fácil de administrar que permita:

* mostrar la información pública del torneo
* gestionar los datos desde un panel privado
* publicar fechas del fixture de manera progresiva
* calcular automáticamente tabla de posiciones y estadísticas
* almacenar imágenes de equipos y jugadores
* publicar reglamento y documentos del torneo

## Stack obligatorio o preferido

Implementar usando:

* React
* Vite
* TypeScript
* Tailwind CSS
* React Router
* Supabase para autenticación, base de datos y storage
* TanStack Query para manejo de datos
* React Hook Form + Zod para formularios y validaciones
* Cloudflare Pages o Netlify para el deploy del frontend

## Lineamientos técnicos

* Priorizar arquitectura modular por dominio funcional.
* Diseñar componentes reutilizables.
* Mantener separación clara entre UI, lógica, acceso a datos y tipos.
* Aplicar enfoque mobile-first.
* Preparar la solución para crecer sin reescritura completa.
* Usar Supabase Storage para escudos, fotos de equipos, fotos de jugadores y reglamento PDF.
* Implementar autenticación para el panel administrador.
* Evitar lógica crítica hardcodeada cuando pueda parametrizarse.

## Módulos funcionales a desarrollar

### Sitio público

Desarrollar las siguientes pantallas públicas:

* Home
* Fixture
* Resultados
* Tabla de posiciones
* Sanciones
* Jugadores al límite por amarillas
* Goleadores
* Equipos
* Detalle de equipo
* Reglamento
* Estadísticas generales del torneo

### Panel administrador

Desarrollar las siguientes pantallas privadas:

* Login
* Dashboard
* Gestión de equipos
* Gestión de jugadores
* Gestión de fechas
* Gestión de partidos
* Gestión de resultados
* Gestión disciplinaria
* Gestión de reglamento
* Gestión de contenidos o destacados de la fecha (si entra en la primera iteración, caso contrario dejar preparado)

## Reglas de negocio obligatorias

### Publicación progresiva del fixture

* El fixture puede cargarse completo en el sistema.
* No todas las fechas deben mostrarse públicamente.
* Cada fecha debe tener un flag de visibilidad pública.
* La comisión debe poder ocultar o publicar fechas según confirmación real de horarios y canchas.
* Debe ser posible modificar horarios, cancha y orden de partidos antes o después de publicada una fecha.

### Tabla de posiciones

* Debe calcularse automáticamente en base a los partidos jugados.
* No debe cargarse manualmente.
* Regla inicial de puntaje: victoria 3, empate 1, derrota 0.
* Desempate inicial sugerido: puntos, diferencia de gol, goles a favor.
* Dejar preparado el código para extender criterios de desempate si se requiere.

### Amonestaciones y suspensión por acumulación

* Debe registrarse la cantidad de amarillas por jugador.
* Debe identificarse a los jugadores que están al borde de suspensión.
* Debe existir un parámetro configurable de cantidad de amarillas para suspensión.
* Debe poder distinguir entre jugador al límite y jugador suspendido por acumulación.

### Sanciones

* Debe registrarse jugador, equipo, motivo, cantidad de fechas, fechas cumplidas y pendientes.
* Debe existir estado de sanción: vigente, cumplida, anulada.

### Estadísticas

* Deben calcularse automáticamente a partir de los resultados, goles y tarjetas cargadas.
* No deben depender de carga manual.

## Entidades mínimas a modelar

Crear el modelo de datos necesario para las siguientes entidades:

* Torneo
* Equipo
* Jugador
* Fecha
* Partido
* Gol
* Tarjeta
* Sancion
* Documento
* Usuario administrador

## Campos sugeridos por entidad

### Torneo

* id
* nombre
* año
* descripción
* estado
* reglamentoUrl
* cantidadAmarillasSuspension

### Equipo

* id
* torneoId
* nombre
* descripcion
* escudoUrl
* fotoEquipoUrl
* activo

### Jugador

* id
* equipoId
* nombre
* apellido
* fotoUrl
* numeroCamiseta
* posicion
* activo

### Fecha

* id
* torneoId
* numero
* titulo
* visiblePublicamente
* publicada
* fechaReferencia
* observaciones

### Partido

* id
* fechaId
* localId
* visitanteId
* diaHora
* cancha
* estado
* golesLocal
* golesVisitante
* observaciones

### Gol

* id
* partidoId
* jugadorId
* equipoId
* cantidad

### Tarjeta

* id
* partidoId
* jugadorId
* tipo
* observaciones

### Sancion

* id
* jugadorId
* equipoId
* motivo
* fechasTotales
* fechasCumplidas
* estado
* origen
* observaciones

### Documento

* id
* torneoId
* tipo
* titulo
* archivoUrl
* vigente

### Usuario administrador

* id
* nombre
* email
* rol
* activo

## Estados sugeridos

### Estado de partido

* programado
* reprogramado
* jugado
* suspendido

### Tipo de tarjeta

* amarilla
* roja

### Estado de sanción

* vigente
* cumplida
* anulada

## Requerimientos UX/UI

* Diseñar una interfaz clara y moderna.
* Priorizar navegación simple desde celular.
* Home con acceso rápido a información clave.
* Tabla, goleadores y sanciones con visualización rápida.
* Pantalla de equipos visual, con escudos y fotos.
* Sección de jugadores al límite con destaque visual.
* Panel administrador simple de operar por usuarios no técnicos.

## Requerimientos de almacenamiento

* Guardar imágenes en Supabase Storage.
* Separar buckets por tipo si conviene, por ejemplo:

  * team-shields
  * team-photos
  * player-photos
  * documents
* Validar tamaño y tipo de archivo.
* Preparar vistas para mostrar imágenes optimizadas.

## Estructura sugerida del proyecto

Se sugiere una estructura modular similar a esta:

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

## Entregables esperados

El agente debe entregar:

### 1. Base del proyecto

* proyecto creado con Vite + React + TypeScript
* Tailwind configurado
* enrutado configurado
* layout público y layout admin

### 2. Integración con Supabase

* cliente configurado
* autenticación para admin
* tablas necesarias
* políticas de acceso si aplica
* storage configurado

### 3. Módulos funcionales

* ABM de equipos
* ABM de jugadores
* ABM de fechas
* ABM de partidos
* carga de resultados
* carga de tarjetas
* carga de sanciones
* carga de reglamento/documentos
* vistas públicas del torneo

### 4. Lógica de negocio

* cálculo de tabla de posiciones
* cálculo de goleadores
* cálculo de jugadores al límite
* cálculo de estadísticas generales

### 5. Deploy

* proyecto listo para deploy en Cloudflare Pages o Netlify
* variables de entorno documentadas
* README con instrucciones de instalación, desarrollo y despliegue

## Orden recomendado de implementación

### Fase 1

* setup del proyecto
* integración Supabase
* modelo de datos
* autenticación admin
* layout general

### Fase 2

* ABM equipos
* ABM jugadores
* carga de imágenes

### Fase 3

* ABM fechas
* ABM partidos
* visibilidad pública de fixture

### Fase 4

* carga de resultados
* cálculo tabla
* goleadores
* estadísticas base

### Fase 5

* módulo disciplinario
* amarillas
* rojas
* sanciones
* jugadores al límite

### Fase 6

* reglamento
* documentos
* mejoras visuales
* hardening final

## Criterios de aceptación generales

* La web pública debe poder consultarse correctamente desde celular y desktop.
* El panel admin debe requerir login.
* Debe poder cargarse y modificarse el fixture.
* Debe poder decidirse qué fecha es visible públicamente.
* La tabla debe actualizarse automáticamente al cargar resultados.
* Deben visualizarse sancionados y jugadores al límite por amarillas.
* Debe poder cargarse reglamento PDF.
* Deben poder cargarse escudos, fotos de equipo y fotos de jugadores.
* El sistema debe quedar listo para ser desplegado en infraestructura gratuita.

## Instrucción final para el agente

Construí la primera versión funcional completa de la plataforma web del torneo de ex alumnos usando React, Vite, TypeScript, Tailwind y Supabase. Priorizá mantenibilidad, claridad de código, experiencia mobile y facilidad de administración por parte de usuarios no técnicos. Implementá sitio público y panel administrador, contemplando fixture con publicación progresiva, resultados, tabla automática, estadísticas, sanciones, jugadores al límite por amarillas, reglamento, equipos, jugadores e imágenes. Dejá el proyecto listo para deploy y futura escalabilidad.
