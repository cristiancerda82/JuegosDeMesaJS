import { expect, test, type Page } from '@playwright/test';
import { belleLucie, type AccionBelleLucie, type EstadoBelleLucie } from '@juegos/engine';
import { estadosBelleLucie, solucionarBelleLucie } from './belle-lucie-solucion';

/** Toca la esquina superior izquierda, que siempre queda a la vista aunque haya cartas encima. */
const ESQUINA = { position: { x: 6, y: 6 } };
/** Se gana usando los dos rebarajes y la merci. */
const SEMILLA_GANABLE = 'lucie-17';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-belleLucie').click();
  await page.getByTestId('empezar').click();
}

function enMotor(semilla: string): EstadoBelleLucie {
  const r = belleLucie.crear({}, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** La primera semilla con una acción que cumple la condición al empezar. */
function semillaCon(prefijo: string, condicion: (a: AccionBelleLucie) => boolean) {
  for (let i = 0; i < 3000; i++) {
    const e = enMotor(`${prefijo}-${i}`);
    const a = belleLucie.accionesLegales(e, 0).find(condicion);
    if (a) return { semilla: `${prefijo}-${i}`, e, a };
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

const tope = (e: EstadoBelleLucie, i: number) => e.abanicos[i]!.at(-1)!;

/** Hace una acción tocando la mesa. */
async function hacer(page: Page, e: EstadoBelleLucie, a: AccionBelleLucie) {
  await page.waitForFunction(() => document.getAnimations().length === 0);
  if (a.tipo === 'fundacion') {
    const carta = page.getByTestId(`carta-${tope(e, a.abanico)}`);
    await carta.click(ESQUINA);
    await carta.click(ESQUINA);
  } else if (a.tipo === 'mover') {
    await page.getByTestId(`carta-${tope(e, a.desde)}`).click(ESQUINA);
    await page.getByTestId(`carta-${tope(e, a.hasta)}`).click(ESQUINA);
  } else if (a.tipo === 'rebarajar') {
    await page.getByTestId('rebarajar').click();
  } else if (a.tipo === 'merci') {
    await page.getByTestId('merci').click();
    await page.getByTestId(`carta-${e.abanicos[a.abanico]![a.indice]}`).click(ESQUINA);
  }
}

/** Juega por la UI las acciones de una solución, comprobando el contador de movimientos. */
async function jugar(page: Page, semilla: string, acciones: readonly AccionBelleLucie[]) {
  const estados = estadosBelleLucie(semilla, acciones);
  for (const [i, a] of acciones.entries()) {
    await hacer(page, estados[i]!, a);
    await expect(page.getByTestId('movimientos')).toHaveText(String(estados[i + 1]!.movimientos));
  }
}

// ── Mover, rechazo, rebarajar, merci, deshacer y abandonar ───────────────────

test('subir una carta a su fundación con dos toques', async ({ page }) => {
  const { semilla, e, a } = semillaCon('fundacion', (x) => x.tipo === 'fundacion');
  if (a.tipo !== 'fundacion') throw new Error('no es fundacion');
  const carta = tope(e, a.abanico);
  await empezar(page, `rapido&semilla=${semilla}`);
  await page.screenshot({ path: `test-results/lucie-mesa-${page.viewportSize()!.width}.png` });
  await hacer(page, e, a);
  await expect(page.getByTestId(`fundacion-${carta.split('-')[0]}`)).toContainText('');
  await expect(
    page.getByTestId(`fundacion-${carta.split('-')[0]}`).locator(`[data-carta="${carta}"]`),
  ).toBeVisible();
  await expect(page.getByTestId('movimientos')).toHaveText('1');
});

test('mover sobre otro abanico, y deshacer', async ({ page }) => {
  const { semilla, e, a } = semillaCon('mover', (x) => x.tipo === 'mover');
  if (a.tipo !== 'mover') throw new Error('no es mover');
  const carta = tope(e, a.desde);
  await empezar(page, `rapido&semilla=${semilla}`);
  await page.getByTestId(`carta-${carta}`).click(ESQUINA);
  await expect(page.getByTestId(`abanico-${a.hasta}`)).toHaveClass(/legal/);
  await page.getByTestId(`carta-${tope(e, a.hasta)}`).click(ESQUINA);
  await expect(
    page.getByTestId(`abanico-${a.hasta}`).locator(`[data-carta="${carta}"]`),
  ).toBeVisible();
  await page.getByTestId('deshacer').click();
  await expect(
    page.getByTestId(`abanico-${a.desde}`).locator(`[data-carta="${carta}"]`),
  ).toBeVisible();
});

test('un movimiento que no encaja no cambia nada', async ({ page }) => {
  const { semilla, e, a } = semillaCon('rechazo', (x) => x.tipo === 'mover');
  if (a.tipo !== 'mover') throw new Error('no es mover');
  // Un abanico al que la carta no puede ir.
  const otro = e.abanicos.findIndex(
    (_, i) =>
      i !== a.desde &&
      !belleLucie
        .accionesLegales(e, 0)
        .some((x) => x.tipo === 'mover' && x.desde === a.desde && x.hasta === i),
  );
  await empezar(page, `rapido&semilla=${semilla}`);
  await page.getByTestId(`carta-${tope(e, a.desde)}`).click(ESQUINA);
  await page.getByTestId(`carta-${tope(e, otro)}`).click(ESQUINA);
  await expect(page.getByTestId('movimientos')).toHaveText('0');
});

test('rebarajar dos veces y usar la merci', async ({ page }) => {
  await empezar(page, 'rapido&semilla=rebarajar');
  const boton = page.getByTestId('rebarajar');
  await expect(boton).toContainText('2');
  await boton.click();
  await expect(boton).toContainText('1');
  await expect(page.getByTestId('merci')).toHaveCount(0);
  await boton.click();
  await expect(boton).toBeDisabled();
  await page.getByTestId('merci').click();
  await expect(page.getByTestId('aviso-merci')).toBeVisible();
  // La carta de abajo del primer abanico pasa arriba.
  const abajo = page.getByTestId('abanico-0').locator('button[data-carta]').first();
  const id = (await abajo.getAttribute('data-carta'))!;
  await abajo.click(ESQUINA);
  await expect(page.getByTestId('abanico-0').locator('button[data-carta]').last()).toHaveAttribute(
    'data-carta',
    id,
  );
  await expect(page.getByTestId('merci')).toHaveCount(0);
  await expect(page.getByTestId('movimientos')).toHaveText('3');
});

test('ganar una partida desde la mesa', async ({ page }) => {
  test.setTimeout(300_000);
  const solucion = solucionarBelleLucie(SEMILLA_GANABLE);
  if (!solucion) throw new Error('Sin solución para la semilla de prueba');
  await empezar(page, `rapido&semilla=${SEMILLA_GANABLE}`);
  await jugar(page, SEMILLA_GANABLE, solucion);
  await expect(page.getByTestId('fin')).toContainText('¡Solitario completado!');
  await page.screenshot({ path: `test-results/lucie-victoria-${page.viewportSize()!.width}.png` });
});

test('abandonar La Belle Lucie', async ({ page }) => {
  await empezar(page, 'rapido&semilla=abandono');
  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Abandonar' }).click();
  await expect(page.getByTestId('fin')).toContainText('Partida abandonada');
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de La Belle Lucie se continúa en el mismo punto', async ({
  page,
}) => {
  await empezar(page, 'rapido&semilla=retomar');
  await page.getByTestId('rebarajar').click();
  await expect(page.getByTestId('movimientos')).toHaveText('1');
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByTestId('movimientos')).toHaveText('1');
  await expect(page.getByTestId('rebarajar')).toContainText('1');
});

test('la mesa de La Belle Lucie entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena');
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await page.screenshot({ path: 'test-results/lucie-360.png' });
  await expect(page.getByTestId('abanico-17')).toBeInViewport();
});
