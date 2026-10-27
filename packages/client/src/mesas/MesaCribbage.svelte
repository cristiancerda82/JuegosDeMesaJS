<script lang="ts">
  import {
    PUNTOS_PARTIDA_CRIBBAGE,
    rangoCribbage,
    type AccionCribbage,
    type Asiento,
    type ConfigCribbage,
    type EstadoCribbage,
    type IdCarta,
    type VistaCribbage,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado } from './bazas/asientos';
  import ResumenCribbage from './ResumenCribbage.svelte';

  interface Props {
    sesion: SesionMesa<ConfigCribbage, EstadoCribbage, AccionCribbage, VistaCribbage>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const rival = $derived(1 - yo);
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, 2, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);
  const activo = (asiento: Asiento) => vista.turno === asiento && sesion.fin === null;
  const miTurno = $derived(activo(yo) && !sesion.bloqueada);
  const PALOS = ['picas', 'corazones', 'treboles', 'diamantes'];
  const mano = $derived(
    [...(vista.miMano ?? [])].sort(
      (a, b) =>
        rangoCribbage(a) - rangoCribbage(b) ||
        PALOS.indexOf(a.split('-')[0]!) - PALOS.indexOf(b.split('-')[0]!),
    ),
  );

  // ── Echar al crib y jugar ──────────────────────────────────────────────────

  let marcadas: IdCarta[] = $state([]);
  $effect(() => {
    void vista.fase;
    void vista.turno;
    void vista.resultadosManos.length;
    marcadas = [];
  });

  const echando = $derived(vista.fase === 'descarte');
  const jugadaDe = (c: IdCarta) =>
    legales.find((a) => a.tipo === 'jugar' && a.carta === c) ?? null;
  const jugable = (c: IdCarta) => miTurno && (echando || jugadaDe(c) !== null);
  const soloGo = $derived(legales.length === 1 && legales[0]!.tipo === 'go');

  function tocar(c: IdCarta) {
    if (!miTurno) return;
    if (echando) {
      marcadas = marcadas.includes(c)
        ? marcadas.filter((x) => x !== c)
        : [...marcadas, c].slice(-2);
      return;
    }
    if (jugadaDe(c)) marcadas = marcadas[0] === c ? [] : [c];
  }

  const clave = (cartas: readonly IdCarta[]) => [...cartas].sort().join(',');
  const echar = $derived(
    echando && marcadas.length === 2
      ? legales.find((a) => a.tipo === 'echar' && clave(a.cartas) === clave(marcadas))
      : undefined,
  );

  function tocarMesa() {
    const c = marcadas[0];
    if (echando || c === undefined) return;
    const accion = jugadaDe(c);
    if (accion) sesion.jugar(accion);
  }

  // ── Textos ─────────────────────────────────────────────────────────────────

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (sesion.bloqueada) return '';
    if (vista.turno !== yo) return T.brisca.turnoDe(nombre(vista.turno));
    if (echando) return T.cribbage.echa;
    return soloGo ? T.cribbage.sinCarta : T.cribbage.tuTurno;
  });

  const aviso = $derived.by(() => {
    const hecha = vista.ultimaAccion;
    if (hecha === null || sesion.fin !== null) return null;
    const quien = nombre(hecha.asiento);
    const a = hecha.accion;
    const texto =
      a.tipo === 'echar'
        ? T.cribbage.echaAviso(quien)
        : a.tipo === 'go'
          ? T.cribbage.dice(quien)
          : T.cribbage.juega(quien, nombreCarta(a.carta).toLowerCase());
    // Los puntos pueden ser de quien hizo la acción o, en un go, del último que jugó.
    const n = hecha.puntos.reduce((s, p) => s + p.puntos, 0);
    if (n === 0) return texto;
    const motivos = hecha.puntos.map((p) => T.cribbage.motivos[p.motivo] ?? p.motivo).join(', ');
    const anota = a.tipo === 'go' ? (vista.ultimoEnJugar ?? hecha.asiento) : hecha.asiento;
    return `${texto} · ${T.cribbage.anota(nombre(anota), motivos, n)}`;
  });

  // ── Recuento al terminar cada mano ─────────────────────────────────────────

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

  // ── Animación ──────────────────────────────────────────────────────────────

  let raiz: HTMLElement | undefined = $state();
  let previas: Posiciones = new Map();
  $effect.pre(() => {
    void vista;
    if (raiz) previas = medir(raiz);
  });
  $effect(() => {
    void vista;
    if (raiz) animar(raiz, previas);
  });
