<script lang="ts">
  import type { Asiento, ResultadoManoButifarra } from '@juegos/engine';
  import type { InfoRed } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento } from './bazas/asientos';

  interface Props {
    resultado: ResultadoManoButifarra;
    /** Nombre de cada bando: el del jugador primero. */
    lados: readonly [string, string];
    /** Bando del jugador: sus valores van en la primera columna. */
    bando?: number;
    yo?: Asiento;
    red?: InfoRed | null;
  }

  let { resultado, lados, bando = 0, yo = 0, red = null }: Props = $props();

  /** Índices de los bandos en el orden de las columnas. */
  const [a, b] = $derived(bando === 0 ? [0, 1] : [1, 0]);

  const triunfo = $derived(
    resultado.eleccion.triunfo === null
      ? T.butifarra.sinTriunfo
      : T.butifarra.palo(resultado.eleccion.triunfo),
  );
  const quien = $derived(
    T.butifarra.elige(nombreAsiento(resultado.eleccion.quien, 4, yo, red), resultado.eleccion.delegada),
  );
  const cartas = $derived(resultado.puntos.map((p, i) => p - resultado.bazas[i]!));
  const empate = $derived(resultado.puntos[0] === resultado.puntos[1]);
</script>

<p class="eleccion" data-testid="resumen-eleccion">
  {T.butifarra.triunfo}: <b>{triunfo}</b>, {quien} · <b>{T.butifarra.multiplicador(resultado.multiplicador)}</b>
</p>
<table class="resumen" data-testid="resumen-butifarra">
  <thead>
    <tr>
      <th scope="col">{T.butifarra.concepto}</th>
      <th scope="col">{lados[0]}</th>
      <th scope="col">{lados[1]}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">{T.butifarra.cartas}</th>
      <td>{cartas[a!]}</td>
      <td>{cartas[b!]}</td>
    </tr>
    <tr>
      <th scope="row">{T.butifarra.bazas}</th>
      <td>{resultado.bazas[a!]}</td>
      <td>{resultado.bazas[b!]}</td>
    </tr>
    <tr class="total">
      <th scope="row">{T.butifarra.totalMano}</th>
      <td data-testid="mano-0">{resultado.puntos[a!]}</td>
      <td data-testid="mano-1">{resultado.puntos[b!]}</td>
    </tr>
    <tr class="total">
      <th scope="row">{T.butifarra.anotados}</th>
      <td data-testid="anotados-0">{resultado.anotados[a!]}</td>
      <td data-testid="anotados-1">{resultado.anotados[b!]}</td>
    </tr>
    <tr class="total">
      <th scope="row">{T.butifarra.totalPartida}</th>
      <td data-testid="total-0">{resultado.totalesTras[a!]}</td>
      <td data-testid="total-1">{resultado.totalesTras[b!]}</td>
    </tr>
  </tbody>
</table>
{#if empate}
  <p class="eleccion">{T.butifarra.empate36}</p>
{/if}

<style>
  .eleccion {
    margin: 4px 0;
    color: var(--texto-suave);
  }

  .eleccion b {
    color: var(--texto);
  }

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
</style>
