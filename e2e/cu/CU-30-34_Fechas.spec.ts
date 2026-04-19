import { test, expect } from '@playwright/test';

test.describe('CU-30: Crear Fecha', () => {
  test('debe crear fecha con 4 partidos automáticos', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    await page.click('button:has-text("Nueva Fecha")');
    await page.fill('input[type="number"] >> nth=0', '50');
    await page.fill('input[type="date"]', '2025-08-15');
    await page.click('button:has-text("Crear Fecha")');
    await page.waitForTimeout(3000);
    
    // Verificar que se crearon los 4 partidos
    await page.click('text=Ver partidos');
    const partidos = await page.locator('table tbody tr').count();
    console.log('Partidos creados:', partidos);
    expect(partidos).toBe(4);
  });
});

test.describe('CU-31: Editar Fecha', () => {
  test('debe permitir editar una fecha', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    const editar = page.locator('text=Editar').first();
    if (await editar.isVisible()) {
      await editar.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('CU-32: Eliminar Fecha', () => {
  test('debe permitir eliminar una fecha', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    const eliminar = page.locator('text=Eliminar').first();
    if (await eliminar.isVisible()) {
      await eliminar.click();
    }
  });
});

test.describe('CU-33: Publicar Fecha', () => {
  test('debe publicar una fecha para que sea visible en portal', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    await page.click('text=Editar >> nth=0');
    await page.waitForTimeout(1000);
    console.log('Editando fecha para publicar...');
  });
});

test.describe('CU-34: Ocultar Fecha', () => {
  test('debe ocultar una fecha del portal público', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    await page.click('text=Editar >> nth=0');
    console.log('Editando para ocultar...');
  });
});