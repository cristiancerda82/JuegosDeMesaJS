<script lang="ts">
  import type { PuntosCasino, RecuentoCasino, ResultadoManoCasino } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoCasino;
    /** Nombre de cada jugador o pareja, por bando. */
    nombres: readonly string[];
  }

  let { resultado, nombres }: Props = $props();

  type Fila = {
    clave: string;
    nombre: string;
    celda: (r: RecuentoCasino, p: PuntosCasino) => string;
  };

  /** Cada concepto: lo reunido y, entre paréntesis, los puntos que da. */
  const conPuntos = (cuantos: number | string, puntos: number) =>
    puntos > 0 ? `${cuantos} (${puntos})` : `${cuantos}`;

  const FILAS: readonly Fila[] = [
    { clave: 'cartas', nombre: T.casino.conceptoCartas, celda: (r, p) => conPuntos(r.cartas, p.cartas) },
    { clave: 'picas', nombre: T.casino.conceptoPicas, celda: (r, p) => conPuntos(r.picas, p.picas) },
    { clave: 'big', nombre: T.casino.bigCasino, celda: (r) => (r.bigCasino ? '2' : '–') },
    { clave: 'little', nombre: T.casino.littleCasino, celda: (r) => (r.littleCasino ? '1' : '–') },
    { clave: 'ases', nombre: T.casino.ases, celda: (r) => `${r.ases}` },
    { clave: 'barridas', nombre: T.casino.barridasConcepto, celda: (r) => `${r.barridas}` },
  ];
</script>

<table data-testid="resumen-casino">
  <thead>
    <tr>
      <th></th>
      {#each nombres as nombre, b (b)}
        <th scope="col">{nombre}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each FILAS as fila (fila.clave)}
      <tr>
        <th scope="row">{fila.nombre}</th>
        {#each resultado.recuento as r, b (b)}
          <td data-testid="{fila.clave}-{b}">{fila.celda(r, resultado.puntos[b]!)}</td>
        {/each}
      </tr>
    {/each}
    <tr class="total">
      <th scope="row">{T.casino.totalMano}</th>
      {#each resultado.puntos as p, b (b)}
        <td data-testid="mano-{b}">{p.total}</td>
      {/each}
    </tr>
    <tr class="total">
      <th scope="row">{T.casino.totalPartida}</th>
      {#each resultado.totales as t, b (b)}
        <td data-testid="total-mano-{b}">{t}</td>
      {/each}
    </tr>
  </tbody>
</table>

<style>
  table {
    margin: 0 auto;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
    font-size: 0.9rem;
  }

  th,
  td {
    padding: 3px 6px;
  }

  thead th {
    color: var(--texto-suave);
    font-size: 0.8rem;
    font-weight: 600;
  }

  tbody th {
    text-align: left;
    font-weight: 500;
  }

  td {
    text-align: center;
  }

  tr.total td,
  tr.total th {
    font-weight: 700;
    border-top: 1px solid rgb(255 255 255 / 0.2);
  }

  tr.total td {
    color: var(--acento);
  }
</style>
