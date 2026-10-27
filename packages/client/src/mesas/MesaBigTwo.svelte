<script lang="ts">
  import {
    ordenarBigTwo,
    type AccionBigTwo,
    type Asiento,
    type ConfigBigTwo,
    type EstadoBigTwo,
    type IdCarta,
    type VistaBigTwo,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado } from './bazas/asientos';
  import ResumenBigTwo from './ResumenBigTwo.svelte';

  interface Props {
    sesion: SesionMesa<ConfigBigTwo, EstadoBigTwo, AccionBigTwo, VistaBigTwo>;
  }

  let { sesion }: Props = $props();

  const JUGADORES = 4;
  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  // Los rivales en el orden de juego, empezando por el siguiente al jugador.
  const rivales = $derived([1, 2, 3].map((i) => (yo + i) % JUGADORES));
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, JUGADORES, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);
  const activo = (asiento: Asiento) => vista.turno === asiento && sesion.fin === null;
  const miTurno = $derived(activo(yo) && !sesion.bloqueada);
  const mano = $derived(ordenarBigTwo(vista.miMano ?? []));

  /** Los que han pasado desde la última jugada de la mesa. */
  const pasaron = $derived.by(() => {
    const mesa = vista.mesa;
    if (mesa === null) return new Set<Asiento>();
    return new Set(
      Array.from({ length: vista.pasesSeguidos }, (_, i) => (mesa.asiento + 1 + i) % JUGADORES),
    );
  });

  // ── Marcar cartas y jugar ──────────────────────────────────────────────────

  let marcadas: IdCarta[] = $state([]);
  // Cada vez que cambia la mesa o el turno, la selección se vacía.
  $effect(() => {
    void vista.mesa;
    void vista.turno;
    void vista.resultadosManos.length;
    marcadas = [];
  });

  function tocar(c: IdCarta) {
    if (!miTurno) return;
    marcadas = marcadas.includes(c) ? marcadas.filter((x) => x !== c) : [...marcadas, c];
  }

  const clave = (cartas: readonly IdCarta[]) => ordenarBigTwo(cartas).join(',');
  /** La jugada legal que forman las cartas marcadas, si la forman. */
  const accionMarcada = $derived(
    marcadas.length === 0
      ? undefined
      : legales.find((a) => a.tipo === 'jugar' && clave(a.cartas) === clave(marcadas)),
  );
  const puedePasar = $derived(legales.some((a) => a.tipo === 'pasar'));
  /** Cartas que aparecen en alguna jugada legal: se marcan como jugables. */
  const jugables = $derived(new Set(legales.flatMap((a) => (a.tipo === 'jugar' ? a.cartas : []))));

  // ── Textos ─────────────────────────────────────────────────────────────────

  const turnoTexto = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (sesion.bloqueada) return '';
    if (vista.turno !== yo) return T.brisca.turnoDe(nombre(vista.turno));
    if (vista.mesa !== null) return T.bigTwo.tuTurno;
    return vista.primera ? T.bigTwo.tuSalidaTres : T.bigTwo.tuSalida;
  });

  const aviso = $derived.by(() => {
    const hecha = vista.ultimaAccion;
    if (hecha === null || sesion.fin !== null) return null;
    const quien = nombre(hecha.asiento);
    if (hecha.accion.tipo === 'pasar') return T.bigTwo.pasaAviso(quien);
    const mesa = vista.mesa;
    const tipo =
      mesa && mesa.asiento === hecha.asiento ? (T.bigTwo.tipos[mesa.tipo] ?? '') : null;
    return tipo === null ? null : T.bigTwo.juega(quien, tipo);
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

<div class="big-two" bind:this={raiz}>
  <div class="rivales">
    {#each rivales as asiento (asiento)}
      <div class="rival" class:activo={activo(asiento)} data-testid="asiento-{asiento}" data-zona="mano-{asiento}">
        <span class="dorso"><Carta /></span>
        <span class="datos">
          <b>{nombre(asiento)}</b>
          <small data-testid="cartas-{asiento}">{T.bigTwo.cartas(vista.cartasEnMano[asiento] ?? 0)}</small>
          <small>{T.bigTwo.puntos(vista.totales[asiento] ?? 0)}</small>
          {#if pasaron.has(asiento)}
            <small class="pasa" data-testid="pasa-{asiento}">{T.bigTwo.pasa}</small>
          {/if}
        </span>
      </div>
    {/each}
  </div>

  <div class="mesa" data-testid="mesa" aria-label={T.bigTwo.mesa}>
    {#if vista.mesa}
      <p class="tipo" data-testid="tipo-mesa">
        {T.bigTwo.deQuien(T.bigTwo.tipos[vista.mesa.tipo] ?? '', nombre(vista.mesa.asiento))}
      </p>
      <div class="jugada" data-testid="jugada-mesa">
        {#each vista.mesa.cartas as c (c)}
          <div class="en-mesa" data-carta={c} data-desde="mano-{vista.mesa.asiento}"><Carta id={c} /></div>
        {/each}
      </div>
    {:else}
      <p class="vacia">{T.bigTwo.mesaVacia}</p>
    {/if}
  </div>

  {#if aviso}
    <p class="aviso" role="status" data-testid="aviso">{aviso}</p>
  {/if}

  <section class="propio" class:activo={activo(yo)} style:--en-mano={Math.max(1, mano.length)}>
    <div class="estado">
      <span class="nombre">
        {T.brisca.tu}
        <small>{T.bigTwo.puntos(vista.totales[yo] ?? 0)}</small>
      </span>
      <span class="turno" role="status" data-testid="turno">{turnoTexto}</span>
    </div>
    {#if miTurno}
      <div class="botones">
        {#if puedePasar}
          <button data-testid="paso" onclick={() => sesion.jugar({ tipo: 'pasar' })}>{T.bigTwo.paso}</button>
        {/if}
        <button
          class="principal"
          data-testid="jugar"
          disabled={!accionMarcada}
          onclick={() => accionMarcada && sesion.jugar(accionMarcada)}>{T.bigTwo.jugar}</button
        >
      </div>
    {/if}
    <div class="mano" data-testid="mano">
      {#each mano as c (c)}
        <button
          class="carta-mano"
          class:seleccionada={marcadas.includes(c)}
          class:jugable={miTurno && jugables.has(c)}
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
      <h2 id="fin-mano">{T.bigTwo.finMano(resumen + 1)}</h2>
      <ResumenBigTwo resultado={vista.resultadosManos[resumen]!} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.bigTwo.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .big-two {
    --ancho-mesa: min(15vw, 10dvh, 80px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: min(100%, 860px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
  }

  .rivales {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
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

  .datos .pasa {
    font-weight: 700;
    opacity: 1;
  }

  .mesa {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    min-height: calc(var(--ancho-mesa) * 1.4 + 56px);
    padding: 10px;
    border-radius: 18px;
    background: rgb(0 0 0 / 0.12);
  }

  .tipo {
    margin: 0;
    font-weight: 700;
  }

  .vacia {
    margin: 0;
    color: var(--texto-suave);
  }

  .jugada {
    display: flex;
    gap: 4px;
  }

  .en-mesa {
    width: var(--ancho-mesa);
    aspect-ratio: 100 / 140;
  }

  .aviso {
    margin: 0;
    padding: 4px 12px;
    border-radius: 14px;
    font-size: 0.9rem;
    font-weight: 600;
    background: rgb(0 0 0 / 0.3);
  }

  .propio {
    /* Las 13 cartas caben en dos filas como mucho: cada una deja a la vista un 45 %. */
    --ancho-carta: min(19vw, 12dvh, 92px);
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
  }

  .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 600;
    background: rgb(0 0 0 / 0.2);
  }

  .nombre small {
    font-weight: 400;
    color: var(--texto-suave);
    margin-left: 4px;
  }

  .activo .nombre {
    background: var(--acento);
    color: #2b2005;
  }

  .activo .nombre small {
    color: #5b4a12;
  }

  .turno {
    font-weight: 600;
  }

  .botones {
    display: flex;
    gap: 8px;
  }

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
    padding: 16px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  .dialogo h2 {
    font-size: 1.2rem;
    margin-bottom: 6px;
  }

  .dialogo > button {
    margin-top: 14px;
    width: 100%;
  }
</style>
