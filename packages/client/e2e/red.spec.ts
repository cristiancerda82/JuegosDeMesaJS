import { expect, test, type Browser, type Page } from '@playwright/test';

/** Un jugador en su propio navegador (contexto aislado, con su almacenamiento). */
async function jugador(browser: Browser): Promise<Page> {
  const contexto = await browser.newContext();
  return contexto.newPage();
}

async function abrirRed(page: Page, nombre: string) {
  await page.goto('./?rapido');
  await page.getByTestId('jugar-en-red').click();
  await page.getByTestId('nombre').fill(nombre);
}

/** El anfitrión crea una sala del juego y devuelve su código. */
async function crearSala(page: Page, juego: string, opciones?: (p: Page) => Promise<void>) {
  await abrirRed(page, 'Ana');
  await page.getByTestId('crear-sala').click();
  await page.getByTestId(`red-juego-${juego}`).click();
  await opciones?.(page);
  await page.getByTestId('empezar').click();
  const codigo = page.getByTestId('codigo-sala');
  await expect(codigo).toHaveText(/^[A-Z]{5}$/);
  return (await codigo.textContent())!;
}

async function unirse(page: Page, codigo: string, nombre: string) {
  await abrirRed(page, nombre);
  await page.getByTestId('codigo').fill(codigo.toLowerCase());
  await page.getByTestId('unirse').click();
  await expect(page.getByTestId('sala-espera')).toBeVisible();
}

/** Juega la Brisca en dos navegadores hasta el fin (o hasta `parar` jugadas). */
async function jugarBriscaEnRed(paginas: Page[], parar = Infinity) {
  for (let jugadas = 0; jugadas < Math.min(parar, 200); jugadas++) {
    const turno = paginas.map((p) => p.locator('.carta-mano.jugable, [data-testid="fin"]').first());
    // Espera a que a alguno le toque jugar o termine la partida.
    await expect
      .poll(async () => (await Promise.all(turno.map((t) => t.isVisible()))).some(Boolean), {
        timeout: 20_000,
      })
      .toBe(true);
    if (await paginas[0]!.getByTestId('fin').isVisible()) return;
    const p = (await turno[0]!.isVisible()) ? paginas[0]! : paginas[1]!;
    await p.locator('.carta-mano.jugable').first().click();
    await p.getByTestId('mesa').click();
  }
}

test('Brisca entre dos navegadores, con una recarga a mitad de partida', async ({ browser }) => {
  test.setTimeout(240_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'brisca');
  await unirse(luis, codigo, 'Luis');

  await expect(ana.getByTestId('asiento-sala-1')).toContainText('Luis');
  await expect(luis.getByTestId('esperando-anfitrion')).toBeVisible();
  await ana.getByTestId('empezar-red').click();

  // Cada uno ve su mano abajo y el nombre del otro.
  for (const [p, otro] of [
    [ana, 'Luis'],
    [luis, 'Ana'],
  ] as const) {
    await expect(p.locator('.carta-mano')).toHaveCount(3);
    await expect(p.getByTestId('franja-red')).toContainText(otro);
    await expect(p.getByTestId('asiento-' + (p === ana ? 1 : 0))).toContainText(otro);
  }
  await ana.screenshot({ path: `test-results/red-brisca-ana.png` });

  await jugarBriscaEnRed([ana, luis], 6);

  // Luis recarga: vuelve a su asiento desde el menú.
  const manoAntes = await luis.locator('.carta-mano').count();
  await luis.reload();
  await luis.getByRole('button', { name: 'Volver a la sala' }).first().click();
  await expect(luis.locator('.carta-mano')).toHaveCount(manoAntes);
  await expect(ana.getByTestId('jugador-1')).toContainText('Luis');

  await jugarBriscaEnRed([ana, luis]);
  for (const p of [ana, luis]) {
    await expect(p.getByTestId('fin')).toBeVisible();
    const a = Number(await p.getByTestId('fin').getByTestId('puntos-0').textContent());
    const b = Number(await p.getByTestId('fin').getByTestId('puntos-1').textContent());
    expect(a + b).toBe(120);
  }
  // Solo el anfitrión pide la revancha.
  await expect(luis.getByTestId('espera-revancha')).toBeVisible();
  await ana.getByTestId('revancha').click();
  for (const p of [ana, luis]) {
    await expect(p.getByTestId('fin')).toBeHidden();
    await expect(p.locator('.carta-mano')).toHaveCount(3);
  }
});

