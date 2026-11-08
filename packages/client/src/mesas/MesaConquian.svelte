<script lang="ts">
  import {
    PALOS_ESPANOLES,
    paloConquian,
    posicionConquian,
    type AccionConquian,
    type Asiento,
    type ConfigConquian,
    type EstadoConquian,
    type IdCarta,
    type VistaConquian,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AsientoRival from './bazas/AsientoRival.svelte';
  import { nombreNumerado } from './bazas/asientos';
  import ResumenConquian from './ResumenConquian.svelte';

  interface Props {
    sesion: SesionMesa<ConfigConquian, EstadoConquian, AccionConquian, VistaConquian>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const rival = $derived(1 - yo);
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, 2, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);

  const miTurno = $derived(vista.turno === yo && sesion.fin === null);
  const bajadas = (a: Asiento) =>
    (vista.combinaciones[a] ?? []).reduce((s, c) => s + c.length, 0);

  // ── Selección ──────────────────────────────────────────────────────────────

  let seleccion: IdCarta[] = $state([]);

  // La selección se vacía al cambiar de turno, de fase o de mano.
  $effect(() => {
    void vista.turno;
    void vista.fase;
    void vista.manoNumero;
    seleccion = [];
  });

  function jugar(accion: AccionConquian | undefined) {
    if (!accion) return;
    seleccion = [];
    sesion.jugar(accion);
  }

  const mismas = (a: readonly IdCarta[], b: readonly IdCarta[]) =>
    a.length === b.length && [...a].sort().join(',') === [...b].sort().join(',');

  const bajada = $derived(
    legales.find((a) => a.tipo === 'bajar' && mismas(a.cartas, seleccion)),
  );
  const anadido = (k: number) =>
    legales.find((a) => a.tipo === 'anadir' && a.combinacion === k && mismas(a.cartas, seleccion));
  const pase = $derived(legales.find((a) => a.tipo === 'pasar'));
  const descarte = $derived(
    seleccion.length === 1
      ? legales.find((a) => a.tipo === 'descartar' && a.carta === seleccion[0])
      : undefined,
  );

  function tocarCarta(c: IdCarta) {
    if (!miTurno) return;
    if (vista.fase === 'descartar') {
      // Un segundo toque en la carta elegida la descarta.
      if (seleccion.length === 1 && seleccion[0] === c) {
        jugar(legales.find((a) => a.tipo === 'descartar' && a.carta === c));
      } else seleccion = [c];
      return;
    }
    seleccion = seleccion.includes(c) ? seleccion.filter((x) => x !== c) : [...seleccion, c];
  }

  // ── Mano ordenada ──────────────────────────────────────────────────────────

  let orden: 'palo' | 'numero' = $state('palo');
  const mano = $derived(vista.miMano ?? []);
  const paloDe = (c: IdCarta) => PALOS_ESPANOLES.indexOf(paloConquian(c));
  const manoOrdenada = $derived(
    [...mano].sort((a, b) =>
      orden === 'palo'
        ? paloDe(a) - paloDe(b) || posicionConquian(a) - posicionConquian(b)
        : posicionConquian(a) - posicionConquian(b) || paloDe(a) - paloDe(b),
    ),
  );

  // ── Textos de estado ───────────────────────────────────────────────────────

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (vista.turno !== yo) return T.brisca.turnoDe(nombre(vista.turno));
    return vista.fase === 'descartar' ? T.conquian.faseDescartar : T.conquian.faseDecidir;
  });

  const rotulo = $derived.by(() => {
    if (vista.descubierta === null) return '';
    const de = vista.origen === 'mazo' ? T.conquian.delMazo : T.conquian.descarteDe(nombre(vista.deQuien));
    const para = vista.ofrecidaA === yo ? T.conquian.paraTi : T.conquian.para(nombre(vista.ofrecidaA));
    return `${de} · ${para}`;
  });

  // ── Resumen al terminar cada mano ──────────────────────────────────────────

  let resumen: number | null = $state(null);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      resumen = total - 1;
      sesion.pausar();
    }
    manosVistas = total;
  });

  function siguienteMano() {
    resumen = null;
    sesion.reanudar();
  }

  const decidiendo = $derived(miTurno && vista.fase === 'decidir');
</script>

