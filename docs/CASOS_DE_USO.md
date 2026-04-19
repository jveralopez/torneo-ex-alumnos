# CASOS DE USO FUNCIONALES - Sistema Torneo Ex Alumnos

## 1. GESTIÓN DE TORNEOS

### CU-01: Crear Torneo
- **Actor**: Administrador
- **Descripción**: Crear un nuevo torneo
- **Precondiciones**: Estar logueado como admin
- **Flujo**:
  1. Ir a Configuración
  2. Completar nombre, año, descripción
  3. Guardar
- **Postcondiciones**: Tournament creado en BD

### CU-02: Modificar Configuración de Torneo
- **Actor**: Administrador
- **Descripción**: Actualizar parámetros del torneo
- **Precondiciones**: Tournament existente
- **Flujo**:
  1. Ir a Configuración
  2. Modificar campos (nombre, año, descripción)
  3. Configurar umbral de amarillas
  4. Configurar suspensiones por roja
  5. Guardar

---

## 2. GESTIÓN DE EQUIPOS

### CU-10: Crear Equipo
- **Actor**: Administrador
- **Descripción**: Agregar nuevo equipo al torneo
- **Precondiciones**: Tournament activo
- **Flujo**:
  1. Ir a Equipos
  2. Click "Nuevo Equipo"
  3. Completar nombre, descripción
  4. Subir escudo (opcional)
  5. Subir foto equipo (opcional)
  6. Guardar
- **Postcondiciones**: Equipo creado en BD

### CU-11: Modificar Equipo
- **Actor**: Administrador
- **Descripción**: Editar datos de un equipo
- **Flujo**:
  1. Ir a Equipos
  2. Click "Editar" en equipo
  3. Modificar datos
  4. Guardar

### CU-12: Eliminar Equipo
- **Actor**: Administrador
- **Descripción**: Eliminar equipo del torneo
- **Flujo**:
  1. Ir a Equipos
  2. Click "Eliminar"
  3. Confirmar eliminación
- **Postcondiciones**: Equipo marcado como inactivo

---

## 3. GESTIÓN DE JUGADORES

### CU-20: Crear Jugador
- **Actor**: Administrador
- **Descripción**: Agregar jugador a un equipo
- **Flujo**:
  1. Ir a Equipos
  2. Click en equipo
  3. Click "Nuevo Jugador"
  4. Completar nombre, apellido, posición, número
  5. Subir foto (opcional)
  6. Guardar

### CU-21: Modificar Jugador
- **Actor**: Administrador
- **Flujo**:
  1. Ir a equipo
  2. Click "Editar" en jugador
  3. Modificar datos
  4. Guardar

### CU-22: Eliminar Jugador
- **Actor**: Administrador

---

## 4. GESTIÓN DE FECHAS/JORNADAS

### CU-30: Crear Fecha
- **Actor**: Administrador
- **Descripción**: Crear nueva jornada con 4 partidos automáticos
- **Flujo**:
  1. Ir a Fechas
  2. Click "Nueva Fecha"
  3. Completar número, título (opcional), fecha referencia
  4. Click "Crear Fecha"
- **Postcondiciones**: Fecha creada con 4 partidos en horarios 09:00, 09:45, 10:30, 11:15

### CU-31: Editar Fecha
- **Actor**: Administrador
- **Flujo**:
  1. Click "Editar" en fecha
  2. Modificar número, título, fecha referencia
  3. Seleccionar equipo libre (opcional)
  4. Guardar

### CU-32: Eliminar Fecha
- **Actor**: Administrador

### CU-33: Publicar Fecha
- **Actor**: Administrador
- **Descripción**: Hacer visible la fecha en portal público
- **Flujo**:
  1. Editar fecha
  2. Marcar checkbox "Publicada"
  3. Guardar

### CU-34: Ocultar Fecha
- **Actor**: Administrador
- **Descripción**: Quitar visibilidad de fecha en portal público

