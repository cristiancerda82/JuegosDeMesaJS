<script lang="ts">
  import type { IdCarta } from '@juegos/engine';
  import { T } from '../textos';
  import Carta from './Carta.svelte';
  import { temas } from './tema.svelte';
  import { TEMAS } from './temas';
  import type { Baraja } from './temas/tipos';

  /**
   * Elección del diseño de cada baraja, con una vista previa de cada tema: un as, un numeral y
   * una figura (spec temas-naipes, «Elegir el tema»). Son radios: teclado y lector de pantalla
   * funcionan sin más.
   */
  const BARAJAS: readonly { id: Baraja; nombre: string; muestra: readonly IdCarta[] }[] = [
    { id: 'espanola', nombre: T.cartas.barajaEspanola, muestra: ['oros-1', 'copas-7', 'bastos-12'] },
    { id: 'francesa', nombre: T.cartas.barajaFrancesa, muestra: ['picas-1', 'corazones-7', 'treboles-13'] },
  ];

  // Para las vistas previas hacen falta todos los temas de las dos barajas.
  for (const b of BARAJAS) for (const id of TEMAS[b.id]) void temas.cargar(id);
</script>

<div class="selector">
  {#each BARAJAS as baraja (baraja.id)}
    <fieldset data-testid="temas-{baraja.id}">
      <legend>{T.cartas.temaDe(baraja.nombre.toLowerCase())}</legend>
      <div class="opciones">
        {#each TEMAS[baraja.id] as id (id)}
          <label class="opcion" class:elegida={temas.elegido[baraja.id] === id}>
            <input
              type="radio"
              name="tema-{baraja.id}"
              value={id}
              checked={temas.elegido[baraja.id] === id}
              onchange={() => temas.elegir(baraja.id, id)}
              data-testid="tema-{baraja.id}-{id}"
            />
            <span class="muestra" aria-hidden="true">
              {#each baraja.muestra as carta (carta)}
                <span class="hueco"><Carta id={carta} tema={id} /></span>
              {/each}
            </span>
            <span class="nombre">{T.cartas.temas[id]}</span>
          </label>
        {/each}
      </div>
    </fieldset>
  {/each}
</div>

<style>
  .selector {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  fieldset {
    margin: 0;
    padding: 8px 12px 12px;
    border: 1px solid rgb(255 255 255 / 0.2);
    border-radius: var(--radio);
  }

  legend {
    padding: 0 6px;
    font-weight: 700;
  }

  .opciones {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .opcion {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px;
    border-radius: var(--radio);
    border: 2px solid transparent;
    background: rgb(0 0 0 / 0.2);
    cursor: pointer;
  }

  .opcion.elegida {
    border-color: var(--acento);
  }

  .opcion:has(input:focus-visible) {
    outline: 3px solid var(--resalte);
    outline-offset: 2px;
  }

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .muestra {
    display: flex;
    gap: 4px;
  }

  .hueco {
    width: 46px;
    aspect-ratio: 100 / 140;
  }

  .nombre {
    font-weight: 600;
  }
</style>
