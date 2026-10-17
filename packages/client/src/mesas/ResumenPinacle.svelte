<script lang="ts">
  import type { ResultadoManoPinacle } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoPinacle;
    /** Nombre de cada bando: el del humano primero. */
    lados: readonly [string, string];
    /** Bando del jugador: sus valores van en la primera columna. */
    bando?: 0 | 1;
  }

  let { resultado, lados, bando = 0 }: Props = $props();

  /** Bandos en el orden de las columnas. */
  const orden = $derived(bando === 0 ? ([0, 1] as const) : ([1, 0] as const));

  const d = $derived(resultado.desglose);

  /** Las filas del desglose; las que valen 0 en los dos bandos no se muestran. */
  const filas = $derived(
    [
      { concepto: T.pinacle.enMesa, valores: d.map((x) => x.enMesa), siempre: true },
      { concepto: T.pinacle.premioCerrar, valores: d.map((x) => x.cerrar) },
      { concepto: T.pinacle.premioSinComodin, valores: d.map((x) => x.sinComodin) },
      { concepto: T.pinacle.premioDeGolpe, valores: d.map((x) => x.deGolpe) },
      { concepto: T.pinacle.premioCambios, valores: d.map((x) => x.cambios) },
      { concepto: T.pinacle.enMano, valores: d.map((x) => x.enMano), siempre: true },
      { concepto: T.pinacle.penalizacion, valores: d.map((x) => x.barbele) },
    ].filter((f) => f.siempre || f.valores.some((v) => v !== 0)),
  );

  /** Combinaciones con premio de cada bando. */
  const premios = $derived(
    d.map((x) =>
      x.combinaciones
        .filter((c) => c.premio !== null)
        .map((c) => `${T.pinacle.premios[c.premio!]} (${c.valor})`),
    ),
  );
</script>

<table class="resumen" data-testid="resumen-pinacle">
  <thead>
    <tr>
      <th scope="col"></th>
      <th scope="col">{lados[0]}</th>
      <th scope="col">{lados[1]}</th>
    </tr>
  </thead>
  <tbody>
    {#each filas as fila (fila.concepto)}
      <tr>
        <th scope="row">{fila.concepto}</th>
        <td>{fila.valores[orden[0]]}</td>
        <td>{fila.valores[orden[1]]}</td>
      </tr>
    {/each}
    <tr class="total">
      <th scope="row">{T.pinacle.totalMano}</th>
      <td data-testid="mano-0">{d[orden[0]]!.total}</td>
      <td data-testid="mano-1">{d[orden[1]]!.total}</td>
    </tr>
    <tr class="total">
      <th scope="row">{T.pinacle.acumulado}</th>
      <td data-testid="acumulado-0">{resultado.puntosTras[orden[0]]}</td>
      <td data-testid="acumulado-1">{resultado.puntosTras[orden[1]]}</td>
    </tr>
  </tbody>
</table>
{#each orden as b, i (b)}
  {@const lista = premios[b]!}
  {#if lista.length > 0}
    <p class="premios" data-testid="premios-{i}"><b>{lados[i]}:</b> {lista.join(' · ')}</p>
  {/if}
{/each}

<style>
  .resumen {
    margin: 6px auto;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 3px 10px;
  }

  thead th {
    color: var(--texto-suave);
    font-weight: 600;
    font-size: 0.88rem;
  }

  tbody th {
    text-align: left;
    font-weight: 500;
  }

  td {
    text-align: center;
    font-weight: 700;
  }

  .total th,
  .total td {
    border-top: 1px solid rgb(255 255 255 / 0.2);
  }

  .total td {
    color: var(--acento);
  }

  .premios {
    margin: 4px 0 0;
    font-size: 0.85rem;
    color: var(--texto-suave);
  }
</style>
