<script lang="ts">
  import type { Asiento, ResultadoManoSheepshead } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoSheepshead;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  /** El jugador primero y los demás en el orden de la mesa. */
  const orden = $derived([0, 1, 2, 3, 4].map((i) => (yo + i) % 5));
  const signo = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  const linea = $derived.by(() => {
    if (resultado.leaster) {
      return resultado.ganadorLeaster === null
        ? T.sheepshead.leasterSinGanador
        : T.sheepshead.ganaLeaster(nombre(resultado.ganadorLeaster));
    }
    const picker = T.sheepshead.pickerDe(nombre(resultado.picker!));
    const companero = resultado.solo
      ? T.sheepshead.solo
      : T.sheepshead.companeroDe(nombre(resultado.companero!));
    const res =
      resultado.puntosBando >= 61
        ? T.sheepshead.gana(resultado.puntosBando)
        : T.sheepshead.pierde(resultado.puntosBando);
    return `${picker} · ${companero} · ${res}`;
  });
</script>

<p class="modo" data-testid="resumen-linea">{linea}</p>
<table data-testid="resumen-sheepshead">
  <thead>
    <tr>
      <th scope="col">{T.sheepshead.jugadorCol}</th>
      <th scope="col">{T.sheepshead.puntosCol}</th>
      <th scope="col">{T.sheepshead.anotaCol}</th>
      <th scope="col">{T.sheepshead.marcadorCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{nombre(a)}</th>
        <td>{resultado.puntos[a]}</td>
        <td data-testid="anota-{i}">{signo(resultado.anotado[a]!)}</td>
        <td>{resultado.marcadorTras[a]}</td>
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
