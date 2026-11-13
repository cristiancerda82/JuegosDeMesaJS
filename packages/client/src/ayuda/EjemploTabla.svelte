<script lang="ts">
  import type { EjemploTabla } from './tipos';

  let { ejemplo }: { ejemplo: EjemploTabla } = $props();
</script>

<table>
  <caption>{ejemplo.titulo}</caption>
  <tbody>
    {#each ejemplo.filas as [situacion, resultado], i (i)}
      <tr>
        <td>{situacion}</td>
        <td aria-hidden="true">→</td>
        <td class="resultado-tabla">{resultado}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    margin: 0 auto;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  caption {
    font-size: 0.85rem;
    color: var(--texto-suave);
  }

  td {
    padding: 2px 8px;
  }

  .resultado-tabla {
    font-weight: 800;
  }
</style>
