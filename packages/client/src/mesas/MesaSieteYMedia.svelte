<script lang="ts">
  import type {
    AccionSieteYMedia,
    Asiento,
    ConfigSieteYMedia,
    EstadoSieteYMedia,
    VistaSieteYMedia,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { lado as ladoBazas, nombreNumerado, relativo, type Lado } from './bazas/asientos';
  import ResultadoSieteYMedia from './ResultadoSieteYMedia.svelte';

  interface Props {
    sesion: SesionMesa<ConfigSieteYMedia, EstadoSieteYMedia, AccionSieteYMedia, VistaSieteYMedia>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  const rivales = $derived(Array.from({ length: n }, (_, a) => a).filter((a) => a !== yo));

  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);
  const lado = (asiento: Asiento): Lado =>
    n === 3
      ? (['abajo', 'derecha', 'arriba'] as const)[relativo(asiento, n, yo)]!
      : ladoBazas(asiento, n, yo);
  const activo = (asiento: Asiento) => vista.turno === asiento && sesion.fin === null;

  // ── Controles ──────────────────────────────────────────────────────────────

  const apuestasLegales = $derived(
    legales.flatMap((a) => (a.tipo === 'apostar' ? [a.fichas] : [])),
  );
  const maxApuesta = $derived(Math.max(0, ...apuestasLegales));
  let apuesta = $state(5);
  const apuestaValida = $derived(Math.min(Math.max(apuesta, 1), Math.max(maxApuesta, 1)));
  const puedePedir = $derived(legales.some((a) => a.tipo === 'pedir'));
  const puedePlantarse = $derived(legales.some((a) => a.tipo === 'plantarse'));

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (sesion.bloqueada) return '';
    if (vista.turno === yo) {
      return vista.fase === 'apostar' ? T.sieteYMedia.faseApostar : T.sieteYMedia.faseJugar;
    }
    if (vista.fase === 'apostar' && vista.banca === yo) return T.sieteYMedia.esperaApuestas;
    return T.brisca.turnoDe(nombre(vista.turno));
  });

  /** Lo último que hizo alguien, para seguir la mano. */
  const aviso = $derived.by(() => {
    const a = vista.ultimaAccion;
    if (a === null || sesion.fin !== null) return null;
    const quien = nombre(a.asiento);
    if (a.tipo === 'apostar') return T.sieteYMedia.apuesta1(quien, a.fichas);
    if (a.tipo === 'plantarse') return T.sieteYMedia.planta(quien);
    return a.pasado ? T.sieteYMedia.sePasa(quien) : T.sieteYMedia.pide(quien);
  });

  const detalle = (asiento: Asiento) => {
    const partes = [T.sieteYMedia.fichas(vista.fichas[asiento]!)];
    const apostado = vista.apuestas[asiento];
    if (apostado !== null && apostado !== undefined) partes.push(T.sieteYMedia.apuesta(apostado));
    return partes.join(' · ');
  };

  const estadoJugada = (asiento: Asiento) =>
    vista.cartas[asiento]!.length === 0
      ? null
      : vista.estados[asiento] === 'pasado'
        ? T.sieteYMedia.pasado
        : vista.estados[asiento] === 'plantado'
          ? T.sieteYMedia.plantado
          : null;

  // ── Resultado al terminar cada mano ────────────────────────────────────────

  let resultado: number | null = $state(null);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      resultado = total - 1;
      sesion.pausar();
    }
    manosVistas = total;
  });

  function siguienteMano() {
    resultado = null;
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

<div class="siete" class:cuatro={n === 4} bind:this={raiz}>
  <div class="info">
    <span>{T.sieteYMedia.banca}: <b data-testid="banca">{nombre(vista.banca)}</b></span>
    <span>{T.chinchon.mazo}: {T.sieteYMedia.mazo(vista.mazo)}</span>
  </div>

  {#each rivales as asiento (asiento)}
    <div class="asiento {lado(asiento)}" class:activo={activo(asiento)} data-testid="asiento-{asiento}">
      <div class="nombre">
        {nombre(asiento)}
        {#if asiento === vista.banca}<span class="marca">{T.sieteYMedia.banca}</span>{/if}
        <small>{detalle(asiento)}</small>
      </div>
      <div class="jugada-rival" data-zona="mano-{asiento}">
        {#each vista.cartas[asiento]! as id, k (id ?? `tapada-${k}`)}
          <div class="mini" data-carta={id ?? undefined}><Carta {id} /></div>
        {/each}
      </div>
      {#if estadoJugada(asiento)}
        <span class="estado" class:pasado={vista.estados[asiento] === 'pasado'}>{estadoJugada(asiento)}</span>
      {/if}
    </div>
  {/each}

  <div class="centro">
    <div class="mazo" data-zona="mazo" data-testid="mazo">
      {#if vista.mazo > 0}<Carta />{/if}
    </div>
    {#if aviso}
      <p class="aviso" role="status" data-testid="aviso">{aviso}</p>
    {/if}
  </div>

  <div class="propio" class:activo={activo(yo)}>
    <div class="estado-propio">
      <span class="nombre">
        {T.brisca.tu}
        {#if vista.banca === yo}<span class="marca">{T.sieteYMedia.banca}</span>{/if}
        <small data-testid="mis-fichas">{detalle(yo)}</small>
      </span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
    </div>

    <div class="mi-jugada" data-zona="mano-{yo}">
      {#each vista.cartas[yo]! as id (id)}
        <div class="carta-propia" data-carta={id} data-testid="mia-{id}"><Carta {id} /></div>
      {/each}
      {#if vista.cartas[yo]!.length > 0 && vista.miValor !== null}
        <span class="valor" class:pasado={vista.estados[yo] === 'pasado'} data-testid="mi-valor">
          {vista.estados[yo] === 'pasado' ? T.sieteYMedia.pasado : T.sieteYMedia.valor(vista.miValor)}
        </span>
      {/if}
    </div>

    <div class="controles">
      {#if apuestasLegales.length > 0}
        <span class="etiqueta">{T.sieteYMedia.tuApuesta}</span>
        <button
          aria-label={T.sieteYMedia.menos}
          data-testid="apuesta-menos"
          disabled={apuestaValida <= 1}
          onclick={() => (apuesta = apuestaValida - 1)}>−</button
        >
        <b class="cantidad" data-testid="apuesta">{apuestaValida}</b>
        <button
          aria-label={T.sieteYMedia.mas}
          data-testid="apuesta-mas"
          disabled={apuestaValida >= maxApuesta}
          onclick={() => (apuesta = apuestaValida + 1)}>+</button
        >
        <button
          class="principal"
          data-testid="apostar"
          onclick={() => sesion.jugar({ tipo: 'apostar', fichas: apuestaValida })}
          >{T.sieteYMedia.apostar(apuestaValida)}</button
        >
      {:else if puedePlantarse}
        <button class="principal" data-testid="pedir" disabled={!puedePedir} onclick={() => sesion.jugar({ tipo: 'pedir' })}
          >{T.sieteYMedia.pedir}</button
        >
        <button data-testid="plantarse" onclick={() => sesion.jugar({ tipo: 'plantarse' })}
          >{T.sieteYMedia.plantarse}</button
        >
      {/if}
    </div>
  </div>
</div>

{#if resultado !== null && vista.resultadosManos[resultado]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.sieteYMedia.finMano(resultado + 1)}</h2>
      <ResultadoSieteYMedia resultado={vista.resultadosManos[resultado]!} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.sieteYMedia.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .siete {
    --ancho-carta: min(19vw, 13dvh, 104px);
    --ancho-rival: min(10vw, 7dvh, 50px);
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto 1fr auto;
    grid-template-areas:
      'info info info'
      'arriba arriba arriba'
      'izquierda centro derecha'
      'abajo abajo abajo';
    gap: 8px;
    width: min(100%, 860px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    user-select: none;
    -webkit-user-select: none;
  }

  .siete.cuatro {
    --ancho-rival: min(9vw, 6dvh, 44px);
  }

  .info {
    grid-area: info;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px 18px;
    color: var(--texto-suave);
    font-size: 0.9rem;
  }

  .asiento {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .arriba {
    grid-area: arriba;
  }

  .izquierda {
    grid-area: izquierda;
    align-self: center;
  }

  .derecha {
    grid-area: derecha;
    align-self: center;
  }

  .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 600;
    text-align: center;
    background: rgb(0 0 0 / 0.2);
  }

  .nombre small {
    font-weight: 400;
    color: var(--texto-suave);
    margin-left: 4px;
  }

  .izquierda .nombre,
  .derecha .nombre {
    max-width: 24vw;
    font-size: 0.85rem;
    padding: 2px 6px;
  }

  .izquierda .nombre small,
  .derecha .nombre small {
    display: block;
    margin: 0;
  }

  .activo .nombre {
    background: var(--acento);
    color: #2b2005;
  }

  .activo .nombre small {
    color: #5b4a12;
  }

  .marca {
    margin-left: 4px;
    padding: 0 6px;
    border-radius: 8px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #2b2005;
    background: var(--acento);
  }

  .activo .marca {
    background: #2b2005;
    color: var(--acento);
  }

  .jugada-rival {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px;
    max-width: calc(var(--ancho-rival) * 3.2);
    min-height: calc(var(--ancho-rival) * 1.4);
  }

  .mini {
    width: var(--ancho-rival);
    aspect-ratio: 100 / 140;
    flex: none;
  }

  .estado {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--texto-suave);
  }

  .estado.pasado {
    color: var(--peligro);
  }

  .centro {
    grid-area: centro;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 0;
  }

  .mazo {
    width: calc(var(--ancho-carta) * 0.8);
    aspect-ratio: 100 / 140;
    border-radius: 7%;
    outline: 2px dashed rgb(255 255 255 / 0.2);
    outline-offset: -2px;
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
    grid-area: abajo;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .estado-propio {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 12px;
  }

  .turno {
    font-weight: 600;
  }

  .mi-jugada {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: calc(var(--ancho-carta) * 1.4);
  }

  .carta-propia {
    width: var(--ancho-carta);
    aspect-ratio: 100 / 140;
    flex: none;
  }

  /* Con muchas cartas se encogen para que la jugada quepa en una o dos filas. */
  .mi-jugada:has(.carta-propia:nth-child(5)) .carta-propia {
    width: calc(var(--ancho-carta) * 0.72);
  }

  .valor {
    margin-left: 6px;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 1.3rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    background: rgb(0 0 0 / 0.3);
  }

  .valor.pasado {
    color: var(--peligro);
  }

  .controles {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
  }

  .controles .etiqueta {
    color: var(--texto-suave);
  }

  .cantidad {
    min-width: 2ch;
    font-size: 1.2rem;
    text-align: center;
    font-variant-numeric: tabular-nums;
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
    padding: 18px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  .dialogo h2 {
    font-size: 1.2rem;
    margin-bottom: 8px;
  }

  .dialogo > button {
    margin-top: 14px;
    width: 100%;
  }
</style>
