<script lang="ts">
  import type { Asiento, ResultadoManoDoppelkopf } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoDoppelkopf;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  const asientos = $derived([0, 1, 2, 3].map((i) => (yo + i) % 4));
  const re = $derived(asientos.filter((a) => resultado.re.includes(a)));
  const contra = $derived(asientos.filter((a) => !resultado.re.includes(a)));
  const signo = (n: number) => (n > 0 ? `+${n}` : `${n}`);
</script>

<div data-testid="resumen-doppelkopf">
  <p class="bandos">
    <span data-testid="cartas-re">{T.doppelkopf.cartasDe('re', re.map(nombre).join(', '), resultado.cartasRe)}</span>
    <span data-testid="cartas-contra"
      >{T.doppelkopf.cartasDe('contra', contra.map(nombre).join(', '), resultado.cartasContra)}</span
    >
  </p>
  <p class="ganador" data-testid="ganador-mano">{T.doppelkopf.ganaBando(resultado.ganador)}</p>
  {#if resultado.conceptos.length > 0}
    <table class="conceptos">
      <tbody>
        {#each resultado.conceptos as c, i (i)}
          <tr>
            <th scope="row">{T.doppelkopf.concepto[c.tipo]}</th>
            <td>{T.doppelkopf.bando[c.bando]}</td>
            <td>+{c.puntos}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
  <table>
    <thead>
      <tr>
        <th scope="col">{T.doppelkopf.jugadorCol}</th>
        <th scope="col">{T.doppelkopf.manoCol}</th>
        <th scope="col">{T.doppelkopf.totalCol}</th>
      </tr>
    </thead>
    <tbody>
      {#each asientos as a, i (a)}
        <tr class:nuestro={i === 0}>
          <th scope="row">{nombre(a)}</th>
          <td data-testid="cambio-{i}">{signo(resultado.cambio[a]!)}</td>
          <td data-testid="total-{i}">{resultado.puntosTras[a]}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .bandos {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.9rem;
  }

  .ganador {
    margin: 4px 0;
    font-weight: 700;
    color: var(--acento);
  }

  table {
    width: 100%;
    margin-bottom: 8px;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 2px 4px;
  }

  thead th {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--texto-suave);
  }

  tbody th {
    text-align: left;
    font-weight: 500;
  }

  td {
    text-align: center;
    font-weight: 700;
  }

  .conceptos {
    font-size: 0.85rem;
  }

  .conceptos td {
    font-weight: 500;
  }

  tr.nuestro td {
    color: var(--acento);
  }
</style>
