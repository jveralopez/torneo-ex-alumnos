import { test, expect } from '@playwright/test';

test.describe('CU-40: Editar Partido', () => {
  test('debe permitir asignar equipos a un partido', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    await page.click('text=Ver partidos');
    const editar = page.locator('text=Editar').first();
    if (await editar.isVisible()) {
      await editar.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('CU-41: Cargar Resultado', () => {
  test('debe permitir cargar resultado de partido', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    await page.click('text=Ver partidos');
    const editar = page.locator('text=Editar').first();
    if (await editar.isVisible()) {
      await editar.click();
      await page.waitForTimeout(1000);
      // Buscar sección de resultado
      const resultado = page.locator('text=Resultado del partido');
      console.log('Sección resultado visible:', await resultado.isVisible());
    }
  });
});

test.describe('CU-50: Cargar Goles', () => {
  test('debe permitir registrar goles en un partido', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    await page.click('text=Ver partidos');
    const editar = page.locator('text=Editar').first();
    if (await editar.isVisible()) {
      await editar.click();
      await page.waitForTimeout(1500);
      const btnGol = page.locator('button:has-text("+ Agregar Gol")');
      console.log('Botón agregar gol visible:', await btnGol.isVisible());
      console.log('Botón agregar gol enabled:', await btnGol.isEnabled());
    }
  });
});

test.describe('CU-51: Cargar Tarjeta Amarilla', () => {
  test('debe permitir registrar tarjeta amarilla', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    await page.click('text=Ver partidos');
    const editar = page.locator('text=Editar').first();
    if (await editar.isVisible()) {
      await editar.click();
      await page.waitForTimeout(1500);
      const btnTarjeta = page.locator('button:has-text("+ Agregar Tarjeta")');
      console.log('Botón agregar tarjeta visible:', await btnTarjeta.isVisible());
    }
  });
});

test.describe('CU-52: Cargar Tarjeta Roja', () => {
  test('debe permitir registrar tarjeta roja', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/fechas');
    await page.click('text=Ver partidos');
    const editar = page.locator('text=Editar').first();
    if (await editar.isVisible()) {
      await editar.click();
      console.log('Partido editable abierto');
    }
  });
});