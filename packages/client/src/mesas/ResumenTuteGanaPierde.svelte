<script lang="ts">
  import {
    DIEZ_DE_ULTIMAS_GANA_PIERDE,
    type Asiento,
    type ResultadoManoTuteGanaPierde,
  } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoTuteGanaPierde;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  const n = $derived(resultado.tantos.length);
  /** El jugador primero y los demás en el orden de la mesa. */
  const orden = $derived(Array.from({ length: n }, (_, i) => (yo + i) % n));
  const ultimas = (a: Asiento) => (a === resultado.ultimas ? DIEZ_DE_ULTIMAS_GANA_PIERDE : 0);
  const cartas = (a: Asiento) => resultado.tantos[a]! - resultado.cantados[a]! - ultimas(a);
  const nota = $derived(T.tuteGanaPierde.penalizados(resultado.penalizados.map(nombre)));
</script>

<p class="medio" class:propio={resultado.penalizados.includes(yo)} data-testid="resumen-medio">{nota}</p>
<table data-testid="resumen-tute-gana-pierde">
  <thead>
    <tr>
      <th scope="col">{T.burroBazas.jugadorCol}</th>
      <th scope="col">{T.tuteGanaPierde.cartasCol}</th>
      <th scope="col">{T.tuteGanaPierde.cantesCol}</th>
      <th scope="col">{T.tuteGanaPierde.ultimasCol}</th>
      <th scope="col">{T.tuteGanaPierde.tantosCol}</th>
      <th scope="col">{T.tuteGanaPierde.penasCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={i === 0} class:penalizado={resultado.penalizados.includes(a)}>
        <th scope="row">{nombre(a)}</th>
        <td>{cartas(a)}</td>
        <td>{resultado.cantados[a]}</td>
        <td>{ultimas(a)}</td>
        <td class="total" data-testid="tantos-{i}">{resultado.tantos[a]}</td>
        <td data-testid="penalizaciones-{i}">{resultado.penalizacionesTras[a]}</td>
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
    font-size: 0.75rem;
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

  .total {
    font-weight: 700;
  }

  .nuestro th,
  .nuestro td {
    color: var(--acento);
  }

  .penalizado td {
    text-decoration: underline;
  }

  .medio {
    margin: 0 0 6px;
    font-weight: 600;
    color: var(--acento);
  }

  .medio.propio {
    color: #ff9a9a;
  }
</style>
