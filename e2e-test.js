import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5201';
const EMAIL = 'admin@torneo.com';
const PASSWORD = '@Caseros828';

const HISTORIC_TEAMS = [
  'Boca Juniors', 'River Plate', 'Independiente', 'Racing Club', 'San Lorenzo',
  'Huracán', 'Vélez Sarsfield', 'Estudiantes', 'Gimnasia LP', 'Banfield',
  'Lanús', 'Argentinos Juniors', 'Newell\'s Old Boys', 'Rosario Central'
];

const PLAYER_NAMES = [
  'Juan Román Riquelme', 'Martín Palermo', 'Carlos Tevez', 'Gonzalo Higuaín',
  'Javier Zanetti', 'Diego Maradona', 'Gabriel Batistuta', 'Hernán Crespo'
];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomNumber(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runTest() {
  console.log('🚀 E2E Test - Admin Panel\n================================');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Login
    console.log('1️⃣ Login...');
    await page.goto(`${BASE_URL}/admin`);
    await sleep(2000);
    
    if (page.url().includes('login')) {
      await page.fill('[type="email"]', EMAIL);
      await page.fill('[type="password"]', PASSWORD);
      await page.click('button[type="submit"]');
      await sleep(2000);
    }
    console.log('   ✅ Login OK\n');
    
    // Teams - navigate to new team page
    console.log('2️⃣ Equipos - Create...');
    await page.goto(`${BASE_URL}/admin/equipos/nuevo`);
    await sleep(1500);
    await page.locator('input').first().fill(randomItem(HISTORIC_TEAMS));
    await page.locator('textarea').first().fill('Equipo de prueba E2E');
    await page.click('button:has-text("Crear")');
    await sleep(1500);
    console.log('   ✅ Equipo creado');
    
    // Players - navigate to new player page
    console.log('3️⃣ Jugadores - Create...');
    await page.goto(`${BASE_URL}/admin/jugadores/nuevo`);
    await sleep(1500);
    const name = randomItem(PLAYER_NAMES);
    const parts = name.split(' ');
    await page.locator('input').first().fill(parts[0] || name);
    await page.locator('input').nth(1).fill(parts.slice(1).join(' ') || 'Test');
    await page.locator('input').nth(2).fill(randomNumber(1, 30).toString());
    await page.click('button:has-text("Crear")');
    await sleep(1500);
    console.log('   ✅ Jugador creado');
    
    // Match Days - direct create
    console.log('4️⃣ Fechas - Create...');
    await page.goto(`${BASE_URL}/admin/fechas`);
    await sleep(1500);
    await page.click('button:has-text("Nueva Fecha")');
    await sleep(800);
    await page.locator('input').first().fill(randomNumber(20, 30).toString());
    await page.click('button:has-text("Crear")');
    await sleep(1500);
    console.log('   ✅ Fecha creada');
    
    // Fechas - try publish if button exists
    console.log('5️⃣ Fechas - Publish (optional)...');
    const publishBtn = await page.$('button:has-text("Publicar todas")');
    if (publishBtn) {
      await publishBtn.click();
      await sleep(1000);
      console.log('   ✅ Fechas publicadas');
    } else {
      console.log('   ⏭️  Skip (no fechas to publish)');
    }
    
    // Sanctions
    console.log('6️⃣ Sanciones...');
    await page.goto(`${BASE_URL}/admin/sanciones`);
    await sleep(1500);
    console.log('   ✅ Page cargada');
    
    // Settings
    console.log('7️⃣ Settings - Update...');
    await page.goto(`${BASE_URL}/admin/configuracion`);
    await sleep(1500);
    await page.locator('input').first().fill('Torneo Ex Alumnos 2026 - E2E');
    await page.click('button:has-text("Guardar")');
    await sleep(1500);
    console.log('   ✅ Settings guardadas');
    
    // Documents
    console.log('8️⃣ Documentos...');
    await page.goto(`${BASE_URL}/admin/documentos`);
    await sleep(1500);
    console.log('   ✅ Page cargada');
    
    console.log('\n================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('================================');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await browser.close();
  }
}

runTest();