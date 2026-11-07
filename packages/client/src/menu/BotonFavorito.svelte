<script lang="ts">
  import { JUEGOS, type IdJuego } from '../sesion/juegos';
  import { T } from '../textos';
  import { preferencias } from './preferencias.svelte';

  interface Props {
    juego: IdJuego;
  }

  let { juego }: Props = $props();

  const marcado = $derived(preferencias.esFavorito(juego));
  const nombre = $derived(JUEGOS[juego].nombre);
</script>

<button
  type="button"
  class="estrella"
  class:marcado
  aria-pressed={marcado}
  aria-label={marcado ? T.menu.quitarFavorito(nombre) : T.menu.anadirFavorito(nombre)}
  title={marcado ? T.menu.quitarFavorito(nombre) : T.menu.anadirFavorito(nombre)}
  data-testid="favorito-{juego}"
  onclick={() => preferencias.alternarFavorito(juego)}
>
  <span aria-hidden="true">{marcado ? '★' : '☆'}</span>
</button>

<style>
  .estrella {
    min-width: 44px;
    padding: 0;
    font-size: 1.5rem;
    line-height: 1;
    border-color: transparent;
    background: rgb(0 0 0 / 0.2);
    color: var(--texto-suave);
  }

  .marcado {
    color: var(--acento);
  }
</style>
