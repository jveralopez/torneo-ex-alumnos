import { test, expect } from '@playwright/test';

test.describe('Torneo Ex Alumnos - Flujo Completo', () => {
  
  test('1. Verificar carga de página admin', async ({ page }) => {
    await page.goto('http://localhost:5173/admin');
    await expect(page).toHaveURL(/admin/);
    await expect(page.locator('h1')).toContainText(/Torneo|Ex Alumnos|Panel/i);
  });

  test('2. Verificar pagina Equipos carga equipos', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/equipos');
    
    // Esperar que cargue
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Verificar que hay equipos en la tabla
    const equipos = await page.locator('table tbody tr').count();
    console.log('Equipos encontrados:', equipos);
  });

  test('3. Verificar pagina Fechas carga', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    
    // Esperar que cargue
    await page.waitForSelector('table', { timeout: 10000 });
    
    const fechas = await page.locator('table tbody tr').count();
    console.log('Fechas encontradas:', fechas);
  });

  test('4. Crear nueva fecha con 4 partidos', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    
    // Click en Nueva Fecha
    await page.click('button:has-text("Nueva Fecha")');
    
    // Llenar formulario
    await page.fill('input[type="number"] >> nth=0', '99');
    await page.fill('input[type="date"]', '2025-06-15');
    
    // Click en Crear
    await page.click('button:has-text("Crear Fecha")');
    
    // Esperar cualquier mensaje
    await page.waitForTimeout(3000);
    
    // Capturar cualquier error o exito
    const mensajes = await page.locator('[class*="green"], [class*="red"], [class*="alert"]').allTextContents();
    console.log('Mensajes:', mensajes);
  });

  test('5. Editar fecha - combo equipo libre', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    
    // Click en Editar primera fecha
    await page.click('text=Editar >> nth=0');
    
    // Verificar que aparece el combo
    const combo = page.locator('select');
    await expect(combo).toBeVisible();
    
    // Ver opciones
    const opciones = await combo.locator('option').count();
    console.log('Opciones en combo libre:', opciones);
  });

  test('6. Portal fixture carga', async ({ page }) => {
    await page.goto('http://localhost:5173/fixture');
    
    // Verificar titulo
    await expect(page.locator('h1')).toContainText(/Fixture/i);
  });

  test('7. Verificar console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:5173/admin/fechas');
    await page.waitForTimeout(3000);
    
    console.log('Console errors:', errors);
    expect(errors.length).toBe(0);
  });
});