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

test('Julepe en red: dos humanos y dos IAs juegan una mano', async ({ browser }) => {
  test.setTimeout(150_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'julepe');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) await expect(p.locator('.carta-mano')).toHaveCount(5);

  // Los dos juegan la mano, no cambian cartas y juegan su carta menor hasta el resumen.
  const paginas = [ana, luis];
  const paneles = paginas.map((p) => p.getByTestId('panel-mano'));
  const terminada = async () =>
    (await Promise.all(paneles.map((x) => x.isVisible()))).some(Boolean);
  for (let paso = 0; paso < 40 && !(await terminada()); paso++) {
    const accion = paginas.map((p) =>
      p
        .locator('[data-testid="julepe-jugar"], [data-testid="descartar"], .carta-mano.jugable')
        .first(),
    );
    await expect
      .poll(
        async () =>
          (await terminada()) ||
          (await Promise.all(accion.map((a) => a.isVisible()))).some(Boolean),
        {
          timeout: 30_000,
        },
      )
      .toBe(true);
    if (await terminada()) break;
    const i = (await accion[0]!.isVisible()) ? 0 : 1;
    const p = paginas[i]!;
    const boton = p.locator('[data-testid="julepe-jugar"], [data-testid="descartar"]').first();
    if (await boton.isVisible()) {
      const id = await boton.getAttribute('data-testid');
      await boton.click();
      await expect(p.getByTestId(id!)).toBeHidden();
    } else {
      const antes = await p.locator('.carta-mano').count();
      await p
        .locator('.carta-mano.jugable')
        .first()
        .click({ position: { x: 8, y: 8 } });
      await p.getByTestId('mesa').click();
      await expect(p.locator('.carta-mano')).not.toHaveCount(antes);
    }
  }
  // Cada uno se ve como «Tú» y ve al otro por su nombre.
  for (const [panel, otro] of [
    [paneles[0]!, 'Luis'],
    [paneles[1]!, 'Ana'],
  ] as const) {
    await expect(panel).toBeVisible({ timeout: 30_000 });
    await expect(panel.getByTestId('resumen-julepe')).toContainText(otro);
    await expect(panel.getByTestId('resumen-julepe')).toContainText('Tú');
  }
});

test('Tute subastado en red: dos humanos y dos IAs juegan una mano', async ({ browser }) => {
  test.setTimeout(150_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'tuteSubastado');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) await expect(p.locator('.carta-mano')).toHaveCount(10);

  // Los dos pasan en la subasta, eligen el primer palo si la ganan y juegan su carta menor.
  const paginas = [ana, luis];
  const paneles = paginas.map((p) => p.getByTestId('panel-mano'));
  const terminada = async () =>
    (await Promise.all(paneles.map((x) => x.isVisible()))).some(Boolean);
  const BOTONES = '[data-testid="pasar"], [data-testid^="triunfo-"]';
  for (let paso = 0; paso < 80 && !(await terminada()); paso++) {
    const accion = paginas.map((p) => p.locator(`${BOTONES}, .carta-mano.jugable`).first());
    await expect
      .poll(
        async () =>
          (await terminada()) ||
          (await Promise.all(accion.map((a) => a.isVisible()))).some(Boolean),
        { timeout: 30_000 },
      )
      .toBe(true);
    if (await terminada()) break;
    const i = (await accion[0]!.isVisible()) ? 0 : 1;
    const p = paginas[i]!;
    const boton = p.locator(BOTONES).first();
    if (await boton.isVisible()) {
      const id = await boton.getAttribute('data-testid');
      await boton.click();
      await expect(p.getByTestId(id!)).toBeHidden();
    } else {
      const antes = await p.locator('.carta-mano').count();
      await p
        .locator('.carta-mano.jugable')
        .first()
        .click({ position: { x: 8, y: 8 } });
      await p.getByTestId('mesa').click();
      await expect(p.locator('.carta-mano')).not.toHaveCount(antes);
    }
  }
  // Cada uno se ve como «Tú» y ve al otro por su nombre.
  for (const [panel, otro] of [
    [paneles[0]!, 'Luis'],
    [paneles[1]!, 'Ana'],
  ] as const) {
    await expect(panel).toBeVisible({ timeout: 30_000 });
    await expect(panel.getByTestId('resumen-tute-subastado')).toContainText(otro);
    await expect(panel.getByTestId('resumen-tute-subastado')).toContainText('Tú');
  }
});

