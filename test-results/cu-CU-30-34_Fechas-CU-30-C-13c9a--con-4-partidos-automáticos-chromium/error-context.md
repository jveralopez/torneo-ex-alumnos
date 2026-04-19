# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cu\CU-30-34_Fechas.spec.ts >> CU-30: Crear Fecha >> debe crear fecha con 4 partidos automáticos
- Location: e2e\cu\CU-30-34_Fechas.spec.ts:4:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 4
Received: 0
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - banner [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - paragraph [ref=e8]: Panel administrador
        - heading "Torneo Ex Alumnos" [level=1] [ref=e9]
      - link "🏠 Volver al sitio" [ref=e11] [cursor=pointer]:
        - /url: /
  - navigation [ref=e12]:
    - link "Dashboard" [ref=e13] [cursor=pointer]:
      - /url: /admin
    - link "Equipos" [ref=e14] [cursor=pointer]:
      - /url: /admin/equipos
    - link "Fechas" [ref=e15] [cursor=pointer]:
      - /url: /admin/fechas
    - link "Sanciones" [ref=e16] [cursor=pointer]:
      - /url: /admin/sanciones
    - link "Documentos" [ref=e17] [cursor=pointer]:
      - /url: /admin/documentos
    - link "Noticias" [ref=e18] [cursor=pointer]:
      - /url: /admin/noticias
    - link "⚙️ Config" [ref=e19] [cursor=pointer]:
      - /url: /admin/configuracion
  - main [ref=e20]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('CU-30: Crear Fecha', () => {
  4  |   test('debe crear fecha con 4 partidos automáticos', async ({ page }) => {
  5  |     await page.goto('http://localhost:5173/admin/fechas');
  6  |     await page.click('button:has-text("Nueva Fecha")');
  7  |     await page.fill('input[type="number"] >> nth=0', '50');
  8  |     await page.fill('input[type="date"]', '2025-08-15');
  9  |     await page.click('button:has-text("Crear Fecha")');
  10 |     await page.waitForTimeout(3000);
  11 |     
  12 |     // Verificar que se crearon los 4 partidos
  13 |     await page.click('text=Ver partidos');
  14 |     const partidos = await page.locator('table tbody tr').count();
  15 |     console.log('Partidos creados:', partidos);
> 16 |     expect(partidos).toBe(4);
     |                      ^ Error: expect(received).toBe(expected) // Object.is equality
  17 |   });
  18 | });
  19 | 
  20 | test.describe('CU-31: Editar Fecha', () => {
  21 |   test('debe permitir editar una fecha', async ({ page }) => {
  22 |     await page.goto('http://localhost:5173/admin/fechas');
  23 |     const editar = page.locator('text=Editar').first();
  24 |     if (await editar.isVisible()) {
  25 |       await editar.click();
  26 |       await page.waitForTimeout(1000);
  27 |     }
  28 |   });
  29 | });
  30 | 
  31 | test.describe('CU-32: Eliminar Fecha', () => {
  32 |   test('debe permitir eliminar una fecha', async ({ page }) => {
  33 |     await page.goto('http://localhost:5173/admin/fechas');
  34 |     const eliminar = page.locator('text=Eliminar').first();
  35 |     if (await eliminar.isVisible()) {
  36 |       await eliminar.click();
  37 |     }
  38 |   });
  39 | });
  40 | 
  41 | test.describe('CU-33: Publicar Fecha', () => {
  42 |   test('debe publicar una fecha para que sea visible en portal', async ({ page }) => {
  43 |     await page.goto('http://localhost:5173/admin/fechas');
  44 |     await page.click('text=Editar >> nth=0');
  45 |     await page.waitForTimeout(1000);
  46 |     console.log('Editando fecha para publicar...');
  47 |   });
  48 | });
  49 | 
  50 | test.describe('CU-34: Ocultar Fecha', () => {
  51 |   test('debe ocultar una fecha del portal público', async ({ page }) => {
  52 |     await page.goto('http://localhost:5173/admin/fechas');
  53 |     await page.click('text=Editar >> nth=0');
  54 |     console.log('Editando para ocultar...');
  55 |   });
  56 | });
```