test('Mus de 2 humanos y 2 IAs, jugando desde los asientos 0 y 2', async ({ browser }) => {
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'mus');
  await unirse(luis, codigo, 'Luis');
  // Luis se cambia al asiento 2: es la pareja de Ana.
  await luis.getByTestId('sentarse-2').click();
  await expect(ana.getByTestId('asiento-sala-2')).toContainText('Luis');
  await expect(ana.getByTestId('asiento-sala-1')).toContainText('IA');
  await ana.getByTestId('empezar-red').click();

  // Desde el asiento 2, Ana (asiento 0) está enfrente y es su pareja.
  await expect(luis.getByTestId('asiento-0')).toHaveClass(/arriba/);
  await expect(luis.getByTestId('asiento-0')).toContainText('Ana');
  await expect(luis.getByTestId('asiento-1')).toHaveClass(/izquierda/);
  await expect(luis.getByTestId('asiento-3')).toHaveClass(/derecha/);
  await expect(ana.getByTestId('asiento-2')).toHaveClass(/arriba/);
  await expect(luis.locator('[data-testid="propio"], .propio').first()).toBeVisible();
  for (const p of [ana, luis]) {
    await expect(p.getByTestId('franja-red')).toContainText('IA');
    await expect(p.getByTestId('jugador-1')).toContainText('IA');
  }
  await luis.screenshot({ path: `test-results/red-mus-asiento-2.png` });
});

test('Butifarra en red: dos humanos rivales juegan una baza', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'butifarra');
  await unirse(luis, codigo, 'Luis');
  await expect(ana.getByTestId('asiento-sala-1')).toContainText('Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) await expect(p.locator('.carta-mano')).toHaveCount(12);

  // Cada uno decide lo que le toque (pasar, elegir oros) y juega una carta, hasta que los dos
  // han jugado en la primera baza.
  const paginas = [ana, luis];
  const cartasEnMano = () => Promise.all(paginas.map((p) => p.locator('.carta-mano').count()));
  for (let paso = 0; paso < 20 && (await cartasEnMano()).some((n) => n === 12); paso++) {
    const accion = paginas.map((p) =>
      p.locator('[data-testid="pasar"], [data-testid="elegir-oros"], .carta-mano.jugable').first(),
    );
    await expect
      .poll(async () => (await Promise.all(accion.map((a) => a.isVisible()))).some(Boolean), {
        timeout: 20_000,
      })
      .toBe(true);
    const p = (await accion[0]!.isVisible()) ? ana : luis;
    const boton = p.locator('[data-testid="pasar"], [data-testid="elegir-oros"]').first();
    if (await boton.isVisible()) {
      const id = await boton.getAttribute('data-testid');
      await boton.click();
      await expect(p.getByTestId(id!)).toBeHidden();
    } else {
      const antes = await p.locator('.carta-mano').count();
      // La esquina de la carta queda a la vista aunque las cartas se solapen.
      await p
        .locator('.carta-mano.jugable')
        .first()
        .click({ position: { x: 8, y: 8 } });
      await p.getByTestId('mesa').click();
      await expect(p.locator('.carta-mano')).toHaveCount(antes - 1);
    }
  }
  for (const p of [ana, luis]) {
    await expect(p.getByTestId('triunfo-butifarra')).toBeVisible();
    await expect(p.locator('.carta-mano')).toHaveCount(11);
  }
  await luis.screenshot({ path: `test-results/red-butifarra-luis.png` });
});

test('Truc en red: dos humanos juegan una mano completa', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'truc');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) await expect(p.locator('.carta-mano')).toHaveCount(3);
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');

  // Ana truca y Luis quiere; luego cada uno juega su carta cuando le toca.
  await ana.getByTestId('truc-trucar').click();
  await luis.getByTestId('truc-vull').click();
  for (const p of [ana, luis])
    await expect(p.getByTestId('valor-mano')).toHaveText('La mano vale 2');
  const paneles = [ana, luis].map((p) => p.getByTestId('panel-mano'));
  // La mano ha terminado en cuanto cambian las piedras de la came.
  const terminada = async () =>
    (await Promise.all(paneles.map((x) => x.isVisible()))).some(Boolean) ||
    !(await ana.getByTestId('marcador').innerText()).includes('0 – 0 (a 12)');
  for (let paso = 0; paso < 12 && !(await terminada()); paso++) {
    const cartas = [ana, luis].map((p) => p.locator('.carta-mano.jugable').first());
    await expect
      .poll(
        async () =>
          (await Promise.all([...cartas, ...paneles].map((x) => x.isVisible()))).some(Boolean),
        { timeout: 20_000 },
      )
      .toBe(true);
    for (const [i, p] of [ana, luis].entries()) {
      if (!(await terminada()) && (await cartas[i]!.isVisible())) {
        const antes = await p.locator('.carta-mano').count();
        await cartas[i]!.click({ position: { x: 8, y: 8 } });
        await p.getByTestId('mesa').click();
        await expect(p.locator('.carta-mano')).not.toHaveCount(antes);
      }
    }
  }
  for (const p of paneles) {
    await expect(p).toBeVisible();
    await expect(p.getByTestId('resumen-truc')).toContainText('Truc');
  }
});

test('sin servidor, la pantalla de red lo dice', async ({ page }) => {
  await abrirRed(page, 'Ana');
  await page.locator('summary').click();
  await page.getByTestId('servidor').fill('ws://localhost:9');
  await page.getByTestId('crear-sala').click();
  await page.getByTestId('red-juego-brisca').click();
  await page.getByTestId('empezar').click();
  await expect(page.getByTestId('aviso-red')).toHaveText('No se puede conectar con el servidor');
});
