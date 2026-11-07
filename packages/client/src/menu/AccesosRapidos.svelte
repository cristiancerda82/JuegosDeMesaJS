<script lang="ts">
  import { tick } from 'svelte';
  import Carta from '../cartas/Carta.svelte';
  import { JUEGOS, type IdJuego } from '../sesion/juegos';
  import { T } from '../textos';
  import { CATALOGO } from './catalogo';
  import { preferencias } from './preferencias.svelte';

  /**
   * Botones flotantes de favoritos y últimos jugados, con su panel (spec menu-juegos; design,
   * decisiones 5 y 7). Solo lo monta el menú, así que no aparece durante una partida.
   */
  interface Props {
    elegir: (juego: IdJuego) => void;
  }

  let { elegir }: Props = $props();

  type Panel = 'favoritos' | 'recientes';

  let abierto: Panel | null = $state(null);
  let panel: HTMLElement | undefined = $state();
  let botones: Record<Panel, HTMLButtonElement | undefined> = $state({
    favoritos: undefined,
    recientes: undefined,
  });

  const lista = $derived(
    abierto === 'favoritos' ? preferencias.favoritos : abierto === 'recientes' ? preferencias.recientes : [],
  );

  async function abrir(p: Panel) {
    if (abierto === p) {
      cerrar();
      return;
    }
    abierto = p;
    await tick();
    panel?.focus();
  }

  /** Cierra el panel y devuelve el foco al botón que lo abrió. */
  function cerrar() {
    if (abierto === null) return;
    const disparador = botones[abierto];
    abierto = null;
    disparador?.focus();
  }

  function alElegir(juego: IdJuego) {
    abierto = null;
    elegir(juego);
  }

  function alTeclear(ev: KeyboardEvent) {
    if (ev.key === 'Escape' && abierto !== null) {
      ev.preventDefault();
      cerrar();
    }
  }

  function alPulsar(ev: PointerEvent) {
    if (abierto === null) return;
    const destino = ev.target as Node;
    if (panel?.contains(destino)) return;
    if (botones.favoritos?.contains(destino) || botones.recientes?.contains(destino)) return;
    cerrar();
  }
</script>

<svelte:window onkeydown={alTeclear} onpointerdown={alPulsar} />

<div class="accesos">
  {#if abierto !== null}
    <div
      class="panel"
      role="dialog"
      aria-labelledby="titulo-acceso"
      tabindex="-1"
      bind:this={panel}
      data-testid="panel-{abierto}"
    >
      <header>
        <h2 id="titulo-acceso">{abierto === 'favoritos' ? T.menu.favoritos : T.menu.recientes}</h2>
        <button type="button" class="cerrar" onclick={cerrar} aria-label={T.menu.cerrarPanel}>✕</button>
      </header>
      {#if lista.length === 0}
        <p class="vacio">{abierto === 'favoritos' ? T.menu.favoritosVacio : T.menu.recientesVacio}</p>
      {:else}
        <ul>
          {#each lista as juego (juego)}
            <li>
              <button type="button" class="fila" onclick={() => alElegir(juego)} data-testid="acceso-{juego}">
                <span class="hueco" aria-hidden="true"><Carta id={CATALOGO[juego].cartas[0]} /></span>
                <span class="nombre">{JUEGOS[juego].nombre}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}

  <div class="botones">
    <button
      type="button"
      class="flotante"
      class:activo={abierto === 'favoritos'}
      aria-label={T.menu.favoritos}
      title={T.menu.favoritos}
      aria-expanded={abierto === 'favoritos'}
      bind:this={botones.favoritos}
      onclick={() => abrir('favoritos')}
      data-testid="abrir-favoritos"><span aria-hidden="true">★</span></button
    >
    <button
      type="button"
      class="flotante"
      class:activo={abierto === 'recientes'}
      aria-label={T.menu.recientes}
      title={T.menu.recientes}
      aria-expanded={abierto === 'recientes'}
      bind:this={botones.recientes}
      onclick={() => abrir('recientes')}
      data-testid="abrir-recientes"><span aria-hidden="true">⟲</span></button
    >
  </div>
</div>

<style>
  .accesos {
    position: fixed;
    right: calc(16px + env(safe-area-inset-right));
    bottom: calc(16px + env(safe-area-inset-bottom));
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    pointer-events: none;
  }

  .accesos > * {
    pointer-events: auto;
  }

  .botones {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .flotante {
    width: 56px;
    height: 56px;
    padding: 0;
    border-radius: 50%;
    font-size: 1.6rem;
    line-height: 1;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(242 193 78 / 0.6);
    color: var(--acento);
    box-shadow: var(--sombra-alta);
  }

  .flotante.activo,
  .flotante:hover:not(:disabled) {
    background: #0d4a2e;
  }

  .panel {
    width: min(320px, calc(100vw - 32px));
    max-height: min(60vh, 460px);
    overflow-y: auto;
    padding: 12px;
    border-radius: 14px;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.25);
    box-shadow: var(--sombra-alta);
  }

  .panel:focus-visible {
    outline-offset: -3px;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }

  h2 {
    font-size: 1.05rem;
  }

  .cerrar {
    min-width: 44px;
    padding: 0;
  }

  .vacio {
    margin: 4px 0;
    color: var(--texto-suave);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .fila {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 10px;
    text-align: left;
  }

  .hueco {
    width: 30px;
    aspect-ratio: 100 / 140;
    flex: none;
  }

  /* En móvil, el panel se abre como hoja inferior a todo el ancho. */
  @media (max-width: 560px) {
    .panel {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      width: auto;
      max-height: 65vh;
      border-radius: 16px 16px 0 0;
      padding-bottom: calc(12px + env(safe-area-inset-bottom));
    }
  }
</style>
