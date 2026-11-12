<script lang="ts">
  import { ladoTwentyNine, type Asiento, type ResultadoManoTwentyNine } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoTwentyNine;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
  }

  let { resultado, yo, nombre }: Props = $props();

  const nuestro = $derived(ladoTwentyNine(yo));
  const signo = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  const linea = $derived.by(() => {
    if (resultado.pasada) return T.twentyNine.pasada;
    const triunfo = resultado.sinTriunfo
      ? T.twentyNine.sinTriunfo
      : T.twentyNine.palo(resultado.triunfo!);
    const estado = resultado.cumplida ? T.twentyNine.cumplida : T.twentyNine.fallada;
    return `${T.twentyNine.puja(resultado.puja!, nombre(resultado.pujador!), resultado.multiplicador)} · ${triunfo} · ${estado}`;
  });
  const filas = $derived([
    { lado: nuestro, texto: T.twentyNine.nosotros },
    { lado: 1 - nuestro, texto: T.twentyNine.ellos },
  ]);
</script>

<p class="modo" data-testid="resumen-linea">{linea}</p>
<table data-testid="resumen-twenty">
  <thead>
    <tr>
      <th scope="col">{T.twentyNine.parejaCol}</th>
      <th scope="col">{T.twentyNine.puntosCol}</th>
      <th scope="col">{T.twentyNine.cambioCol}</th>
      <th scope="col">{T.twentyNine.marcadorCol}</th>
    </tr>
  </thead>
  <tbody>
    {#each filas as f, i (f.lado)}
      <tr class:nuestro={i === 0}>
        <th scope="row">{f.texto}</th>
        <td>{resultado.pasada ? '–' : resultado.puntos[f.lado]}</td>
        <td data-testid="cambio-{i}">{signo(resultado.cambio[f.lado]!)}</td>
        <td>{resultado.marcadorTras[f.lado]}</td>
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

  .nuestro th,
  .nuestro td {
    color: var(--acento);
  }

  .modo {
    margin: 0 0 6px;
    color: var(--texto-suave);
  }
</style>
