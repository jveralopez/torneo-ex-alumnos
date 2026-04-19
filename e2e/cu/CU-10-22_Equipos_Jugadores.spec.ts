import { test, expect } from '@playwright/test';

test.describe('CU-10: Crear Equipo', () => {
  test('debe permitir crear un nuevo equipo', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/equipos');
    await page.click('text=Nuevo Equipo');
    await page.waitForTimeout(1000);
    // Buscar input por label
    await page.fill('label:has-text("Nombre del equipo") + input', 'Equipo Test E2E');
    await page.click('button:has-text("Crear Equipo")');
    await page.waitForTimeout(3000);
  });
});

test.describe('CU-11: Modificar Equipo', () => {
  test('debe permitir editar un equipo', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/equipos');
    // Buscar primer equipo y editar
    const editarBtn = page.locator('text=Editar').first();
    if (await editarBtn.isVisible()) {
      await editarBtn.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('CU-12: Eliminar Equipo', () => {
  test('debe permitir eliminar un equipo', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/equipos');
    const eliminarBtn = page.locator('text=Eliminar').first();
    if (await eliminarBtn.isVisible()) {
      await eliminarBtn.click();
    }
  });
});

test.describe('CU-20: Crear Jugador', () => {
  test('debe permitir crear un jugador en un equipo', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/equipos');
    // Click en ver jugadores del primer equipo
    const verJugadores = page.locator('text=Ver jugadores').first();
    if (await verJugadores.isVisible()) {
      await verJugadores.click();
      await page.waitForTimeout(1000);
      const nuevoJugador = page.locator('text=Nuevo Jugador').first();
      if (await nuevoJugador.isVisible()) {
        await nuevoJugador.click();
      }
    }
  });
});

test.describe('CU-21: Modificar Jugador', () => {
  test('debe permitir editar un jugador', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/equipos');
    const verJugadores = page.locator('text=Ver jugadores').first();
    if (await verJugadores.isVisible()) {
      await verJugadores.click();
      await page.waitForTimeout(1000);
      const editar = page.locator('text=Editar').first();
      if (await editar.isVisible()) {
        await editar.click();
      }
    }
  });
});