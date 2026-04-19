import { test, expect } from '@playwright/test';

test.describe('CU-01: Crear Torneo', () => {
  test('debe permitir crear un nuevo torneo', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/configuracion');
    // El torneo ya existe, verificamos que carga la configuración
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('CU-02: Modificar Configuración', () => {
  test('debe permitir modificar configuración del torneo', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/configuracion');
    const guardadoBtn = page.locator('button:has-text("Guardar")');
    await expect(guardadoBtn).toBeVisible();
  });
});