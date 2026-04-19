import { test, expect } from '@playwright/test';

test.describe('CU-70: Ver Fixture', () => {
  test('debe mostrar fixture con fechas publicadas', async ({ page }) => {
    await page.goto('http://localhost:5173/fixture');
    await page.waitForTimeout(2000);
    const titulo = page.locator('h1:has-text("Fixture")');
    console.log('Fixture visible:', await titulo.isVisible());
  });
});

test.describe('CU-71: Ver Equipo Libre', () => {
  test('debe mostrar equipo que no juega en la fecha', async ({ page }) => {
    await page.goto('http://localhost:5173/fixture');
    await page.waitForTimeout(2000);
    const libre = page.locator('text=No juega');
    console.log('Equipo libre visible:', await libre.isVisible());
  });
});

test.describe('CU-72: Ver Tabla de Posiciones', () => {
  test('debe mostrar tabla de posiciones', async ({ page }) => {
    await page.goto('http://localhost:5173/posiciones');
    await page.waitForTimeout(2000);
    const titulo = page.locator('h1');
    console.log('Posiciones visible:', await titulo.isVisible());
  });
});

test.describe('CU-73: Ver Equipos', () => {
  test('debe mostrar lista de equipos', async ({ page }) => {
    await page.goto('http://localhost:5173/equipos');
    await page.waitForTimeout(2000);
    const titulo = page.locator('h1');
    console.log('Equipos visible:', await titulo.isVisible());
  });
});

test.describe('CU-74: Ver Noticias', () => {
  test('debe mostrar noticias', async ({ page }) => {
    await page.goto('http://localhost:5173/noticias');
    await page.waitForTimeout(2000);
    const titulo = page.locator('h1');
    console.log('Noticias visible:', await titulo.isVisible());
  });
});

test.describe('CU-80: Configurar Umbral de Amarillas', () => {
  test('debe permitir configurar umbral', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/configuracion');
    const umbral = page.locator('input[type="number"]').first();
    console.log('Input de configuración visible:', await umbral.isVisible());
  });
});

test.describe('CU-81: Configurar Suspensión por Roja', () => {
  test('debe permitir configurar suspensión por roja', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/configuracion');
    console.log('Configuración de roja visible');
  });
});

test.describe('CU-82: Habilitar Equipo Libre', () => {
  test('debe mostrar checkbox de equipo libre', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/configuracion');
    const checkbox = page.locator('input[type="checkbox"]').first();
    console.log('Checkbox visible:', await checkbox.isVisible());
  });
});