<div class="conquian">
  <div class="info">
    <span data-testid="mano-conquian">{T.conquian.mano(vista.manoNumero)}</span>
    <span data-testid="ganadas">{T.conquian.ganadas(vista.ganadas[yo] ?? 0, vista.ganadas[rival] ?? 0)}</span>
    <span>{T.conquian.objetivo(vista.config.manosParaGanar)}</span>
  </div>

  <AsientoRival
    asiento={rival}
    lado="arriba"
    nombre={nombre(rival)}
    detalle={T.conquian.detalle(vista.cartasEnMano[rival] ?? 0, bajadas(rival))}
    cartas={vista.cartasEnMano[rival] ?? 0}
    activo={vista.turno === rival && sesion.fin === null}
  />

  <section class="combis rival" data-testid="combis-rival" aria-label={T.conquian.combinacionesDe(nombre(rival))}>
    {#each vista.combinaciones[rival] ?? [] as comb, k (k)}
      <div class="combi">
        {#each comb as carta (carta)}
          <div class="mini" data-carta={carta}><Carta id={carta} /></div>
        {/each}
      </div>
    {:else}
      <p class="vacio">{T.conquian.sinCombinaciones}</p>
    {/each}
  </section>

  <div class="centro">
    <div class="pila" data-testid="mazo" aria-label={T.conquian.mazo(vista.enMazo)}>
      {#if vista.enMazo > 0}<Carta />{/if}
      <span class="cuenta" aria-hidden="true">{vista.enMazo}</span>
    </div>
    <div class="descubierta" class:mia={decidiendo}>
      <div class="pila" data-testid="descubierta">
        {#if vista.descubierta}
          {#key vista.descubierta}
            <div class="arriba" data-carta={vista.descubierta}><Carta id={vista.descubierta} /></div>
          {/key}
        {/if}
      </div>
      <span class="rotulo" data-testid="rotulo-descubierta">{rotulo}</span>
    </div>
    {#if vista.muertas.length > 0}
      <div class="muertas" data-testid="muertas">
        <span class="mini"><Carta id={vista.muertas.at(-1)!} /></span>
        <span>{T.conquian.muertas(vista.muertas.length)}</span>
      </div>
    {/if}
  </div>

  <section class="combis mias" data-testid="combis-mias" aria-label={T.conquian.tusCombinaciones}>
    {#each vista.combinaciones[yo] ?? [] as comb, k (k)}
      {@const accion = decidiendo ? anadido(k) : undefined}
      <div
        class="combi"
        class:tocable={accion !== undefined}
        data-testid="combi-{k}"
        role="button"
        tabindex="-1"
        onclick={() => jugar(accion)}
        onkeydown={() => {}}
      >
        {#each comb as carta (carta)}
          <div class="mini" data-carta={carta}><Carta id={carta} /></div>
        {/each}
      </div>
    {:else}
      <p class="vacio">{T.conquian.sinCombinaciones}</p>
    {/each}
    <span class="bajadas" data-testid="bajadas">{T.conquian.bajadas(bajadas(yo))}</span>
  </section>

  <div class="propio" class:activo={miTurno}>
    <div class="estado">
      <span class="nombre">{T.brisca.tu}</span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
    </div>
    {#if decidiendo}
      <div class="botones">
        <button data-accion={bajada?.tipo} data-jugada={JSON.stringify(bajada)} class="principal" data-testid="bajar" disabled={!bajada} onclick={() => jugar(bajada)}>
          {T.conquian.bajar}
        </button>
        <button data-accion={pase?.tipo} data-jugada={JSON.stringify(pase)} data-testid="pasar" onclick={() => jugar(pase)}>{T.conquian.pasar}</button>
        {#if seleccion.length > 0}
          <button data-testid="limpiar" onclick={() => (seleccion = [])}>{T.remigio.limpiar}</button>
        {/if}
      </div>
    {:else if miTurno && vista.fase === 'descartar'}
      <div class="botones">
        <button data-accion={descarte?.tipo} data-jugada={JSON.stringify(descarte)} class="principal" data-testid="descartar" disabled={!descarte} onclick={() => jugar(descarte)}>
          {T.conquian.descartar}
        </button>
      </div>
    {/if}
    <div class="mano" data-testid="mano">
      {#each manoOrdenada as c (c)}
        <button
          class="carta-mano"
          class:seleccionada={seleccion.includes(c)}
          data-testid="mano-{c}"
          data-carta={c}
          aria-pressed={seleccion.includes(c)}
          onclick={() => tocarCarta(c)}
        >
          <Carta id={c} />
        </button>
      {/each}
    </div>
    <div class="pie">
      <label class="orden">
        {T.remigio.ordenar}
        <select bind:value={orden} data-testid="orden">
          <option value="palo">{T.remigio.porPalo}</option>
          <option value="numero">{T.remigio.porNumero}</option>
        </select>
      </label>
    </div>
  </div>
</div>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.conquian.finMano(resumen + 1)}</h2>
      <ResumenConquian resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.conquian.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .conquian {
    --ancho-carta: min(17vw, 9dvh, 72px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --ancho-rival: min(8vw, 5dvh, 40px);
    --ancho-mini: min(8vw, 5dvh, 38px);
    display: grid;
    grid-template-columns: 1fr;
    grid-template-areas:
      'info'
      'arriba'
      'rival'
      'centro'
      'mias'
      'abajo';
    gap: 6px;
    width: min(100%, 860px);
    min-height: calc(100dvh - 60px - var(--alto-asistente, 0px));
    margin: 0 auto;
    padding: 0 8px 12px;
    user-select: none;
    -webkit-user-select: none;
  }

  .info {
    grid-area: info;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px 14px;
    color: var(--texto-suave);
    font-size: 0.88rem;
  }

  .combis {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    align-content: flex-start;
    justify-content: center;
    gap: 8px 14px;
    min-height: calc(var(--ancho-mini) * 1.4 + 12px);
    max-height: 22dvh;
    overflow-y: auto;
    padding: 6px;
    border-radius: 10px;
    background: rgb(0 0 0 / 0.15);
  }

  .combis.rival {
    grid-area: rival;
  }

  .combis.mias {
    grid-area: mias;
  }

  .combi {
    display: flex;
    padding-right: calc(var(--ancho-mini) * 0.5);
    border-radius: 6px;
  }

  .combi .mini {
    margin-right: calc(var(--ancho-mini) * -0.5);
  }

  .combi.tocable {
    cursor: pointer;
    outline: 3px solid var(--resalte);
    outline-offset: 2px;
    box-shadow: 0 0 14px rgb(255 224 102 / 0.4);
  }

  .mini {
    position: relative;
    display: block;
    width: var(--ancho-mini);
    height: calc(var(--ancho-mini) * 1.4);
    flex-shrink: 0;
  }

  .vacio,
  .bajadas {
    margin: 0;
    font-size: 0.8rem;
    color: var(--texto-suave);
  }

  .centro {
    grid-area: centro;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px clamp(12px, 5vw, 32px);
    min-width: 0;
  }

  .pila {
    position: relative;
    flex: none;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    border-radius: 7%;
    outline: 2px dashed rgb(255 255 255 / 0.2);
    outline-offset: -2px;
  }

  .arriba {
    position: absolute;
    inset: 0;
  }

  .descubierta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .descubierta.mia .pila {
    outline: 3px solid var(--resalte);
    outline-offset: 2px;
    box-shadow: 0 0 18px rgb(255 224 102 / 0.45);
  }

  .rotulo {
    max-width: 40vw;
    font-size: 0.78rem;
    text-align: center;
    color: var(--texto-suave);
  }

  .muertas {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-size: 0.75rem;
    color: var(--texto-suave);
  }

  .cuenta {
    position: absolute;
    right: 3px;
    bottom: 3px;
    padding: 0 5px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    background: rgb(0 0 0 / 0.55);
  }

  .propio {
    grid-area: abajo;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .estado,
  .botones {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 10px;
  }

  .estado {
    min-height: 36px;
  }

  .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 600;
    background: rgb(0 0 0 / 0.2);
  }

  .activo .nombre {
    background: var(--acento);
    color: #2b2005;
  }

  .turno {
    font-weight: 600;
    text-align: center;
  }

  /* La mano se reparte en filas; cada carta tapa parte de la anterior y deja ver su índice. */
  .mano {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 6px;
    width: 100%;
    padding: 10px calc(var(--ancho-carta) * 0.55) 0 0;
  }

  .carta-mano {
    position: relative;
    width: calc(var(--ancho-carta) * 0.45);
    height: var(--alto-carta);
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    transition: translate 120ms;
  }

  .carta-mano :global(.carta) {
    position: absolute;
    left: 0;
    top: 0;
    width: var(--ancho-carta);
    height: var(--alto-carta);
  }

  .carta-mano.seleccionada {
    translate: 0 -10px;
  }

  .carta-mano.seleccionada :global(.carta) {
    outline: 3px solid var(--resalte);
    border-radius: 7%;
  }

  .pie {
    display: flex;
    justify-content: center;
    margin-top: 8px;
    font-size: 0.88rem;
    color: var(--texto-suave);
  }

  .orden select {
    margin-left: 6px;
    min-height: 34px;
    padding: 2px 6px;
    border-radius: 8px;
    background: rgb(0 0 0 / 0.3);
    border: 1px solid rgb(255 255 255 / 0.25);
  }

  .velo {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgb(0 0 0 / 0.5);
    z-index: 1500;
  }

  .dialogo {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: min(100%, 460px);
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
    padding: 18px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  .dialogo h2 {
    font-size: 1.2rem;
    margin: 0;
  }
</style>