</script>

<div class="cribbage" bind:this={raiz}>
  <div class="tablero" data-testid="tablero">
    {#each [yo, rival] as a, i (a)}
      <div class="fila-tablero">
        <span class="quien">{nombre(a)}</span>
        <span class="barra">
          <span
            class="avance"
            class:mio={i === 0}
            style:width="{Math.min(100, (vista.puntos[a]! / PUNTOS_PARTIDA_CRIBBAGE) * 100)}%"
          ></span>
        </span>
        <b class="valor" data-testid="puntos-{i}">{vista.puntos[a]}</b>
      </div>
    {/each}
  </div>

  <div class="rival" class:activo={activo(rival)} data-testid="asiento-{rival}" data-zona="mano-{rival}">
    <span class="dorso"><Carta /></span>
    <span class="datos">
      <b>{nombre(rival)}</b>
      <small data-testid="cartas-{rival}">{T.cribbage.cartas(vista.cartasEnMano[rival] ?? 0)}</small>
      {#if vista.repartidor === rival}<small class="reparte">{T.cribbage.reparte}</small>{/if}
    </span>
  </div>

  <div class="centro">
    <div class="lado">
      <div class="pila">
        {#if vista.starter}
          <div class="starter" data-testid="starter" data-carta={vista.starter}><Carta id={vista.starter} /></div>
        {:else}
          <div class="starter"><Carta /></div>
        {/if}
        <small>{T.cribbage.starter}</small>
      </div>
      <div class="pila">
        <div class="crib" data-testid="crib">
          {#if vista.cartasEnCrib > 0}<Carta />{/if}
          <span class="cuenta-crib">{vista.cartasEnCrib}</span>
        </div>
        <small>{T.cribbage.cribDe(nombre(vista.repartidor))}</small>
      </div>
    </div>

    <div
      class="mesa"
      class:legal={!echando && marcadas.length === 1}
      data-testid="mesa"
      aria-label={T.cribbage.mesa}
      role="button"
      tabindex="-1"
      onclick={tocarMesa}
      onkeydown={() => {}}
    >
      {#if vista.fase === 'juego'}
        <b class="cuenta" data-testid="cuenta">{T.cribbage.cuenta(vista.cuenta)}</b>
      {/if}
      <div class="secuencia">
        {#each vista.secuencia as c (c)}
          <div class="jugada" data-carta={c}><Carta id={c} /></div>
        {/each}
      </div>
    </div>
  </div>

  {#if aviso}
    <p class="aviso" role="status" data-testid="aviso">{aviso}</p>
  {/if}

  <section class="propio" class:activo={activo(yo)}>
    <div class="estado">
      <span class="nombre">
        {T.brisca.tu}
        {#if vista.repartidor === yo}<small>{T.cribbage.reparte}</small>{/if}
      </span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
      {#if miTurno && echando}
        <button class="principal" data-testid="al-crib" disabled={!echar} onclick={() => echar && sesion.jugar(echar)}>
          {T.cribbage.alCrib}
        </button>
      {/if}
      {#if miTurno && soloGo}
        <button class="principal" data-testid="go" onclick={() => sesion.jugar({ tipo: 'go' })}>{T.cribbage.go}</button>
      {/if}
    </div>
    <div class="mano" data-testid="mano">
      {#each mano as c (c)}
        <button
          class="carta-mano"
          class:jugable={jugable(c)}
          class:seleccionada={marcadas.includes(c)}
          data-testid="mano-{c}"
          data-carta={c}
          aria-pressed={marcadas.includes(c)}
          disabled={!miTurno}
          onclick={() => tocar(c)}
        >
          <Carta id={c} />
        </button>
      {/each}
    </div>
  </section>
</div>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.cribbage.finMano(resumen + 1)}</h2>
      <ResumenCribbage resultado={vista.resultadosManos[resumen]!} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.cribbage.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .cribbage {
    --ancho-mesa: min(14vw, 9dvh, 72px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: min(100%, 760px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
  }

  .tablero {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    padding: 6px 10px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.2);
  }

  .fila-tablero {
    display: grid;
    grid-template-columns: 5.5em 1fr 2.5em;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
  }

  .barra {
    height: 10px;
    border-radius: 5px;
    background: rgb(255 255 255 / 0.12);
    overflow: hidden;
  }

  .avance {
    display: block;
    height: 100%;
    background: var(--texto-suave);
    transition: width 300ms;
  }

  .avance.mio {
    background: var(--acento);
  }

  .valor {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .rival {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px 4px 4px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.2);
  }

  .rival.activo {
    background: var(--acento);
    color: #2b2005;
  }

  .rival .dorso {
    width: 26px;
    aspect-ratio: 100 / 140;
  }

  .datos {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }

  .datos small {
    font-size: 0.75rem;
    opacity: 0.85;
  }

  .reparte {
    font-weight: 700;
  }

  .centro {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .lado {
    flex: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pila {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-size: 0.72rem;
    color: var(--texto-suave);
  }

  .starter,
  .crib {
    position: relative;
    width: calc(var(--ancho-mesa) * 0.8);
    aspect-ratio: 100 / 140;
  }

  .crib {
    border-radius: 7%;
    outline: 1px dashed rgb(255 255 255 / 0.25);
  }

  .cuenta-crib {
    position: absolute;
    right: 3px;
    bottom: 3px;
    padding: 0 5px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--texto);
    background: rgb(0 0 0 / 0.55);
  }

  .mesa {
    flex: 1;
    min-width: 0;
    min-height: calc(var(--ancho-mesa) * 1.4 + 50px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px;
    border-radius: 18px;
    background: rgb(0 0 0 / 0.12);
    outline: 2px dashed rgb(255 255 255 / 0.15);
    outline-offset: -2px;
  }

  .mesa.legal {
    outline: 3px solid var(--resalte);
    box-shadow: 0 0 18px rgb(255 224 102 / 0.45);
  }

  .cuenta {
    font-size: 1.1rem;
  }

  .secuencia {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .jugada {
    width: calc(var(--ancho-mesa) * 0.55);
    height: calc(var(--ancho-mesa) * 1.4);
    overflow: visible;
  }

  .jugada :global(.carta) {
    width: var(--ancho-mesa);
  }

  .aviso {
    margin: 0;
    padding: 4px 12px;
    border-radius: 14px;
    font-size: 0.9rem;
    font-weight: 600;
    text-align: center;
    background: rgb(0 0 0 / 0.3);
  }

  .propio {
    --ancho-carta: min(19vw, 13dvh, 96px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 100%;
    margin-top: auto;
  }

  .estado {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 12px;
    min-height: 44px;
  }

  .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 600;
    background: rgb(0 0 0 / 0.2);
  }

  .nombre small {
    margin-left: 4px;
    font-weight: 700;
  }

  .activo .nombre {
    background: var(--acento);
    color: #2b2005;
  }

  .turno {
    font-weight: 600;
  }

  .mano {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 10px calc(var(--ancho-carta) * 0.35) 0 0;
  }

  .carta-mano {
    position: relative;
    width: calc(var(--ancho-carta) * 0.65);
    height: var(--alto-carta);
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    transition: translate 120ms;
  }

  .carta-mano:disabled {
    opacity: 1;
    cursor: default;
  }

  .carta-mano :global(.carta) {
    position: absolute;
    top: 0;
    left: 0;
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
    width: min(100%, 440px);
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
    padding: 14px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  .dialogo h2 {
    font-size: 1.15rem;
    margin-bottom: 6px;
  }

  .dialogo > button {
    margin-top: 12px;
    width: 100%;
  }
</style>
