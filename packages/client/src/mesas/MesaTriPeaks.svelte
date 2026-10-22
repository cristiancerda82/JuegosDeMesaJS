<script lang="ts">
  import {
    FILAS_TRIPEAKS,
    filaTriPeaks,
    type AccionTriPeaks,
    type ConfigTriPeaks,
    type EstadoTriPeaks,
    type IdCarta,
    type VistaTriPeaks,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AvisoAtasco from './AvisoAtasco.svelte';
  import BotonPista, { type Resalte } from './BotonPista.svelte';
  import { formatoTiempo } from './tiempo';

  interface Props {
    sesion: SesionMesa<ConfigTriPeaks, EstadoTriPeaks, AccionTriPeaks, VistaTriPeaks>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const puede = (tipo: AccionTriPeaks['tipo']) => legales.some((a) => a.tipo === tipo);
  const quitable = (posicion: number) =>
    legales.some((a) => a.tipo === 'quitar' && a.posicion === posicion);

  /**
   * Posición en la mesa de cada sitio de los picos, en anchos de carta: la fila de abajo, carta
   * a carta; la de encima, a media carta; y las de arriba, centradas sobre las dos que pisan.
   */
  function columna(posicion: number): number {
    const fila = filaTriPeaks(posicion);
    const i = posicion - FILAS_TRIPEAKS[fila]!.inicio;
    if (fila === 3) return i;
    if (fila === 2) return i + 0.5;
    if (fila === 1) return i + Math.floor(i / 2) + 1;
    return 3 * i + 1.5;
  }

  function quitar(posicion: number) {
    if (!sesion.bloqueada && quitable(posicion)) sesion.jugar({ tipo: 'quitar', posicion });
  }

  function accion(tipo: 'deshacer' | 'robar') {
    sesion.jugar({ tipo });
  }

  function abandonar() {
    if (confirm(T.partida.confirmarAbandono)) sesion.jugar({ tipo: 'abandonar' });
  }

  /** Qué resaltar para una pista: la carta que se quitaría, o el mazo. */
  function resalte(pista: AccionTriPeaks): Resalte {
    if (pista.tipo !== 'quitar') return { cartas: [], pilas: ['mazo'] };
    return { cartas: [vista.picos[pista.posicion] as IdCarta], pilas: [] };
  }

  let mesaEntera: HTMLElement | undefined = $state();

  // ── Tiempo ─────────────────────────────────────────────────────────────────

  let tiempo = $state('');
  $effect(() => {
    const actualizar = () => (tiempo = formatoTiempo(sesion.tiempoMs()));
    actualizar();
    const reloj = setInterval(actualizar, 500);
    return () => clearInterval(reloj);
  });

  // ── Animación de cada cambio de la vista ───────────────────────────────────

  let previas: Posiciones = new Map();
  $effect.pre(() => {
    void vista;
    if (mesaEntera) previas = medir(mesaEntera);
  });
  $effect(() => {
    void vista;
    if (mesaEntera) animar(mesaEntera, previas);
  });

  /** El descarte en abanico: las tres de arriba. */
  const abanico = $derived(vista.descarte.slice(-3) as IdCarta[]);
</script>

<div class="tripeaks" bind:this={mesaEntera}>
  <div class="barra">
    <span class="dato">
      <span class="etiqueta">{T.partida.movimientos}</span>
      <b data-testid="movimientos">{vista.movimientos}</b>
    </span>
    <span class="dato"><span class="etiqueta">{T.partida.tiempo}</span> <b>{tiempo}</b></span>
    <span class="acciones">
      <BotonPista {sesion} raiz={mesaEntera} {resalte} />
      <button onclick={() => accion('deshacer')} disabled={!puede('deshacer')} data-testid="deshacer">
        {T.partida.deshacer}
      </button>
      <button onclick={abandonar} disabled={!puede('abandonar')}>{T.partida.abandonar}</button>
    </span>
  </div>

  <div class="marcador">
    <span class="dato">
      <span class="etiqueta">{T.tripeaks.puntos}</span>
      <b data-testid="puntos">{vista.puntos}</b>
    </span>
    <span class="racha" class:viva={vista.racha >= 2} data-testid="racha">
      {T.tripeaks.racha(vista.racha)}
    </span>
  </div>

  <div class="picos" data-testid="picos">
    {#each vista.picos as sitio, posicion (posicion)}
      {#if sitio !== null}
        <button
          class="naipe"
          class:movible={quitable(posicion)}
          style:left="calc({columna(posicion)} * var(--ancho-carta))"
          style:top="calc({filaTriPeaks(posicion)} * var(--paso))"
          data-carta={sitio === 'oculta' ? undefined : sitio}
          data-testid="p{posicion}"
          aria-label={sitio === 'oculta' ? T.tripeaks.bocaAbajo : sitio}
          disabled={sitio === 'oculta'}
          onclick={() => quitar(posicion)}
        >
          {#if sitio === 'oculta'}<Carta />{:else}<Carta id={sitio} />{/if}
        </button>
      {/if}
    {/each}
  </div>

  <div class="pilas">
    <button
      class="mazo"
      onclick={() => accion('robar')}
      disabled={!puede('robar')}
      data-zona="mazo"
      data-testid="mazo"
      aria-label={T.partida.robar}
      title={T.partida.robar}
    >
      {#if vista.mazo > 0}
        <Carta />
        <span class="cuenta">{vista.mazo}</span>
      {:else}
        <span class="vacio"></span>
      {/if}
    </button>
    <div class="descarte" data-testid="descarte">
      {#each abanico as carta, i (carta)}
        <span
          class="naipe"
          style:left="calc({i} * var(--ancho-pila) * 0.3)"
          data-carta={i === abanico.length - 1 ? carta : undefined}
          data-testid={i === abanico.length - 1 ? 'descarte-arriba' : undefined}
        >
          <Carta id={carta} />
        </span>
      {/each}
    </div>
    <span class="dato" data-testid="en-mazo"><span class="etiqueta">{T.brisca.enMazo(vista.mazo)}</span></span>
  </div>
</div>

<AvisoAtasco
  {legales}
  terminada={sesion.fin !== null}
  deshacer={() => accion('deshacer')}
  abandonar={() => sesion.jugar({ tipo: 'abandonar' })}
/>

<style>
  .tripeaks {
    /* La fila de abajo son 10 cartas seguidas: caben en 360 px de ancho. */
    --ancho-carta: min(calc((100vw - 24px) / 10), 62px, calc((100dvh - 300px) / (2.5 * 1.4)));
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    /* Cada fila baja media carta sobre la anterior. */
    --paso: calc(var(--alto-carta) * 0.5);
    /* El mazo y el descarte, algo más grandes que las cartas de los picos. */
    --ancho-pila: calc(var(--ancho-carta) * 1.25);
    width: min(100%, calc(10 * 62px + 16px));
    margin: 0 auto;
    padding: 0 8px 24px;
  }

  .barra,
  .marcador {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 12px;
    padding: 6px 0;
  }

  .marcador {
    justify-content: center;
    padding-bottom: 10px;
  }

  .dato {
    font-variant-numeric: tabular-nums;
  }

  .etiqueta {
    color: var(--texto-suave);
    font-size: 0.85rem;
  }

  .racha {
    min-width: 6em;
    color: var(--texto-suave);
    font-variant-numeric: tabular-nums;
  }

  .racha.viva {
    font-weight: 700;
    color: var(--acento);
  }

  .acciones {
    display: flex;
    gap: 6px;
    margin-left: auto;
  }

  .acciones button {
    padding: 0.4rem 0.7rem;
    font-size: 0.9rem;
  }

  .picos {
    position: relative;
    width: calc(10 * var(--ancho-carta));
    height: calc(var(--alto-carta) + 3 * var(--paso));
    margin: 0 auto;
    user-select: none;
    -webkit-user-select: none;
  }

  .naipe {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    padding: 0;
    border: none;
    border-radius: 7%;
    background: none;
  }

  button.naipe:disabled {
    opacity: 1;
    cursor: default;
  }

  .naipe.movible {
    outline: 3px solid var(--resalte);
    outline-offset: 0;
    box-shadow: 0 0 12px rgb(255 224 102 / 0.5);
    z-index: 1;
  }

  .pilas {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
    justify-content: center;
  }

  .mazo {
    position: relative;
    width: var(--ancho-pila);
    height: calc(var(--ancho-pila) * 1.4);
    padding: 0;
    border: none;
    background: none;
  }

  .mazo:disabled {
    opacity: 1;
    cursor: default;
  }

  .cuenta {
    position: absolute;
    right: 4px;
    bottom: 4px;
    padding: 0 5px;
    border-radius: 8px;
    font-size: 0.8rem;
    background: rgb(0 0 0 / 0.55);
  }

  .vacio {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 7%;
    outline: 2px dashed rgb(255 255 255 / 0.18);
    outline-offset: -2px;
  }

  .descarte {
    position: relative;
    width: calc(var(--ancho-pila) * 1.6);
    height: calc(var(--ancho-pila) * 1.4);
  }

  .descarte .naipe {
    width: var(--ancho-pila);
    height: calc(var(--ancho-pila) * 1.4);
  }
</style>
