<script lang="ts">
  import type { IdCarta } from '@juegos/engine';
  import Carta from '../../cartas/Carta.svelte';
  import type { Interaccion } from '../../interaccion/interaccion.svelte';

  interface Props {
    cartas: readonly IdCarta[];
    jugable: (carta: IdCarta) => boolean;
    interaccion: Interaccion;
    /** Combinación a la que pertenece cada carta (se marca con un color), o `null`. */
    grupo?: (carta: IdCarta) => number | null;
    /** Zona de destino de la mano (p. ej. para soltar ahí la carta robada). */
    destino?: string | undefined;
    /** Cartas que se marcan (las cantadas del Bezique); con copias, se marcan tantas como haya. */
    marcadas?: readonly IdCarta[];
  }

  let { cartas, jugable, interaccion, grupo = () => null, destino, marcadas = [] }: Props = $props();

  /** Con dos barajas hay cartas repetidas: cada copia lleva su número. */
  const conCopia = $derived(
    cartas.map((id, i) => {
      const copia = cartas.slice(0, i).filter((c) => c === id).length;
      const marcada = copia < marcadas.filter((c) => c === id).length;
      return { id, clave: `${id}#${copia}`, marcada };
    }),
  );

  const COLORES_GRUPO = ['#f2c14e', '#52b788', '#6aa9ff', '#ff8fab'];

  /** Con más cartas (el Tarot, hasta 24), se juntan sin hueco y enseñan solo la esquina. */
  const MAXIMO_HOLGADA = 12;
  /** Con 11 o 12 cartas grandes (la mesa para dos), la separación se estrecha en pantallas pequeñas. */
  const MAXIMO_SEPARADA = 10;
</script>

<!--
  Cada carta ocupa una ranura que puede encogerse hasta dejar a la vista el índice (≈ 30 % de
  la carta); la carta dentro conserva su tamaño y la siguiente la tapa en parte. Así la mano
  cabe entera, sin scroll horizontal, tenga 3 o 10 cartas.
-->
<div
  class="mano"
  class:apretada={cartas.length > MAXIMO_HOLGADA}
  class:justa={cartas.length > MAXIMO_SEPARADA && cartas.length <= MAXIMO_HOLGADA}
  class:legal={destino !== undefined && interaccion.resaltados.has(destino)}
  data-testid="mano"
  data-destino={destino}
>
  {#each conCopia as { id, clave, marcada } (clave)}
    {@const g = grupo(id)}
    <div class="ranura">
      <div
        class="carta-mano"
        class:jugable={jugable(id)}
        class:seleccionada={interaccion.seleccion === id}
        class:en-grupo={g !== null}
        class:marcada
        style:--color-grupo={g === null ? null : COLORES_GRUPO[g % COLORES_GRUPO.length]}
        data-grupo={g}
        data-carta={id}
        data-desde="mazo"
        data-testid="mano-{id}"
        use:interaccion.origen={id}
      >
        <Carta {id} />
      </div>
    </div>
  {/each}
</div>

<style>
  .mano {
    display: flex;
    justify-content: center;
    width: 100%;
    min-height: var(--alto-carta);
    padding-top: 10px;
  }

  .ranura {
    flex: 0 1 var(--ancho-carta);
    min-width: calc(var(--ancho-carta) * 0.3);
    margin-right: clamp(4px, 2vw, 14px);
  }

  .mano.justa .ranura {
    margin-right: clamp(0px, 3vw - 8px, 14px);
  }

  .mano.apretada .ranura {
    min-width: calc(var(--ancho-carta) * 0.22);
    margin-right: 0;
  }

  .ranura:last-child {
    flex-shrink: 0;
    margin-right: 0;
  }

  .carta-mano {
    position: relative;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    border-radius: 7%;
    cursor: default;
    touch-action: none;
    transition: translate 120ms;
  }

  .carta-mano.jugable {
    cursor: grab;
  }

  .carta-mano.jugable:hover,
  .carta-mano.seleccionada {
    translate: 0 -8px;
  }

  .carta-mano.seleccionada {
    outline: 3px solid var(--resalte);
    z-index: 2;
  }

  /* Carta cantada: boca arriba en la mesa, aunque sigue en la mano. */
  .carta-mano.marcada::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 9%;
    border: 3px solid var(--acento);
    pointer-events: none;
    z-index: 1;
  }

  .mano.legal {
    border-radius: 12px;
    outline: 3px solid var(--resalte);
    outline-offset: 2px;
  }

  /* Barra de color bajo las cartas de una misma combinación. */
  .carta-mano.en-grupo::after {
    content: '';
    position: absolute;
    left: 6%;
    right: 6%;
    bottom: -7px;
    height: 4px;
    border-radius: 2px;
    background: var(--color-grupo);
  }

  :global(.carta-mano.arrastrando) {
    cursor: grabbing;
    filter: drop-shadow(var(--sombra-alta));
  }
</style>
