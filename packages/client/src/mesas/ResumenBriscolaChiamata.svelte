<script lang="ts">
  import type { Asiento, ResultadoManoBriscolaChiamata } from '@juegos/engine';
  import { nombreCarta } from '../cartas/dibujo';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoBriscolaChiamata;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  const signo = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  const linea = $derived(
    T.briscolaChiamata.resumen(
      `${nombre(resultado.llamador)}: ${T.briscolaChiamata.nombrePuja(resultado.nivel)}`,
      nombreCarta(resultado.llamada),
      resultado.puntosBando,
      resultado.objetivo,
    ),
  );
  const companero = $derived(
    resultado.solo
      ? T.briscolaChiamata.solo
      : T.briscolaChiamata.companeroDe(nombre(resultado.companero)),
  );
  /** Primero el llamador y su compañero; después, los defensores. */
  const filas = $derived(
    [0, 1, 2, 3, 4].sort((a, b) => {
      const bando = (x: number) =>
        x === resultado.llamador ? 0 : !resultado.solo && x === resultado.companero ? 1 : 2;
      return bando(a) - bando(b) || a - b;
    }),
  );
</script>

<p class="modo" data-testid="resumen-linea">
  {linea} · {resultado.ganada ? T.briscolaChiamata.ganada : T.briscolaChiamata.perdida}
</p>
<p class="modo" data-testid="resumen-companero">{companero}</p>
<table data-testid="resumen-chiamata">
  <thead>
    <tr>
      <th scope="col">{T.briscolaChiamata.jugadorCol}</th>
      <th scope="col">{T.briscolaChiamata.cambioCol}</th>
      <th scope="col">{T.briscolaChiamata.marcadorCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each filas as a, i (a)}
      <tr class:mio={a === yo}>
        <th scope="row">{nombre(a)}</th>
        <td data-testid="cambio-{i}">{signo(resultado.cambio[a]!)}</td>
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
  }

  td {
    text-align: center;
  }

  .mio th,
  .mio td {
    color: var(--acento);
  }

  .modo {
    margin: 0 0 6px;
    color: var(--texto-suave);
  }
</style>