test('Cuatrola en red: dos humanos y dos IAs juegan una mano', async ({ browser }) => {
  test.setTimeout(150_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'cuatrola');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) await expect(p.locator('.carta-mano')).toHaveCount(10);

  // Los dos pasan en la subasta, eligen el primer palo y la primera carta si la ganan, y
  // juegan su carta menor.
  const paginas = [ana, luis];
  const paneles = paginas.map((p) => p.getByTestId('panel-mano'));
  const terminada = async () =>
    (await Promise.all(paneles.map((x) => x.isVisible()))).some(Boolean);
  const BOTONES = '[data-testid="pasar"], [data-testid^="triunfo-"], [data-testid^="llamar-"]';
  for (let paso = 0; paso < 80 && !(await terminada()); paso++) {
    const accion = paginas.map((p) => p.locator(`${BOTONES}, .carta-mano.jugable`).first());
    await expect
      .poll(
        async () =>
          (await terminada()) ||
          (await Promise.all(accion.map((a) => a.isVisible()))).some(Boolean),
        { timeout: 30_000 },
      )
      .toBe(true);
    if (await terminada()) break;
    const i = (await accion[0]!.isVisible()) ? 0 : 1;
    const p = paginas[i]!;
    const boton = p.locator(BOTONES).first();
    if (await boton.isVisible()) {
      const id = await boton.getAttribute('data-testid');
      await boton.click();
      await expect(p.getByTestId(id!)).toBeHidden();
    } else {
      const antes = await p.locator('.carta-mano').count();
      await p
        .locator('.carta-mano.jugable')
        .first()
        .click({ position: { x: 8, y: 8 } });
      await p.getByTestId('mesa').click();
      await expect(p.locator('.carta-mano')).not.toHaveCount(antes);
    }
  }
  // Cada uno se ve como «Tú» y ve al otro por su nombre.
  for (const [panel, otro] of [
    [paneles[0]!, 'Luis'],
    [paneles[1]!, 'Ana'],
  ] as const) {
    await expect(panel).toBeVisible({ timeout: 30_000 });
    await expect(panel.getByTestId('resumen-cuatrola')).toContainText(otro);
    await expect(panel.getByTestId('resumen-cuatrola')).toContainText('Tú');
  }
});

