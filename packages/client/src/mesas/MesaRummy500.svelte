<script lang="ts">
  import {
    cartaDeId,
    PALOS_FRANCESES,
    type AccionRummy500,
    type Asiento,
    type CombinacionRummy500,
    type ConfigRummy500,
    type EstadoRummy500,
    type IdCarta,
    type VistaRummy500,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AsientoRival from './bazas/AsientoRival.svelte';
  import { lado, nombreNumerado } from './bazas/asientos';
  import ResumenRummy500 from './ResumenRummy500.svelte';

  interface Props {
    sesion: SesionMesa<ConfigRummy500, EstadoRummy500, AccionRummy500, VistaRummy500>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  const rivales = $derived(Array.from({ length: n }, (_, a) => a).filter((a) => a !== yo));
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);

  const miTurno = $derived(vista.turno === yo && sesion.fin === null);
  const nombreDe = (c: IdCarta) => nombreCarta(c).toLowerCase();

  /** Un color por jugador para marcar quién puso cada carta en la mesa. */
  const COLORES = ['#f2c14e', '#52b788', '#6aa9ff', '#ff8fab'];

  // ── Selección ──────────────────────────────────────────────────────────────

  let seleccion: IdCarta[] = $state([]);
  let aviso: string | null = $state(null);

  // La selección se vacía al cambiar de turno, de fase o de mano.
  $effect(() => {
    void vista.turno;
    void vista.fase;
    void vista.numeroMano;
    seleccion = [];
  });

  function tocarCarta(c: IdCarta) {
    if (!miTurno || vista.fase !== 'bajar') return;
    aviso = null;
    seleccion = seleccion.includes(c) ? seleccion.filter((x) => x !== c) : [...seleccion, c];
  }

  function jugar(accion: AccionRummy500 | undefined) {
    if (!accion) return;
    seleccion = [];
    opciones = null;
    aviso = null;
    sesion.jugar(accion);
  }

  const mismas = (a: readonly IdCarta[], b: readonly IdCarta[]) =>
    a.length === b.length && [...a].sort().join(',') === [...b].sort().join(',');

  const bajada = $derived(
    seleccion.length >= 3
      ? legales.find((a) => a.tipo === 'bajar' && mismas(a.cartas, seleccion))
      : undefined,
  );

  const descarte = $derived(
    seleccion.length === 1
      ? legales.find((a) => a.tipo === 'descartar' && a.carta === seleccion[0])
      : undefined,
  );

  // ── Añadir: con una carta elegida, tocar una combinación ───────────────────

  let opciones: { texto: string; hacer: () => void }[] | null = $state(null);

  function tocarCombinacion(c: CombinacionRummy500) {
    if (!miTurno || vista.fase !== 'bajar' || seleccion.length !== 1) return;
    const posibles = legales.filter(
      (a) => a.tipo === 'anadir' && a.combinacion === c.id && a.carta === seleccion[0],
    );
    if (posibles.length === 0) aviso = T.rummy500.noEncaja;
    else if (posibles.length === 1) jugar(posibles[0]);
    else {
      // Un As que cabe abajo y arriba de una escalera del 2 a la K.
      opciones = posibles.map((a) => ({
        texto: a.tipo === 'anadir' && a.arriba ? T.rummy500.arriba : T.rummy500.abajo,
        hacer: () => jugar(a),
      }));
    }
  }

  // ── Robar ──────────────────────────────────────────────────────────────────

  const roboMazo = $derived(legales.find((a) => a.tipo === 'robarMazo'));
  const roboDesde = (i: number) =>
    legales.find((a) => a.tipo === 'robarDescarte' && a.desde === i);

  // ── Mano ordenada ──────────────────────────────────────────────────────────

  let orden: 'palo' | 'numero' = $state('palo');
  const mano = $derived(vista.miMano ?? []);
  const paloDe = (c: IdCarta) =>
    PALOS_FRANCESES.indexOf(cartaDeId(c)!.palo as (typeof PALOS_FRANCESES)[number]);
  const valorDe = (c: IdCarta) => cartaDeId(c)!.valor;
  const manoOrdenada = $derived(
    [...mano].sort((a, b) =>
      orden === 'palo'
        ? paloDe(a) - paloDe(b) || valorDe(a) - valorDe(b)
        : valorDe(a) - valorDe(b) || paloDe(a) - paloDe(b),
    ),
  );

  // ── Textos de estado ───────────────────────────────────────────────────────

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (vista.turno !== yo) return T.brisca.turnoDe(nombre(vista.turno));
    if (vista.fase === 'robar') return T.rummy500.faseRobar;
    if (vista.obligada !== null) return T.rummy500.usaObligada(nombreDe(vista.obligada));
    return T.rummy500.faseBajar;
  });

  const avisoRival = $derived.by(() => {
    const u = vista.ultimaAccion;
    if (u === null || u.asiento === yo) return null;
    const quien = nombre(u.asiento);
    switch (u.tipo) {
      case 'robarMazo':
        return T.rummy500.roba(quien);
      case 'robarDescarte':
        return T.rummy500.coge(quien, u.cartas.length);
      case 'bajar':
        return T.rummy500.baja(quien);
      case 'anadir':
        return T.rummy500.anade(quien, nombreDe(u.cartas[0]!));
      default:
        return T.rummy500.descarta(quien, nombreDe(u.cartas[0]!));
    }
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

  const tocables = $derived(miTurno && vista.fase === 'bajar' && seleccion.length === 1);
</script>

<div class="rummy" class:muchos={n >= 4}>
  <div class="info">
    {#each [yo, ...rivales] as a (a)}
      <span data-testid="puntos-{a}">
        <i class="punto" style:background={COLORES[a]}></i>{nombre(a)}: {T.rummy500.puntos(vista.puntos[a] ?? 0)}
      </span>
    {/each}
    <span>{T.rummy500.objetivo} · {T.rummy500.mano(vista.numeroMano)}</span>
  </div>

  {#each rivales as asiento (asiento)}
    <AsientoRival
      {asiento}
      lado={lado(asiento, n, yo)}
      nombre={nombre(asiento)}
      detalle={T.rummy500.detalle(vista.cartasEnMano[asiento] ?? 0, vista.puntos[asiento] ?? 0)}
      cartas={Math.min(vista.cartasEnMano[asiento] ?? 0, 8)}
      activo={vista.turno === asiento && sesion.fin === null}
    />
  {/each}

  <div class="centro">
    <div
      class="pila"
      class:robable={roboMazo !== undefined}
      data-testid="mazo"
      role="button"
      tabindex="-1"
      aria-label={T.rummy500.robarMazo}
      onclick={() => jugar(roboMazo)}
      onkeydown={() => {}}
    >
      {#if vista.mazo > 0}<Carta />{/if}
      <span class="cuenta" aria-hidden="true">{vista.mazo}</span>
    </div>
    <div class="descarte" data-testid="descarte" aria-label={T.rummy500.descarte}>
      {#each vista.descarte as carta, i (carta)}
        {@const robo = roboDesde(i)}
        <button
          class="carta-descarte"
          class:robable={robo !== undefined}
          data-testid="descarte-{i}"
          data-carta={carta}
          disabled={robo === undefined}
          aria-label={T.rummy500.cogerDesde(nombreDe(carta), vista.descarte.length - i)}
          onclick={() => jugar(robo)}
        >
          <Carta id={carta} />
        </button>
      {:else}
        <p class="vacio">{T.rummy500.descarteVacio}</p>
      {/each}
    </div>
    {#if aviso}
      <p class="aviso" role="status" data-testid="aviso-rummy">{aviso}</p>
    {:else if avisoRival}
      <p class="aviso" role="status" data-testid="aviso">{avisoRival}</p>
    {/if}
  </div>

  <section class="mesa-combis" data-testid="mesa-combis" aria-label={T.rummy500.mesa}>
    {#each vista.combinaciones as c (c.id)}
      <div
        class="combi"
        class:tocable={tocables}
        data-testid="combi-{c.id}"
        role="button"
        tabindex="-1"
        onclick={() => tocarCombinacion(c)}
        onkeydown={() => {}}
      >
        {#each c.cartas as { carta, de } (carta)}
          <div class="mini" data-carta={carta} data-de={de}>
            <Carta id={carta} />
            <i class="punto marca" style:background={COLORES[de]}></i>
          </div>
        {/each}
      </div>
    {:else}
      <p class="vacio">{T.rummy500.sinCombinaciones}</p>
    {/each}
  </section>

  <div class="propio" class:activo={miTurno}>
    <div class="estado">
      <span class="nombre"><i class="punto" style:background={COLORES[yo]}></i>{T.brisca.tu}</span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
    </div>
    {#if miTurno && vista.fase === 'bajar'}
      <div class="botones">
        <button class="principal" data-testid="bajar" disabled={!bajada} onclick={() => jugar(bajada)}>
          {T.rummy500.bajar}
        </button>
        <button data-testid="descartar" disabled={!descarte} onclick={() => jugar(descarte)}>{T.rummy500.descartar}</button>
        {#if seleccion.length > 0}
          <button data-testid="limpiar" onclick={() => (seleccion = [])}>{T.rummy500.limpiar}</button>
        {/if}
      </div>
    {/if}
    <div class="mano" data-testid="mano">
      {#each manoOrdenada as c (c)}
        <button
          class="carta-mano"
          class:seleccionada={seleccion.includes(c)}
          class:obligada={vista.obligada === c}
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

{#if opciones}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="opciones-titulo" data-testid="opciones-as">
      <h2 id="opciones-titulo">{T.rummy500.dondeAs}</h2>
      {#each opciones as o, i (i)}
        <button class="principal" data-testid="opcion-{i}" onclick={o.hacer}>{o.texto}</button>
      {/each}
      <button onclick={() => (opciones = null)}>{T.remigio.cancelar}</button>
    </div>
  </div>
{/if}

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.rummy500.finMano(resumen + 1)}</h2>
      <ResumenRummy500 resultado={vista.resultadosManos[resumen]!} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.rummy500.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .rummy {
    --ancho-carta: min(15vw, 9dvh, 70px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --ancho-rival: min(8vw, 5dvh, 40px);
    --ancho-mini: min(8vw, 5dvh, 38px);
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto auto auto auto;
    grid-template-areas:
      'info info info'
      'arriba arriba arriba'
      'izquierda centro derecha'
      'combis combis combis'
      'abajo abajo abajo';
    gap: 6px;
    width: min(100%, 900px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    user-select: none;
    -webkit-user-select: none;
  }

  /* Con 4 jugadores, los rivales de arriba comparten la fila. */
  .rummy.muchos {
    --ancho-rival: min(6vw, 4dvh, 32px);
  }

  .rummy :global(.asiento.arriba-izquierda),
  .rummy :global(.asiento.arriba-derecha) {
    grid-area: arriba;
  }

  .rummy :global(.asiento.arriba-izquierda) {
    justify-self: start;
  }

  .rummy :global(.asiento.arriba-derecha) {
    justify-self: end;
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

  .punto {
    display: inline-block;
    width: 9px;
    height: 9px;
    margin-right: 4px;
    border-radius: 50%;
    vertical-align: middle;
  }

  .centro {
    grid-area: centro;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px 12px;
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

  .pila.robable {
    cursor: pointer;
    outline: 3px solid rgb(255 224 102 / 0.7);
    outline-offset: 2px;
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

  /* El descarte abierto en abanico: cada carta deja ver su índice. */
  .descarte {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    min-width: 0;
    max-width: 100%;
    padding-right: calc(var(--ancho-mini) * 0.55);
    row-gap: 4px;
  }

  .carta-descarte {
    position: relative;
    width: calc(var(--ancho-mini) * 0.45);
    height: calc(var(--ancho-mini) * 1.4);
    min-height: 0;
    padding: 0;
    border: 0;
    background: none;
  }

  .carta-descarte :global(.carta) {
    position: absolute;
    left: 0;
    top: 0;
    width: var(--ancho-mini);
    height: calc(var(--ancho-mini) * 1.4);
  }

  .carta-descarte:disabled {
    opacity: 1;
    cursor: default;
  }

  .carta-descarte.robable {
    cursor: pointer;
  }

  .carta-descarte.robable :global(.carta) {
    outline: 2px solid rgb(255 224 102 / 0.75);
    border-radius: 7%;
  }

  .aviso {
    flex-basis: 100%;
    margin: 0;
    padding: 4px 12px;
    border-radius: 14px;
    font-size: 0.9rem;
    text-align: center;
    background: rgb(0 0 0 / 0.35);
  }

  .mesa-combis {
    grid-area: combis;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 8px 14px;
    max-height: 32dvh;
    overflow-y: auto;
    padding: 6px;
    border-radius: 10px;
    background: rgb(0 0 0 / 0.15);
  }

  .vacio {
    margin: 0;
    font-size: 0.8rem;
    color: var(--texto-suave);
  }

  .combi {
    display: flex;
    padding-right: calc(var(--ancho-mini) * 0.5);
    border-radius: 6px;
  }

  .mini {
    position: relative;
    width: var(--ancho-mini);
    height: calc(var(--ancho-mini) * 1.4);
    flex-shrink: 0;
  }

  .combi .mini {
    margin-right: calc(var(--ancho-mini) * -0.5);
  }

  .marca {
    position: absolute;
    left: 2px;
    bottom: 2px;
    margin: 0;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 0.5);
  }

  .combi.tocable {
    cursor: pointer;
    outline: 2px solid rgb(255 224 102 / 0.6);
    outline-offset: 2px;
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

  .carta-mano.obligada :global(.carta) {
    box-shadow: 0 0 0 3px var(--peligro);
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
