<script lang="ts">
  import type { Asiento, ResultadoManoTresillo } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoTresillo;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  /** El jugador primero y los demás en el orden de la mesa. */
  const orden = $derived([0, 1, 2].map((i) => (yo + i) % 3));
  const signo = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  const linea = $derived.by(() => {
    if (resultado.pasada) return T.tresillo.pasada(resultado.boteTras);
    const contrato = T.tresillo.contrato(
      resultado.contrato!,
      resultado.triunfo ? T.cartas.palos[resultado.triunfo]! : null,
    );
    const desenlace =
      resultado.desenlace === 'codillo'
        ? T.tresillo.codillo(nombre(resultado.codillo!))
        : T.tresillo.desenlace[resultado.desenlace!];
    return `${nombre(resultado.hombre!)} · ${contrato} · ${desenlace}`;
  });
</script>

<p class="modo" data-testid="resumen-linea">{linea}</p>
<table data-testid="resumen-tresillo">
  <thead>
    <tr>
      <th scope="col">{T.tresillo.jugadorCol}</th>
      <th scope="col">{T.tresillo.bazasCol}</th>
      <th scope="col">{T.tresillo.cambioCol}</th>
      <th scope="col">{T.tresillo.fichasCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{nombre(a)}{a === resultado.hombre ? ` (${T.tresillo.hombre})` : ''}</th>
        <td>{resultado.pasada ? '–' : resultado.bazas[a]}</td>
        <td data-testid="cambio-{i}">{signo(resultado.cambioFichas[a]!)}</td>
        <td>{resultado.fichasTras[a]}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    width: 100%;
    margin-bottom: 8px;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 3px 4px;
  }

  thead th {
    font-size: 0.78rem;
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
    white-space: nowrap;
  }

  .nuestro th,
  .nuestro td {
    color: var(--acento);
  }

  .modo {
    margin: 0 0 6px;
    color: var(--texto-suave);
  }
</style>