test('Mentiroso en red: dos humanos bajan y cada uno ve la bajada del otro', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'mentiroso');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(13);

  // Ana es mano: baja una carta como As; Luis la ve y baja la suya como dos.
  const bajarUna = async (p: Page) => {
    await p.getByTestId('bajar').waitFor({ timeout: 30_000 });
    await p
      .locator('[data-testid="mano"] .carta-mano')
      .first()
      .click({ position: { x: 6, y: 6 } });
    await p.getByTestId('bajar').click();
  };
  await bajarUna(ana);
  await expect(luis.getByTestId('ultima-bajada')).toHaveText('Ana: 1 As');
  await bajarUna(luis);
  await expect(ana.getByTestId('ultima-bajada')).toHaveText('Luis: 1 dos', { timeout: 30_000 });
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Ocho loco en red: dos humanos juegan y cada uno ve lo que hizo el otro', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'ochoLoco');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(5);

  // Juega una carta que case (eligiendo corazones con un 8), o roba y pasa.
  const turno = async (p: Page) => {
    await p
      .locator('[data-testid="mano"] .carta-mano.jugable, [data-testid="robar"]')
      .first()
      .waitFor({ timeout: 30_000 });
    const jugable = p.locator('[data-testid="mano"] .carta-mano.jugable').first();
    if (await jugable.isVisible()) {
      const id = (await jugable.getAttribute('data-carta'))!;
      await jugable.click({ position: { x: 6, y: 6 } });
      if (id.endsWith('-8')) await p.getByTestId('palo-corazones').click();
      return id;
    }
    await p.getByTestId('robar').click();
    await p.getByTestId('pasar').click();
    return null;
  };
  // Ana es mano; Luis ve lo que hizo y juega él.
  const deAna = await turno(ana);
  if (deAna) await expect(luis.getByTestId('descarte')).toHaveAttribute('data-carta', deAna);
  else await expect(luis.getByTestId('asiento-0')).toContainText('Pasa');
  await expect(luis.getByTestId('asiento-0')).toContainText('Ana');
  const deLuis = await turno(luis);
  if (deLuis) {
    await expect(ana.getByTestId('asiento-1')).toContainText(/de /, { timeout: 30_000 });
  } else {
    await expect(ana.getByTestId('asiento-1')).toContainText(/Pasa|de /, { timeout: 30_000 });
  }
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Picas en red: dos humanos apuestan y ven la apuesta del otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'picas');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(13);

  // Ana apuesta primero; Luis ve su apuesta y apuesta él.
  await ana.getByTestId('apostar-4').click();
  await expect(luis.getByTestId('asiento-0')).toContainText('Ana');
  await expect(luis.getByTestId('asiento-0')).toContainText('4 / 0');
  await luis.getByTestId('apostar-0').click();
  await expect(ana.getByTestId('asiento-1')).toContainText('Nil', { timeout: 30_000 });
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Blackjack en red: dos humanos apuestan y ven las cartas del otro', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'blackjack');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();

  // Ana apuesta primero; Luis ve su apuesta y apuesta él.
  await ana.getByTestId('apostar-10').click();
  await expect(luis.getByTestId('apuesta-0')).toHaveText('apuesta 10');
  await expect(luis.getByTestId('puesto-0')).toContainText('Ana');
  await luis.getByTestId('apostar-4').click();
  // Repartido: cada uno ve las dos cartas del otro.
  await expect(ana.locator('[data-testid="mano-1-0"] .naipe')).toHaveCount(2, { timeout: 30_000 });
  await expect(luis.locator('[data-testid="mano-0-0"] .naipe')).toHaveCount(2);
  await expect(ana.getByTestId('puesto-1')).toContainText('Luis');
});

test('Gin Rummy en red: dos humanos pasan la primera carta, roban y descartan', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'ginRummy');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(10);

  // Los dos pasan la primera carta; Ana roba del mazo y descarta.
  await ana.getByTestId('pasar').click();
  await expect(luis.getByTestId('pasar')).toBeVisible();
  await luis.getByTestId('pasar').click();
  await expect(ana.getByTestId('mazo')).toHaveClass(/robable/);
  await ana.getByTestId('mazo').click();
  const primera = ana.locator('[data-testid="mano"] .carta-mano').first();
  const carta = await primera.getAttribute('data-carta');
  await primera.click({ position: { x: 6, y: 6 } });
  await ana.getByTestId('descartar').click();
  await expect(luis.getByTestId('descarte').locator(`[data-carta="${carta}"]`)).toBeVisible();
  await expect(luis.getByTestId('mazo')).toHaveClass(/robable/);
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Rummy 500 en red: dos humanos roban y descartan', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'rummy500');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(13);

  // Cada uno roba del mazo y descarta su primera carta.
  for (const [p, otro] of [
    [ana, luis],
    [luis, ana],
  ] as const) {
    await expect(p.getByTestId('mazo')).toHaveClass(/robable/);
    await p.getByTestId('mazo').click();
    const primera = p.locator('[data-testid="mano"] .carta-mano').first();
    const carta = await primera.getAttribute('data-carta');
    await primera.click({ position: { x: 6, y: 6 } });
    await p.getByTestId('descartar').click();
    await expect(otro.getByTestId('descarte').locator(`[data-carta="${carta}"]`)).toBeVisible();
  }
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Canasta en red: dos humanos roban y descartan', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'canasta');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(11);

  // Empieza Ana (asiento 0) y después Luis (asiento 1): cada uno roba y descarta su primera carta.
  for (const [p, otro] of [
    [ana, luis],
    [luis, ana],
  ] as const) {
    await p.getByTestId('robar').click({ timeout: 30_000 });
    const primera = p.locator('[data-testid="mano"] .carta-mano').first();
    const carta = await primera.getAttribute('data-carta');
    await primera.click({ position: { x: 6, y: 6 } });
    await p.getByTestId('descartar').click();
    await expect(otro.getByTestId('pozo').locator('.arriba')).toHaveAttribute('data-carta', carta!);
  }
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
});

