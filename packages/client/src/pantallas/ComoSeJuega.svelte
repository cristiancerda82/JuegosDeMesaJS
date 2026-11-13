<script lang="ts">
  import Ejemplo from '../ayuda/Ejemplo.svelte';
  import { EJEMPLOS } from '../ayuda/ejemplos';
  import type { IdJuego } from '../sesion/juegos';
  import { T } from '../textos';

  interface Props {
    /** Un juego, o 'red' para la ayuda de jugar en red. */
    juego: IdJuego | 'red';
    cerrar: () => void;
  }

  let { juego, cerrar }: Props = $props();

  interface Seccion {
    readonly titulo: string;
    readonly texto: readonly string[];
    readonly ejemplo?: string;
    readonly ejemplos?: readonly string[];
  }

  const secciones = $derived(T.ayuda[juego] as readonly Seccion[]);
  const ejemplos = $derived(juego === 'red' ? {} : (EJEMPLOS[juego] ?? {}));
  /** Las claves de los ejemplos de una sección, en orden. */
  const claves = (s: Seccion) => s.ejemplos ?? (s.ejemplo ? [s.ejemplo] : []);

  let dialogo: HTMLDialogElement | undefined = $state();
  $effect(() => {
    dialogo?.showModal();
  });
</script>

<dialog
  bind:this={dialogo}
  class="ayuda"
  aria-labelledby="ayuda-titulo"
  data-testid="como-se-juega"
  onclose={cerrar}
  onclick={(e) => e.target === dialogo && dialogo.close()}
>
  <div class="contenido">
    <h2 id="ayuda-titulo">{T.ayuda.titulo[juego]}</h2>

    {#each secciones as seccion, i (i)}
      <section>
        {#if seccion.titulo}<h3>{seccion.titulo}</h3>{/if}
        {#each seccion.texto as parrafo, j (j)}
          <p>{parrafo}</p>
        {/each}

        {#each claves(seccion) as clave (clave)}
          {@const ejemplo = ejemplos[clave]}
          {#if ejemplo}<Ejemplo {clave} {ejemplo} />{/if}
        {/each}
      </section>
    {/each}
  </div>

  <form method="dialog" class="pie">
    <button class="principal" data-testid="cerrar-ayuda">{T.ayuda.cerrar}</button>
  </form>
</dialog>

<style>
  .ayuda {
    width: min(100% - 24px, 560px);
    max-height: min(100dvh - 24px, 760px);
    padding: 0;
    border: 1px solid rgb(255 255 255 / 0.2);
    border-radius: 16px;
    color: var(--texto);
    background: var(--tapete-oscuro);
    box-shadow: var(--sombra-alta);
    display: flex;
    flex-direction: column;
  }

  .ayuda:not([open]) {
    display: none;
  }

  .ayuda::backdrop {
    background: rgb(0 0 0 / 0.55);
  }

  .contenido {
    overflow-y: auto;
    padding: 20px 20px 8px;
  }

  h2 {
    font-size: 1.35rem;
    margin-bottom: 4px;
  }

  h3 {
    margin: 16px 0 4px;
    font-size: 1.02rem;
    color: var(--acento);
  }

  p {
    margin: 6px 0;
    line-height: 1.45;
  }

  .pie {
    display: flex;
    justify-content: flex-end;
    padding: 12px 20px 16px;
    border-top: 1px solid rgb(255 255 255 / 0.12);
  }
</style>
