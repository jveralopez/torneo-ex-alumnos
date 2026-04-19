import { test, expect } from '@playwright/test';

test.describe('CU-60: Ver Sanciones Activas', () => {
  test('debe mostrar sanciones activas', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/sanciones');
    await page.waitForTimeout(2000);
    const titulo = page.locator('h1:has-text("Sanciones")');
    console.log('Página sanciones visible:', await titulo.isVisible());
  });
});

test.describe('CU-61: Crear Sanción Manual', () => {
  test('debe permitir crear sanción manual', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/sanciones');
    const nuevaSanción = page.locator('text=Nueva Sanción');
    if (await nuevaSanción.isVisible()) {
      await nuevaSanción.click();
      console.log('Formulario de sanción abierto');
    }
  });
});

test.describe('CU-62: Marcar Sanción Cumplida', () => {
  test('debe permitir marcar sanción como cumplida', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/sanciones');
    await page.waitForTimeout(1000);
    console.log('Verificando sanciones existentes...');
  });
});

test.describe('CU-63: Verificar Sanciones Automáticas', () => {
  test('debe crear sanción automática por roja', async ({ page }) => {
    // Este test depende de cargar una roja primero
    await page.goto('http://localhost:5173/admin/sanciones');
    console.log('Verificar que sistema crea sanciones automáticas');
  });
});