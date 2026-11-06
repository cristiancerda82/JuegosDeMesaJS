<script lang="ts">
  import type { Asiento, ResultadoRondaTreinta } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoRondaTreinta;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  const n = $derived(resultado.vidasTras.length);
  /** El jugador primero y los demás en el orden de la mesa, sin los que ya no jugaban. */
  const orden = $derived(
    Array.from({ length: n }, (_, i) => (yo + i) % n).filter((a) => resultado.valores[a] !== null),
  );
  const linea = $derived(
    `${resultado.plantado === null ? T.treinta.sinPlantar : T.treinta.seHaPlantado(nombre(resultado.plantado))} · ${T.treinta.pierden(resultado.pierden.map(nombre).join(', '))}`,
  );
  const valor = (v: number) => String(v).replace('.', ',');
</script>

<p class="modo" data-testid="resumen-linea">{linea}</p>
<table data-testid="resumen-treinta">
  <thead>
    <tr>
      <th scope="col">{T.treinta.jugadorCol}</th>
      <th scope="col">{T.treinta.manoCol}</th>
      <th scope="col">{T.treinta.valorCol}</th>
      <th scope="col">{T.treinta.vidasCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each orden as a, i (a)}
      <tr class:nuestro={a === yo} class:pierde={resultado.pierden.includes(a)}>
        <th scope="row">{nombre(a)}</th>
        <td class="cartas">
          {#each resultado.manos[a] ?? [] as c (c)}
            <span class="mini"><Carta id={c} /></span>
          {/each}
        </td>
        <td data-testid="valor-{i}">{valor(resultado.valores[a]!)}</td>
        <td>{resultado.vidasTras[a]}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    width: 100%;
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
  }

  .cartas {
    display: flex;
    gap: 2px;
    justify-content: center;
  }

  .mini {
    display: block;
    width: 24px;
    aspect-ratio: 100 / 140;
  }

  .nuestro th,
  .nuestro td {
    color: var(--acento);
  }

  .pierde td:last-child {
    color: var(--peligro);
    font-weight: 700;
  }

  .modo {
    margin: 0 0 6px;
    color: var(--texto-suave);
  }
</style>
