<script lang="ts">
  import type { Asiento, ResultadoManoEcarte } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoEcarte;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  /** El jugador primero y luego el rival. */
  const orden = $derived<[0 | 1, 0 | 1]>(yo === 0 ? [0, 1] : [1, 0]);

  /** Notas de la mano: el rey, la autoridad y el vole. */
  const notas = $derived.by(() => {
    const r = resultado;
    const n: string[] = [];
    if (r.reyVuelto) n.push(T.ecarte.reyVuelto(nombre(r.repartidor)));
    if (r.rey !== null) n.push(T.ecarte.rey(nombre(r.rey)));
    if (r.autoridad !== null) n.push(T.ecarte.autoridad(nombre(r.autoridad)));
    if (r.vole && r.ganador !== null) n.push(T.ecarte.vole(nombre(r.ganador)));
    if (!r.completa) n.push(T.ecarte.aMedias);
    return n;
  });
</script>

<p class="triunfo">{T.ecarte.triunfo(resultado.triunfo)}</p>
<table data-testid="resumen-ecarte">
  <thead>
    <tr>
      <th scope="col">{T.ecarte.jugadorCol}</th>
      <th scope="col">{T.ecarte.bazasCol}</th>
      <th scope="col">{T.ecarte.manoCol}</th>
      <th scope="col">{T.ecarte.totalCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{nombre(a)}</th>
        <td data-testid="bazas-{i}">{resultado.bazas[a]}</td>
        <td>+{resultado.puntosMano[a]}</td>
        <td data-testid="puntos-{i}"><b>{resultado.puntosTras[a]}</b></td>
      </tr>
    {/each}
  </tbody>
</table>
{#each notas as nota (nota)}
  <p class="nota">{nota}</p>
{/each}

<style>
  table {
    width: 100%;
    margin-bottom: 6px;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 4px 6px;
    text-align: center;
  }

  thead th {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--texto-suave);
  }

  tbody th {
    text-align: left;
    font-weight: 500;
  }

  .nuestro th,
  .nuestro td {
    color: var(--acento);
  }

  .triunfo,
  .nota {
    margin: 0 0 4px;
    color: var(--texto-suave);
  }
</style>
