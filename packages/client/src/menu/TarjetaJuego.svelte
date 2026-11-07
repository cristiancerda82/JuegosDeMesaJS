<script lang="ts">
  import Carta from '../cartas/Carta.svelte';
  import { JUEGOS, type IdJuego } from '../sesion/juegos';
  import { T } from '../textos';
  import BotonFavorito from './BotonFavorito.svelte';
  import { CATALOGO } from './catalogo';

  interface Props {
    juego: IdJuego;
    elegir: (juego: IdJuego) => void;
  }

  let { juego, elegir }: Props = $props();

  const entrada = $derived(CATALOGO[juego]);
</script>

<!-- La estrella es un botón hermano, no anidado: HTML no permite un botón dentro de otro. -->
<div class="tarjeta">
  <button class="juego" onclick={() => elegir(juego)} data-testid="juego-{juego}">
    <span class="abanico" aria-hidden="true">
      {#each entrada.cartas as id (id)}
        <span class="hueco"><Carta {id} /></span>
      {/each}
    </span>
    <span class="titulo">{JUEGOS[juego].nombre}</span>
    <span class="desc">{entrada.desc}</span>
    <span class="jugar">{T.menu.jugar}</span>
  </button>
  <span class="favorito"><BotonFavorito {juego} /></span>
</div>

<style>
  .tarjeta {
    position: relative;
    display: flex;
  }

  .juego {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 18px 14px;
    text-align: center;
    background: rgb(0 0 0 / 0.22);
  }

  .favorito {
    position: absolute;
    top: 6px;
    right: 6px;
  }

  .abanico {
    display: flex;
    height: 92px;
    margin-bottom: 6px;
  }

  .hueco {
    width: 58px;
    aspect-ratio: 100 / 140;
    display: block;
  }

  .hueco + .hueco {
    margin-left: -22px;
  }

  .hueco:nth-child(1) {
    rotate: -10deg;
  }

  .hueco:nth-child(3) {
    rotate: 10deg;
  }

  .titulo {
    font-size: 1.35rem;
    font-weight: 700;
  }

  .desc {
    color: var(--texto-suave);
    font-size: 0.92rem;
  }

  .jugar {
    margin-top: 6px;
    padding: 6px 18px;
    border-radius: var(--radio);
    background: var(--acento);
    color: #2b2005;
    font-weight: 700;
  }
</style>