---

## 5. GESTIÓN DE PARTIDOS

### CU-40: Editar Partido
- **Actor**: Administrador
- **Descripción**: Asignar equipos a un partido
- **Flujo**:
  1. Ir a Fechas
  2. Click "Ver partidos" en fecha
  3. Click "Editar" en partido
  4. Seleccionar equipo local y visitante
  5. Guardar

### CU-41: Cargar Resultado
- **Actor**: Administrador
- **Flujo**:
  1. Editar partido
  2. Ingresar goles local y visitante
  3. Guardar resultado
- **Postcondiciones**: Partido marcado como "jugado"

---

## 6. PLANILLA DE PARTIDO

### CU-50: Cargar Goles
- **Actor**: Administrador
- **Descripción**: Registrar goles de un partido
- **Precondiciones**: Partido tener equipos asignados (no libre)
- **Flujo**:
  1. Editar partido
  2. Click "+ Agregar Gol"
  3. Seleccionar equipo, jugador, minuto
  4. Guardar

### CU-51: Cargar Tarjeta Amarilla
- **Actor**: Administrador
- **Flujo**:
  1. Click "+ Agregar Tarjeta"
  2. Seleccionar equipo, jugador, minuto
  3. Seleccionar tipo "Amarilla"
  4. Guardar

### CU-52: Cargar Tarjeta Roja
- **Actor**: Administrador
- **Flujo**:
  1. Click "+ Agregar Tarjeta"
  2. Seleccionar equipo, jugador, minuto
  3. Seleccionar tipo "Roja"
  4. Guardar
- **Postcondiciones**: Sistema crea sanción automática

---

## 7. GESTIÓN DE SANCIONES

### CU-60: Ver Sanciones Activas
- **Actor**: Administrador
- **Flujo**: Ir a Sanciones

### CU-61: Crear Sanción Manual
- **Actor**: Administrador
- **Flujo**:
  1. Ir a Sanciones
  2. Click "Nueva Sanción"
  3. Seleccionar equipo, jugador, motivo
  4. Seleccionar origen "Manual"
  5. Definir cantidad de partidos
  6. Guardar

### CU-62: Marcar Sanción Cumplida
- **Actor**: Administrador
- **Flujo**:
  1. Ir a Sanciones
  2. Click "+1 Partido" en sanción vigente

### CU-63: Verificar Sanciones Automáticas
- **Sistema**: Crea sanciones automáticamente por:
  - Acumulación de amarillas (umbral configurable)
  - 2 amarillas consecutivas en mismo partido
  - Tarjeta roja directa

---

## 8. PORTAL PÚBLICO

### CU-70: Ver Fixture
- **Actor**: Usuario público
- **Flujo**:
  1. Ir a /fixture
  2. Ver fechas publicadas con partidos
- **Postcondiciones**: Mostrar fechas publicadas con horarios

### CU-71: Ver Equipo Libre
- **Actor**: Usuario público
- **Flujo**:
  1. Ver fixture
  2. Ver equipo marcado como "No juega" en fecha
- **Postcondiciones**: Mostrar equipo que no juega esa jornada

### CU-72: Ver Tabla de Posiciones
- **Actor**: Usuario público

### CU-73: Ver Equipos
- **Actor**: Usuario público
- **Flujo**: Ir a /equipos

### CU-74: Ver Noticias
- **Actor**: Usuario público
- **Flujo**: Ir a /noticias

---

## 9. CONFIGURACIÓN

### CU-80: Configurar Umbral de Amarillas
- **Actor**: Administrador
- **Flujo**: Configuración → Definir cantidad para suspensión automática

### CU-81: Configurar Suspensión por Roja
- **Actor**: Administrador
- **Flujo**: Configuración → Definir cantidad de partidos de suspensión

### CU-82: Habilitar Equipo Libre
- **Actor**: Administrador
- **Flujo**: Configuración → Checkbox "Equipo LIBRE"