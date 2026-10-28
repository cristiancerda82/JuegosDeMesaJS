<script lang="ts">
  import { parejaBridge, type Asiento, type ResultadoManoBridge } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultados: readonly ResultadoManoBridge[];
    /** Nombre de cada pareja vista desde el jugador: la suya primero. */
    lados: [string, string];
    /** Pareja del jugador. */
    bando: 0 | 1;
    nombre: (asiento: Asiento) => string;
    /** Mano que se resalta (la que acaba de terminar). */
    destacar?: number | null;
  }

  let { resultados, lados, bando, nombre, destacar = null }: Props = $props();

  const contrato = (r: ResultadoManoBridge) =>
    T.bridge.porQuien(
      `${T.bridge.puja(r.contrato.nivel, r.contrato.denominacion)}${T.bridge.doblado(r.contrato.doblado)}`,
      nombre(r.contrato.declarante),
    );
</script>

<table data-testid="resumen-bridge">
  <thead>
    <tr>
      <th scope="col">{T.bridge.manoCol}</th>
      <th scope="col">{T.bridge.contratoCol}</th>
      <th scope="col">{T.bridge.resultadoCol}</th>
      <th scope="col">{lados[0]}</th>
      <th scope="col">{lados[1]}</th>
    </tr>
  </thead>
  <tbody>
    {#each resultados as r, i (i)}
      <tr class:destacada={i === destacar} data-testid="mano-bridge-{i}">
        <th scope="row">{i + 1}</th>
        <td class="contrato" class:nuestro={parejaBridge(r.contrato.declarante) === bando}>
          {contrato(r)}
        </td>
        <td data-testid="resultado-{i}">{T.bridge.resultado(r.diferencia)}</td>
        <td>{r.puntosMano[bando] || ''}</td>
        <td>{r.puntosMano[1 - bando] || ''}</td>
      </tr>
    {/each}
  </tbody>
  {#if resultados.length > 0}
    <tfoot>
      <tr>
        <th scope="row" colspan="3">{T.bridge.clasificacion}</th>
        <td data-testid="total-0">{resultados.at(-1)!.puntosTras[bando]}</td>
        <td data-testid="total-1">{resultados.at(-1)!.puntosTras[1 - bando]}</td>
      </tr>
    </tfoot>
  {/if}
</table>

<style>
  table {
    width: 100%;
    margin-bottom: 8px;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
    font-size: 0.9rem;
  }

  th,
  td {
    padding: 3px 4px;
  }

  thead th {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--texto-suave);
  }

  tbody th {
    font-weight: 500;
    color: var(--texto-suave);
  }

  td {
    text-align: center;
    font-weight: 700;
  }

  td.contrato {
    font-weight: 500;
    text-align: left;
  }

  td.contrato.nuestro {
    color: var(--acento);
  }

  tr.destacada {
    background: rgb(255 255 255 / 0.08);
  }

  tfoot th {
    text-align: right;
  }
</style>
