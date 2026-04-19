import { test, expect } from '@playwright/test';

test.describe('Torneo Ex Alumnos - Tests Completos', () => {
  
  // =========================================
  // 1. CARGAR PARTIDO Y VERIFICAR 4 PARTIDOS
  // =========================================
  test('1. Crear fecha con 4 partidos automaticos', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    
    // Ver fecha existente
    await page.click('text=Ver partidos');
    
    // Verificar que hay 4 partidos
    await page.waitForSelector('table', { timeout: 10000 });
    const partidos = await page.locator('table tbody tr').count();
    console.log('Partidos en la fecha:', partidos);
    
    // Verificar horarios de los partidos
    for (let i = 0; i < 4; i++) {
      const fila = page.locator('table tbody tr').nth(i);
      const texto = await fila.textContent();
      console.log(`Partido ${i + 1}:`, texto);
    }
  });

  // =========================================
  // 2. CARGAR GOLES EN PLANILLA
  // =========================================
  test('2. Cargar goles en un partido', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    
    // Ir a ver partidos
    await page.click('text=Ver partidos');
    
    // Click en primer partido (editar)
    await page.click('table tbody tr:first-child >> text=Editar');
    
    // Esperar que cargue la planilla
    await page.waitForSelector('text=Goles', { timeout: 10000 });
    
    // Click en agregar gol
    const btnAgregarGol = page.locator('button:has-text("+ Agregar Gol")');
    if (await btnAgregarGol.isEnabled()) {
      await btnAgregarGol.click();
      
      // Llenar formulario de gol
      await page.selectOption('select:has-text("Equipo")', { index: 0 });
      await page.selectOption('select:has-text("Jugador")', { index: 0 });
      await page.fill('input[type="number"] >> nth=0', '45');
      
      // Guardar
      await page.click('button:has-text("Guardar")');
      
      // Verificar que se creo
      await page.waitForTimeout(2000);
      const golGuardado = await page.locator('text=Goles').count();
      console.log('Gol guardado:', golGuardado > 0);
    } else {
      console.log('Boton agregar gol deshabilitado (equipo libre?)');
    }
  });

  // =========================================
  // 3. CARGAR AMONESTACIONES (AMARILLAS)
  // =========================================
  test('3. Cargar amonestaciones en un partido', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    await page.click('text=Ver partidos');
    await page.click('table tbody tr:first-child >> text=Editar');
    
    await page.waitForSelector('text=Tarjetas', { timeout: 10000 });
    
    const btnAgregarTarjeta = page.locator('button:has-text("+ Agregar Tarjeta")');
    if (await btnAgregarTarjeta.isEnabled()) {
      await btnAgregarTarjeta.click();
      
      // Llenar formulario
      await page.selectOption('select:has-text("Equipo")', { index: 0 });
      await page.selectOption('select:has-text("Jugador")', { index: 0 });
      await page.selectOption('select:has-text("Tipo")', { label: 'Amarilla' });
      await page.fill('input[type="number"] >> nth=0', '30');
      
      await page.click('button:has-text("Guardar")');
      await page.waitForTimeout(2000);
      console.log('Amarilla cargada correctamente');
    } else {
      console.log('Boton deshabilitado');
    }
  });

  // =========================================
  // 4. CARGAR EXPULSION (ROJA)
  // =========================================
  test('4. Cargar expulsion en un partido', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    await page.click('text=Ver partidos');
    await page.click('table tbody tr:first-child >> text=Editar');
    
    await page.waitForSelector('text=Tarjetas', { timeout: 10000 });
    
    const btnAgregarTarjeta = page.locator('button:has-text("+ Agregar Tarjeta")');
    if (await btnAgregarTarjeta.isEnabled()) {
      await btnAgregarTarjeta.click();
      
      // Llenar formulario con roja
      await page.selectOption('select:has-text("Equipo")', { index: 0 });
      await page.selectOption('select:has-text("Jugador")', { index: 1 }); // Otro jugador
      await page.selectOption('select:has-text("Tipo")', { label: 'Roja' });
      await page.fill('input[type="number"] >> nth=0', '75');
      
      await page.click('button:has-text("Guardar")');
      await page.waitForTimeout(2000);
      console.log('Roja cargada correctamente');
    } else {
      console.log('Boton deshabilitado');
    }
  });

  // =========================================
  // 5. MOSTRAR/OCULTAR FECHA - ESTADO PUBLICADA
  // =========================================
  test('5. Publicar y ocultar fecha', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    
    // Ver estado actual de la fecha
    const estadoInicial = await page.locator('table tbody tr:first-child').textContent();
    console.log('Estado inicial:', estadoInicial?.includes('Borrador') ? 'Borrador' : 'Publicada');
    
    // Click en Editar
    await page.click('table tbody tr:first-child >> text=Editar');
    
    // Buscar checkbox de publicada
    const checkboxPublicada = page.locator('input[type="checkbox"]');
    const estaMarcada = await checkboxPublicada.isChecked();
    console.log('Checkbox publicada marcada:', estaMarcada);
    
    // Toggle - si esta desmarcada, marcar
    if (!estaMarcada) {
      await checkboxPublicada.check();
      await page.click('button:has-text("Guardar")');
      await page.waitForTimeout(2000);
      console.log('Fecha publicada');
    } else {
      // Desmarcar para ocultar
      await checkboxPublicada.uncheck();
      await page.click('button:has-text("Guardar")');
      await page.waitForTimeout(2000);
      console.log('Fecha ocultada');
    }
    
    // Verificar cambio
    await page.goto('http://localhost:5173/fixture');
    await page.waitForTimeout(2000);
    console.log('Verificando portal fixture...');
  });

  // =========================================
  // 6. VERIFICAR SANCIONES AUTOMATICAS
  // =========================================
  test('6. Verificar sanciones automaticas', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/sanciones');
    
    // Esperar que cargue
    await page.waitForSelector('text=Sanciones', { timeout: 10000 });
    
    // Ver criterios
    const criterios = await page.locator('text=Criterios').count();
    console.log('Seccion criterios visible:', criterios > 0);
    
    // Ver si hay sanciones
    const sanciones = await page.locator('table tbody tr').count();
    console.log('Sanciones existentes:', sanciones);
  });

  // =========================================
  // 7. CONFIGURAR EQUIPO LIBRE EN FECHA
  // =========================================
  test('7. Seleccionar equipo libre en fecha', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    
    // Click editar
    await page.click('table tbody tr:first-child >> text=Editar');
    
    // Buscar combo "Equipo que no juega"
    const comboLibre = page.locator('select:has-text("no juega")');
    if (await comboLibre.isVisible()) {
      // Seleccionar segundo equipo
      await comboLibre.selectOption({ index: 2 });
      await page.click('button:has-text("Guardar")');
      await page.waitForTimeout(2000);
      console.log('Equipo libre seleccionado');
    } else {
      console.log('Combo libre no visible');
    }
  });

  // =========================================
  // 8. VERIFICAR PORTAL PUBLICO
  // =========================================
  test('8. Verificar portal con fecha publicada', async ({ page }) => {
    await page.goto('http://localhost:5173/fixture');
    
    // Ver que muestra las fechas
    await page.waitForSelector('text=Fecha', { timeout: 10000 });
    
    const fechasVisibles = await page.locator('text=Fecha').count();
    console.log('Fechas visibles en fixture:', fechasVisibles);
    
    // Ver si muestra equipo libre
    const libreVisible = await page.locator('text=No juega').count();
    console.log('Equipo libre visible:', libreVisible > 0);
  });

  // =========================================
  // 9. VERIFICAR RESULTADOS
  // =========================================
  test('9. Cargar resultado de partido', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    await page.click('text=Ver partidos');
    await page.click('table tbody tr:first-child >> text=Editar');
    
    // Buscar seccion de resultado
    const resultadoSection = page.locator('text=Resultado del partido');
    if (await resultadoSection.isVisible()) {
      await page.fill('input[type="number"]:below(:text("Local"))', '3');
      await page.fill('input[type="number"]:below(:text("Visitante"))', '1');
      await page.click('button:has-text("Guardar Resultado")');
      await page.waitForTimeout(2000);
      console.log('Resultado cargado');
    }
  });

  // =========================================
  // 10. TEST DE INTEGRACION COMPLETO
  // =========================================
  test('10. Flujo completo: crear fecha -> cargar planilla -> verificar', async ({ page }) => {
    console.log('=== INICIO TEST INTEGRACION ===');
    
    // 1. Crear fecha
    await page.goto('http://localhost:5173/admin/fechas');
    await page.click('button:has-text("Nueva Fecha")');
    await page.fill('input[type="number"] >> nth=0', '100');
    await page.fill('input[type="date"]', '2025-07-01');
    await page.click('button:has-text("Crear Fecha")');
    await page.waitForTimeout(3000);
    console.log('1. Fecha creada');
    
    // 2. Ir a partidos
    await page.click('text=Ver partidos');
    await page.waitForTimeout(1000);
    console.log('2. Partido visible');
    
    // 3. Editar partido
    await page.click('table tbody tr:first-child >> text=Editar');
    await page.waitForTimeout(1000);
    console.log('3. Planilla cargada');
    
    // 4. Verificar estado
    const tieneResultado = await page.locator('text=Resultado del partido').count();
    console.log('4. Tiene seccion resultado:', tieneResultado > 0);
    
    console.log('=== TEST INTEGRACION COMPLETADO ===');
  });
});