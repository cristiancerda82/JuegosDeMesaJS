<script module lang="ts">
  /** Lo que hay que resaltar para una pista: cartas (`data-carta`) y pilas (`data-testid`). */
  export interface Resalte {
    readonly cartas: readonly string[];
    readonly pilas: readonly string[];
  }
</script>

<script lang="ts" generics="A, V">
  import { T } from '../textos';

  interface Props {
    sesion: { pedirPista(): A | null; readonly vista: V };
    /** Elemento que contiene la mesa, donde se buscan las cartas y las pilas. */
    raiz: HTMLElement | undefined;
    resalte: (pista: A) => Resalte;
  }

  let { sesion, raiz, resalte }: Props = $props();

  /** Tiempo que dura el resaltado de una pista. */
  const DURACION_MS = 2500;
  const CLASE = 'pista-resaltada';

  let sinPista = $state(false);
  let temporizador: ReturnType<typeof setTimeout> | null = null;

  function limpiar() {
    if (temporizador !== null) clearTimeout(temporizador);
    temporizador = null;
    sinPista = false;
    for (const el of raiz?.querySelectorAll(`.${CLASE}`) ?? []) el.classList.remove(CLASE);
  }

  function pedir() {
    limpiar();
    const pista = sesion.pedirPista();
    if (pista === null) {
      sinPista = true;
    } else if (raiz) {
      const { cartas, pilas } = resalte(pista);
      const selectores = [
        ...cartas.map((c) => `[data-carta="${c}"]`),
        ...pilas.map((p) => `[data-testid="${p}"]`),
      ];
      if (selectores.length > 0) {
        for (const el of raiz.querySelectorAll(selectores.join(','))) el.classList.add(CLASE);
      }
    }
    temporizador = setTimeout(limpiar, DURACION_MS);
  }

  // Cualquier cambio en la mesa (un movimiento) quita el resaltado.
  $effect(() => {
    void sesion.vista;
    return limpiar;
  });
</script>

<span class="pista">
  <button onclick={pedir} data-testid="pista">{T.partida.pista}</button>
  {#if sinPista}
    <span class="sin-pista" role="status" data-testid="sin-pista">{T.partida.sinPista}</span>
  {/if}
</span>

<style>
  .pista {
    position: relative;
    display: inline-flex;
  }

  .pista button {
    padding: 0.4rem 0.7rem;
    font-size: 0.9rem;
  }

  /* Flota bajo el botón para no mover la barra. */
  .sin-pista {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 20;
    width: max-content;
    max-width: min(80vw, 260px);
    padding: 6px 10px;
    border-radius: 10px;
    font-size: 0.85rem;
    color: var(--acento);
    background: var(--tapete-oscuro);
    box-shadow: var(--sombra-alta);
  }
</style>
