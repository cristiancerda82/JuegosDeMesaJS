<script lang="ts">
  import type { Asiento, ResultadoManoSieteYMedia } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoSieteYMedia;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, nombre }: Props = $props();
</script>

<ul class="jugadores">
  {#each resultado.cartas as cartas, a (a)}
    {@const variacion = resultado.variacion[a]!}
    <li data-testid="resultado-{a}" class:banca={a === resultado.banca}>
      <div class="cabecera">
        <b>{nombre(a)}</b>
        {#if a === resultado.banca}<span class="marca">{T.sieteYMedia.banca}</span>{/if}
        <span class="valor" class:pasado={resultado.pasados[a]}>
          {resultado.pasados[a] ? T.sieteYMedia.pasado : T.sieteYMedia.valor(resultado.valores[a]!)}
        </span>
        <span class="variacion" class:gana={variacion > 0} class:pierde={variacion < 0} data-testid="variacion-{a}">
          {T.sieteYMedia.variacion(variacion)}
        </span>
        <span class="fichas">{T.sieteYMedia.fichas(resultado.fichasTras[a]!)}</span>
      </div>
      <div class="cartas">
        {#each cartas as id (id)}
          <span class="mini"><Carta {id} /></span>
        {/each}
      </div>
    </li>
  {/each}
</ul>

<style>
  .jugadores {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: left;
  }

  .cabecera {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 10px;
    margin-bottom: 4px;
    font-variant-numeric: tabular-nums;
  }

  .marca {
    padding: 0 6px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #2b2005;
    background: var(--acento);
  }

  .valor {
    font-weight: 700;
  }

  .valor.pasado {
    color: var(--peligro);
  }

  .variacion {
    margin-left: auto;
    font-weight: 800;
  }

  .gana {
    color: #7bd88f;
  }

  .pierde {
    color: var(--peligro);
  }

  .fichas {
    color: var(--texto-suave);
    font-size: 0.88rem;
  }

  .cartas {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  .mini {
    display: block;
    width: 30px;
    aspect-ratio: 100 / 140;
  }
</style>