test('Culo en red: dos humanos y una IA juegan una ronda', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'culo', (p) =>
    p.getByLabel('3 jugadores', { exact: true }).check(),
  );
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis]) {
    await expect(p.locator('[data-testid="mano"] [data-carta]')).not.toHaveCount(0);
  }
  // Los dos ven los mismos cargos y el mismo número de cartas de cada uno.
  await expect(ana.getByTestId('puesto-1')).toContainText('Luis');
  await expect(luis.getByTestId('info-mano')).toHaveText(
    await ana.getByTestId('info-mano').innerText(),
  );
  // Al primero de los dos al que le toque: si abre, juega su carta más baja y el otro la ve en la
  // mesa; si tiene que superar, pasa y el otro lo ve en el aviso.
  await expect(async () => {
    expect(
      (await ana.getByTestId('jugar').isVisible()) || (await luis.getByTestId('jugar').isVisible()),
    ).toBe(true);
  }).toPass({ timeout: 30_000 });
  const [p, otro, nombreP] = (await ana.getByTestId('jugar').isVisible())
    ? ([ana, luis, 'Ana'] as const)
    : ([luis, ana, 'Luis'] as const);
  if (await p.getByTestId('pasar').isVisible()) {
    await p.getByTestId('pasar').click();
    await expect(otro.getByTestId('aviso')).toContainText(`${nombreP} pasa`);
  } else {
    const carta = await p
      .locator('[data-testid="mano"] [data-carta]')
      .first()
      .getAttribute('data-carta');
    await p.locator('[data-testid="mano"] [data-carta]').first().click();
    await p.getByTestId('jugar').click();
    await expect(otro.getByTestId('mesa').locator(`[data-carta="${carta}"]`)).toBeVisible();
  }
});

test('Texas Hold’em en red: dos humanos igualan y ven el flop', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'holdem', (p) =>
    p.getByLabel('2 jugadores', { exact: true }).check(),
  );
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] [data-carta]')).toHaveCount(2);

  // Con 2 jugadores, Ana tiene el botón y habla primero: iguala la ciega grande.
  await ana.getByTestId('igualar').click();
  await expect(luis.getByTestId('apuesta-0')).toHaveText('apuesta 2');
  await luis.getByTestId('pasar').click();
  // Se descubre el flop para los dos.
  for (const p of [ana, luis]) {
    await expect(p.getByTestId('comunes').locator('[data-carta]')).toHaveCount(3);
  }
  await expect(ana.getByTestId('puesto-1')).toContainText('Luis');
});

test('Remigio en red: dos humanos roban y descartan', async ({ browser }) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);
  const codigo = await crearSala(ana, 'remigio');
  await unirse(luis, codigo, 'Luis');
  await ana.getByTestId('empezar-red').click();
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(7);

  // Cada uno roba del mazo y descarta su primera carta, dos veces.
  for (let ronda = 0; ronda < 2; ronda++) {
    for (const [p, otro] of [
      [ana, luis],
      [luis, ana],
    ] as const) {
      await expect(p.getByTestId('mazo')).toHaveClass(/robable/);
      await p.getByTestId('mazo').click();
      await expect(p.getByTestId('descartar')).toBeVisible();
      const primera = p.locator('[data-testid="mano"] .carta-mano').first();
      const carta = await primera.getAttribute('data-carta');
      await primera.click({ position: { x: 6, y: 6 } });
      await p.getByTestId('descartar').click();
      await expect(otro.getByTestId('monton')).toHaveAttribute('aria-label', /Robar del montón/);
      expect(carta).not.toBeNull();
    }
  }
  for (const p of [ana, luis])
    await expect(p.locator('[data-testid="mano"] .carta-mano')).toHaveCount(7);
  await expect(ana.getByTestId('asiento-1')).toContainText('Luis');
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
