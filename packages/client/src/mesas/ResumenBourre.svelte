<script lang="ts">
  import type { Asiento, ResultadoManoBourre } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoBourre;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  /** El jugador primero y los demás en el orden de la mesa. */
  const orden = $derived([0, 1, 2, 3, 4].map((i) => (yo + i) % 5));
  const signo = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  const linea = $derived.by(() => {
    const bote =
      resultado.ganador === null
        ? T.bourre.seQueda(resultado.bote)
        : T.bourre.seLleva(nombre(resultado.ganador), resultado.bote);
    if (resultado.bourre.length === 0) return bote;
    return `${bote} · ${T.bourre.bourre(resultado.bourre.map(nombre).join(', '))}`;
  });
  const bazas = (a: Asiento) =>
    resultado.juegan[a] === true
      ? `${resultado.bazas[a]}`
      : resultado.juegan[a] === false
        ? T.bourre.pasa
        : '–';
</script>

<p class="modo" data-testid="resumen-linea">{linea}</p>
<table data-testid="resumen-bourre">
  <thead>
    <tr>
      <th scope="col">{T.bourre.jugadorCol}</th>
      <th scope="col">{T.bourre.bazasCol}</th>
      <th scope="col">{T.bourre.cambioCol}</th>
      <th scope="col">{T.bourre.fichasCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{nombre(a)}</th>
        <td>{bazas(a)}</td>
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
