<script lang="ts">
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';
  import type { EjemploAntesDespues, Zona } from './tipos';

  let { ejemplo }: { ejemplo: EjemploAntesDespues } = $props();

  const pasos: readonly [string, readonly Zona[]][] = $derived([
    [T.ayuda.antes, ejemplo.antes],
    [T.ayuda.despues, ejemplo.despues],
  ]);
</script>

<div class="antes-despues">
  {#each pasos as [titulo, zonas], p (p)}
    {#if p === 1}<span class="flecha" aria-hidden="true">→</span>{/if}
    <div class="paso">
      <span class="titulo">{titulo}</span>
      <div class="zonas">
        {#each zonas as zona, z (z)}
          <div class="zona">
            <div class="cartas" class:columna={zona.forma === 'columna'}>
              {#each zona.cartas as id, k (k)}
                <div class="hueco" class:resaltada={id !== null && ejemplo.resaltadas.includes(id)}>
                  <Carta {id} />
                </div>
              {/each}
              {#if zona.cartas.length === 0}<div class="hueco vacio"></div>{/if}
            </div>
            <span class="nombre">{zona.nombre}</span>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>
<p class="nota">{ejemplo.explicacion}</p>

<style>
  .antes-despues {
    --ancho-carta: 38px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .paso {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .titulo {
    font-size: 0.8rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--texto-suave);
  }

  .zonas {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px;
  }

  .zona {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    max-width: 100%;
  }

  /* Una zona con muchas cartas (un descarte, una mano) sigue en otra línea si no cabe. */
  .cartas {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  .cartas.columna {
    flex-direction: column;
    gap: 0;
  }

  .cartas.columna .hueco + .hueco {
    margin-top: calc(var(--ancho-carta) * -1.05);
  }

  .vacio {
    border: 2px dashed rgb(255 255 255 / 0.3);
  }

  .nombre {
    font-size: 0.75rem;
    color: var(--texto-suave);
  }

  .flecha {
    font-size: 1.4rem;
    color: var(--acento);
  }

  @media (max-width: 480px) {
    .antes-despues {
      flex-direction: column;
      align-items: flex-start;
    }

    .flecha {
      transform: rotate(90deg);
      align-self: center;
    }
  }
</style>
