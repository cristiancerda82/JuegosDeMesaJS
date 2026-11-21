<script lang="ts">
  import {
    baseRemigio,
    esComodinRemigio,
    numeroRemigio,
    type Asiento,
    type ResultadoManoRemigio,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoRemigio;
    /** Nombre de cada asiento visto desde el jugador. */
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, nombre }: Props = $props();

  /** Los que jugaron la mano: los eliminados antes no tienen cartas ni suman. */
  const filas = $derived(
    resultado.totalesTras.flatMap((_, a) =>
      a === resultado.cerro || resultado.manos[a]!.length > 0 ? [a] : [],
    ),
  );
  /** Con diez cartas se enseñan las cartas sin ligar de cada uno, no toda su mano. */
  const cartasDe = (a: Asiento) => resultado.sueltas?.[a] ?? resultado.manos[a]!;
  /** Con diez cartas, las de quien cerró: sus diez cartas ligadas, por número. */
  const ligadas = $derived(
    resultado.sueltas && resultado.cerro !== null
      ? [...resultado.manos[resultado.cerro]!].sort(
          (a, b) =>
            (esComodinRemigio(a) ? 99 : numeroRemigio(a)) -
              (esComodinRemigio(b) ? 99 : numeroRemigio(b)) || a.localeCompare(b),
        )
      : [],
  );
</script>

<p class="cierre" data-testid="quien-cierra">
  {#if resultado.cerro === null}
    {T.remigio.anulada}
  {:else if resultado.jugada && resultado.multiplicador}
    <span data-testid="cierre-diez">
      {T.remigio.cierreDiez(
        nombre(resultado.cerro),
        T.remigio.jugadas[resultado.jugada],
        resultado.conComodines === true,
        resultado.multiplicador,
      )}
    </span>
  {:else if resultado.remigio}
    <b class="remigio" data-testid="es-remigio">{T.remigio.remigio(nombre(resultado.cerro))}</b>
  {:else}
    {T.remigio.cierra(nombre(resultado.cerro))}
  {/if}
</p>
{#if ligadas.length > 0}
  <div class="cartas ligadas" data-testid="ligadas">
    {#each ligadas as carta (carta)}
      <span class="mini"><Carta id={baseRemigio(carta)} /></span>
    {/each}
  </div>
{/if}
<table data-testid="resumen-remigio">
  <thead>
    <tr>
      <th scope="col">{T.remigio.jugador}</th>
      <th scope="col">{resultado.sueltas ? T.remigio.sinLigarCol : T.remigio.lesQueda}</th>
      <th scope="col">{T.remigio.manoCol}</th>
      <th scope="col">{T.remigio.totalCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each filas as a (a)}
      <tr data-testid="fila-{a}" class:eliminado={resultado.eliminadosTras[a]}>
        <th scope="row">{nombre(a)}</th>
        <td>
          <div class="cartas">
            {#each cartasDe(a) as carta (carta)}
              <span class="mini"><Carta id={baseRemigio(carta)} /></span>
            {/each}
          </div>
        </td>
        <td data-testid="puntos-mano-{a}">{resultado.puntosMano[a]}</td>
        <td>
          {resultado.totalesTras[a]}
          {#if resultado.eliminadosTras[a]}<small>{T.remigio.eliminado}</small>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .cierre {
    margin: 0 0 6px;
  }

  .remigio {
    color: var(--acento);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 4px 6px;
  }

  thead th {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--texto-suave);
  }

  tbody th {
    text-align: left;
    font-weight: 500;
    white-space: nowrap;
  }

  td {
    text-align: center;
  }

  .cartas {
    display: flex;
    justify-content: center;
    padding-right: 12px;
  }

  .mini {
    display: block;
    width: 24px;
    aspect-ratio: 100 / 140;
    margin-right: -12px;
  }

  .ligadas {
    margin-bottom: 8px;
  }

  .eliminado td {
    color: #ff9a9a;
  }

  small {
    display: block;
    font-size: 0.75rem;
  }
</style>
