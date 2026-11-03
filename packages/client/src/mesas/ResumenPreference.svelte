<script lang="ts">
  import { saldosPreference, type Asiento, type ResultadoManoPreference } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoPreference;
    yo: Asiento;
    nombre: (asiento: Asiento) => string;
    /** En la pantalla de fin: el cierre de cuentas de toda la partida. */
    cierre?: boolean;
  }

  let { resultado, yo, nombre, cierre = false }: Props = $props();

  /** El jugador primero y los demás en el orden de la mesa. */
  const orden = $derived([0, 1, 2].map((i) => (yo + i) % 3));
  const signo = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  /** Whists netos de cada uno: los que apunta menos los que le apuntan. */
  const netos = (w: readonly (readonly number[])[]) =>
    [0, 1, 2].map((a) => [0, 1, 2].reduce((s, b) => s + w[a]![b]! - w[b]![a]!, 0));
  const whistsMano = $derived(netos(resultado.whists));
  const saldos = $derived(
    saldosPreference(resultado.pulkaTras, resultado.montanaTras, resultado.whistsTras),
  );
  const whistsTotales = $derived(netos(resultado.whistsTras));

  const linea = $derived.by(() => {
    if (resultado.contrato === null || resultado.juega === null) return T.preference.raspasy;
    const contrato = T.preference.contrato(nombre(resultado.juega), T.preference.pujaLarga(resultado.contrato));
    if (resultado.sinJugar) return `${contrato} · ${T.preference.sinWhist}`;
    return `${contrato} · ${resultado.cumplido ? T.preference.cumple : T.preference.falla}`;
  });
</script>

<p class="modo" data-testid="resumen-contrato">{linea}</p>
{#if cierre}
  <table data-testid="cierre-preference">
    <thead>
      <tr>
        <th scope="col">{T.preference.jugadorCol}</th>
        <th scope="col">{T.preference.pulkaCol}</th>
        <th scope="col">{T.preference.montanaCol}</th>
        <th scope="col">{T.preference.whistsCol}</th>
        <th scope="col">{T.preference.saldoCol}</th>
      </tr>
    </thead>
    <tbody>
      {#each orden as a, i (a)}
        <tr class:nuestro={i === 0}>
          <th scope="row">{nombre(a)}</th>
          <td>{resultado.pulkaTras[a]}</td>
          <td>{resultado.montanaTras[a]}</td>
          <td>{signo(whistsTotales[a]!)}</td>
          <td data-testid="saldo-{i}"><b>{signo(saldos[a]!)}</b></td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <table data-testid="resumen-preference">
    <thead>
      <tr>
        <th scope="col">{T.preference.jugadorCol}</th>
        <th scope="col">{T.preference.bazasCol}</th>
        <th scope="col">{T.preference.pulkaCol}</th>
        <th scope="col">{T.preference.montanaCol}</th>
        <th scope="col">{T.preference.whistsCol}</th>
      </tr>
    </thead>
    <tbody>
      {#each orden as a, i (a)}
        <tr class:nuestro={i === 0}>
          <th scope="row">{nombre(a)}</th>
          <td data-testid="bazas-{i}">{resultado.sinJugar ? '–' : resultado.bazas[a]}</td>
          <td>{resultado.pulka[a] ? signo(resultado.pulka[a]!) : '0'} <small>({resultado.pulkaTras[a]})</small></td>
          <td>{resultado.montana[a] ? signo(resultado.montana[a]!) : '0'} <small>({resultado.montanaTras[a]})</small></td>
          <td data-testid="whists-{i}">{signo(whistsMano[a]!)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

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

  small {
    color: var(--texto-suave);
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
