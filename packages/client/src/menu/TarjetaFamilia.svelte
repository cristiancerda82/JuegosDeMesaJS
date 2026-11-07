<script lang="ts">
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';
  import { CATALOGO, type Familia } from './catalogo';
  import type { IdJuego } from '../sesion/juegos';

  interface Props {
    familia: Familia;
    /** Juegos de la familia que pasan el filtro, en orden. */
    juegos: readonly IdJuego[];
    abrir: () => void;
  }

  let { familia, juegos, abrir }: Props = $props();

  // El abanico de la familia: las cartas de su primer juego.
  const cartas = $derived(juegos[0] ? CATALOGO[juegos[0]].cartas : []);
</script>

<button class="familia" onclick={abrir} data-testid="familia-{familia.id}">
  <span class="abanico" aria-hidden="true">
    {#each cartas as id (id)}
      <span class="hueco"><Carta {id} /></span>
    {/each}
  </span>
  <span class="nombre">{familia.nombre}</span>
  <span class="cuantos">{T.menu.juegosN(juegos.length)}</span>
</button>

<style>
  .familia {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 16px 12px;
    text-align: center;
    background: rgb(0 0 0 / 0.22);
  }

  .abanico {
    display: flex;
    height: 74px;
    margin-bottom: 6px;
  }

  .hueco {
    width: 46px;
    aspect-ratio: 100 / 140;
    display: block;
  }

  .hueco + .hueco {
    margin-left: -18px;
  }

  .hueco:nth-child(1) {
    rotate: -10deg;
  }

  .hueco:nth-child(3) {
    rotate: 10deg;
  }

  .nombre {
    font-size: 1.15rem;
    font-weight: 700;
  }

  .cuantos {
    color: var(--texto-suave);
    font-size: 0.9rem;
  }
</style>
