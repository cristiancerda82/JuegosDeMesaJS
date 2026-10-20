<script lang="ts">
  import {
    puntosDe,
    puntosPocha,
    valorCarta,
    valorEscoba,
    VALORES_BUTIFARRA,
    VALORES_GUINOTE,
    type IdCarta,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import type { IdJuego } from '../sesion/juegos';
  import { T } from '../textos';

  interface Props {
    /** Un juego, o 'red' para la ayuda de jugar en red. */
    juego: IdJuego | 'red';
    cerrar: () => void;
  }

  let { juego, cerrar }: Props = $props();

  const secciones = $derived(T.ayuda[juego]);

  /** Escalera de Klondike: bajando de uno en uno y alternando colores. */
  const ESCALERA: readonly IdCarta[] = ['corazones-13', 'picas-12', 'diamantes-11', 'treboles-10'];
  /** Las cartas que dan puntos en la Brisca, de mayor a menor. */
  const VALORES: readonly IdCarta[] = ['oros-1', 'oros-3', 'oros-12', 'oros-11', 'oros-10'];
  /** Una pareja que se canta en el Tute: rey y caballo del mismo palo. */
  const CANTE: readonly IdCarta[] = ['copas-12', 'copas-11'];
  /** Valores para sumar en la Escoba. */
  const SUMAS: readonly IdCarta[] = ['bastos-1', 'bastos-5', 'bastos-7', 'bastos-10', 'bastos-11', 'bastos-12'];
  /** Una captura de la Escoba: el caballo de la mano (9) con el 6 de la mesa. */
  const CAPTURA: readonly IdCarta[] = ['oros-11', 'copas-6'];
  /** Escalera del Chinchón que cruza del 7 a la sota, y un trío con comodín. */
  const ESCALERA_ESPANOLA: readonly IdCarta[] = ['copas-6', 'copas-7', 'copas-10', 'copas-11'];
  const TRIO_COMODIN: readonly IdCarta[] = ['oros-4', 'bastos-4', 'comodin-1'];
  /** Las cartas que dan puntos en el Guiñote (la sota por encima del caballo) y su cante. */
  const VALORES_G: readonly IdCarta[] = ['oros-1', 'oros-3', 'oros-12', 'oros-10', 'oros-11'];
  const CANTE_G: readonly IdCarta[] = ['copas-12', 'copas-10'];
  /** Una escalera del Remigio que cruza del 7 a la Sota, y un grupo con comodín. */
  const ESCALERA_REMIGIO: readonly IdCarta[] = ['copas-6', 'copas-7', 'copas-10', 'copas-11'];
  const GRUPO_REMIGIO: readonly IdCarta[] = ['oros-5', 'espadas-5', 'comodin-1'];
  /** Las cuatro cartas más altas del Truc y un envit de 33. */
  const JERARQUIA_TRUC: readonly IdCarta[] = ['espadas-1', 'bastos-1', 'espadas-7', 'oros-7'];
  const ENVIT_TRUC: readonly IdCarta[] = ['copas-7', 'copas-6', 'oros-12'];
  /** Los matadores de la Cuatrola con triunfo de oros: espadilla, malilla, basto y punto. */
  const MATADORES: readonly IdCarta[] = ['espadas-1', 'oros-7', 'bastos-1', 'oros-1'];
  /** Las cartas que dan puntos en la Butifarra, de la manilla a la sota. */
  const VALORES_B: readonly IdCarta[] = ['oros-9', 'oros-1', 'oros-12', 'oros-11', 'oros-10'];
  /** Una escalera del Cinquillo: del 4 a la Sota de copas, pasando del 7 a la Sota. */
  const ESCALERA_CINQUILLO: readonly IdCarta[] = ['copas-4', 'copas-5', 'copas-6', 'copas-7', 'copas-10'];
  /** Valores de la Siete y media y una siete y media natural. */
  const VALORES_SYM: readonly IdCarta[] = ['espadas-1', 'espadas-4', 'espadas-7', 'espadas-10', 'espadas-12'];
  const SIETE_Y_MEDIA_NATURAL: readonly IdCarta[] = ['oros-7', 'copas-11'];

  /** Ejemplos de puntuación de la Pocha: apuesta y bazas hechas. */
  const PUNTOS_POCHA: readonly (readonly [number, number])[] = [
    [2, 2],
    [0, 0],
    [1, 3],
  ];

  /** Jugadas del Mus: una 31 y unos duples. */
  const MUS_31: readonly IdCarta[] = ['oros-12', 'copas-11', 'espadas-10', 'bastos-1'];
  const MUS_DUPLES: readonly IdCarta[] = ['oros-12', 'copas-3', 'espadas-5', 'bastos-5'];

  /** Una escalera del Spider: del mismo palo, se mueve entera. */
  const ESCALERA_SPIDER: readonly IdCarta[] = ['picas-9', 'picas-8', 'picas-7', 'picas-6'];

  /** Las cartas que puntúan en los Corazones. */
  const PUNTOS_CORAZONES: readonly [IdCarta, number][] = [
    ['corazones-1', 1],
    ['corazones-7', 1],
    ['picas-12', 13],
  ];

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

        {#if 'ejemplo' in seccion && seccion.ejemplo === 'escalera'}
          <div class="escalera" aria-hidden="true">
            {#each ESCALERA as id, k (id)}
              <div class="hueco" style:top="{k * 30}px"><Carta {id} /></div>
            {/each}
          </div>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'valores'}
          <ul class="valores">
            {#each VALORES as id (id)}
              <li>
                <div class="hueco"><Carta {id} /></div>
                <span>{T.ayuda.puntos(puntosDe(id))}</span>
              </li>
            {/each}
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'valoresGuinote'}
          <ul class="valores">
            {#each VALORES_G as id (id)}
              <li>
                <div class="hueco"><Carta {id} /></div>
                <span>{T.ayuda.puntos(puntosDe(id, VALORES_GUINOTE))}</span>
              </li>
            {/each}
          </ul>
        {:else if 'ejemplo' in seccion && (seccion.ejemplo === 'escaleraRemigio' || seccion.ejemplo === 'grupoRemigio')}
          <ul class="valores">
            {#each seccion.ejemplo === 'escaleraRemigio' ? ESCALERA_REMIGIO : GRUPO_REMIGIO as id (id)}
              <li><div class="hueco"><Carta {id} /></div></li>
            {/each}
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'jerarquiaTruc'}
          <ul class="valores">
            {#each JERARQUIA_TRUC as id, i (id)}
              <li>
                <div class="hueco"><Carta {id} /></div>
                <span>{i + 1}.ª</span>
              </li>
            {/each}
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'matadores'}
          <ul class="valores">
            {#each MATADORES as id, i (id)}
              <li>
                <div class="hueco"><Carta {id} /></div>
                <span>{T.ayuda.matadores[i]}</span>
              </li>
            {/each}
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'envitTruc'}
          <ul class="valores">
            {#each ENVIT_TRUC as id (id)}
              <li><div class="hueco"><Carta {id} /></div></li>
            {/each}
          </ul>
          <p class="nota-ejemplo">{T.ayuda.envitEjemplo}</p>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'valoresButifarra'}
          <ul class="valores">
            {#each VALORES_B as id (id)}
              <li>
                <div class="hueco"><Carta {id} /></div>
                <span>{T.ayuda.puntos(puntosDe(id, VALORES_BUTIFARRA))}</span>
              </li>
            {/each}
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'escaleraCinquillo'}
          <ul class="valores">
            {#each ESCALERA_CINQUILLO as id (id)}
              <li><div class="hueco"><Carta {id} /></div></li>
            {/each}
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'valoresSyM'}
          <ul class="valores">
            {#each VALORES_SYM as id (id)}
              <li>
                <div class="hueco"><Carta {id} /></div>
                <span>{T.sieteYMedia.valor(valorCarta(id))}</span>
              </li>
            {/each}
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'sieteYMedia'}
          <ul class="valores">
            {#each SIETE_Y_MEDIA_NATURAL as id (id)}
              <li><div class="hueco"><Carta {id} /></div></li>
            {/each}
            <li class="resultado">= 7,5</li>
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'puntosCorazones'}
          <ul class="valores" data-testid="ejemplo-corazones">
            {#each PUNTOS_CORAZONES as [id, puntos] (id)}
              <li>
                <div class="hueco"><Carta {id} /></div>
                <span>{T.ayuda.puntos(puntos)}</span>
              </li>
            {/each}
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'escaleraSpider'}
          <ul class="valores" data-testid="ejemplo-spider">
            {#each ESCALERA_SPIDER as id (id)}
              <li><div class="hueco"><Carta {id} /></div></li>
            {/each}
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'jugadasMus'}
          <ul class="valores" data-testid="ejemplo-mus">
            {#each MUS_31 as id (id)}
              <li><div class="hueco"><Carta {id} /></div></li>
            {/each}
            <li class="resultado">= 31</li>
          </ul>
          <ul class="valores">
            {#each MUS_DUPLES as id (id)}
              <li><div class="hueco"><Carta {id} /></div></li>
            {/each}
            <li class="resultado">= duples</li>
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'puntosPocha'}
          <table class="puntos-pocha" data-testid="ejemplo-pocha">
            <caption>{T.pocha.ejemplo}</caption>
            <tbody>
              {#each PUNTOS_POCHA as [apuesta, bazas] (apuesta)}
                <tr>
                  <td>{apuesta} / {bazas}</td>
                  <td>→</td>
                  <td class="puntos">{T.pocha.puntos(puntosPocha(apuesta, bazas))}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'canteGuinote'}
          <ul class="valores">
            {#each CANTE_G as id (id)}
              <li><div class="hueco"><Carta {id} /></div></li>
            {/each}
            <li class="resultado">= 20 / 40</li>
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'cante'}
          <ul class="valores">
            {#each CANTE as id (id)}
              <li><div class="hueco"><Carta {id} /></div></li>
            {/each}
            <li class="resultado">= 20 / 40</li>
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'sumas'}
          <ul class="valores">
            {#each SUMAS as id (id)}
              <li>
                <div class="hueco"><Carta {id} /></div>
                <span>{valorEscoba(id)}</span>
              </li>
            {/each}
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'captura'}
          <ul class="valores">
            {#each CAPTURA as id, k (id)}
              <li>
                <div class="hueco"><Carta {id} /></div>
                <span>{k === 0 ? `${valorEscoba(id)} +` : valorEscoba(id)}</span>
              </li>
            {/each}
            <li class="resultado">= 15</li>
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'escaleraEspanola'}
          <ul class="valores">
            {#each ESCALERA_ESPANOLA as id (id)}
              <li><div class="hueco"><Carta {id} /></div></li>
            {/each}
          </ul>
        {:else if 'ejemplo' in seccion && seccion.ejemplo === 'trioComodin'}
          <ul class="valores">
            {#each TRIO_COMODIN as id (id)}
              <li><div class="hueco"><Carta {id} /></div></li>
            {/each}
          </ul>
        {/if}
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

  .hueco {
    width: 52px;
    aspect-ratio: 100 / 140;
  }

  .escalera {
    position: relative;
    height: calc(3 * 30px + 52px * 1.4);
    margin: 10px 0 4px 8px;
  }

  .escalera .hueco {
    position: absolute;
    left: 0;
  }

  .valores {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 10px 0 4px;
    padding: 0;
    list-style: none;
  }

  .valores li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .valores .resultado {
    align-self: center;
    font-size: 1.05rem;
    color: var(--acento);
  }

  .pie {
    display: flex;
    justify-content: flex-end;
    padding: 12px 20px 16px;
    border-top: 1px solid rgb(255 255 255 / 0.12);
  }

  .puntos-pocha {
    margin: 4px auto 8px;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  .puntos-pocha caption {
    font-size: 0.85rem;
    color: var(--texto-suave);
  }

  .puntos-pocha td {
    padding: 2px 8px;
  }

  .puntos-pocha .puntos {
    font-weight: 800;
  }

  .nota-ejemplo {
    margin: 4px 0 0;
    text-align: center;
    font-size: 0.9rem;
    color: var(--texto-suave);
  }
</style>
