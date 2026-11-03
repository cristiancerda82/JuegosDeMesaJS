<script lang="ts">
  import type { Asiento, ResultadoManoTruco } from '@juegos/engine';
  import { bandoDe, type InfoRed } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento } from './bazas/asientos';

  interface Props {
    resultado: ResultadoManoTruco;
    /** Nombre de cada bando: el del jugador primero. */
    lados: readonly [string, string];
    yo?: Asiento;
    jugadores: number;
    red?: InfoRed | null;
  }

  let { resultado, lados, yo = 0, jugadores, red = null }: Props = $props();

  const mio = $derived(bandoDe(yo));
  /** Índices de los bandos en el orden de las columnas. */
  const [a, b] = $derived(mio === 0 ? [0, 1] : [1, 0]);
  const lado = (bando: number) => lados[bando === mio ? 0 : 1]!;
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, jugadores, yo, red);

  const envido = $derived.by(() => {
    const e = resultado.envido;
    if (e.estado === 'nada' || e.ganador === null) return T.truco.sinEnvido;
    const cantos = e.cantos.map((c) => T.truco.cantos[c]).join(', ');
    return T.truco.envidoResumen(cantos, e.estado === 'querido', lado(e.ganador));
  });
  const mostrados = $derived(
    resultado.envido.mostrado.flatMap((p, s) =>
      p === null ? [] : [T.truco.puntosEnvido(nombre(s), p)],
    ),
  );
  const trucoTexto = $derived.by(() => {
    const t = resultado.truco;
    const gana = lado(resultado.ganadorMano);
    if (resultado.seFue !== null) return T.truco.seFueResumen(nombre(resultado.seFue), gana);
    if (t.pendiente > 0) {
      return T.truco.trucoResumen(
        `${T.truco.trucos[t.pendiente - 1]} ${T.truco.noQuiero.toLowerCase()}`,
        gana,
      );
    }
    return T.truco.trucoResumen(t.nivel > 0 ? T.truco.trucos[t.nivel - 1]! : null, gana);
  });
  const total = $derived(
    [0, 1].map((k) => resultado.puntosEnvido[k]! + resultado.puntosTruco[k]!),
  );
</script>

<p class="linea" data-testid="resumen-envido">{envido}</p>
{#if mostrados.length > 0}
  <p class="linea" data-testid="resumen-puntos-envido">{mostrados.join(' · ')}</p>
{/if}
<p class="linea" data-testid="resumen-truco">{trucoTexto}</p>
<table class="resumen" data-testid="resumen-truco-tabla">
  <thead>
    <tr>
      <th scope="col">{T.truco.concepto}</th>
      <th scope="col">{lados[0]}</th>
      <th scope="col">{lados[1]}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">{T.truco.filaEnvido}</th>
      <td>{resultado.puntosEnvido[a!]}</td>
      <td>{resultado.puntosEnvido[b!]}</td>
    </tr>
    <tr>
      <th scope="row">{T.truco.filaTruco}</th>
      <td>{resultado.puntosTruco[a!]}</td>
      <td>{resultado.puntosTruco[b!]}</td>
    </tr>
    <tr class="total">
      <th scope="row">{T.truco.totalMano}</th>
      <td data-testid="mano-0">{total[a!]}</td>
      <td data-testid="mano-1">{total[b!]}</td>
    </tr>
    <tr class="total">
      <th scope="row">{T.truco.puntosPartida}</th>
      <td data-testid="puntos-0">{resultado.puntosTras[a!]}</td>
      <td data-testid="puntos-1">{resultado.puntosTras[b!]}</td>
    </tr>
    <tr>
      <th scope="row"></th>
      <td class="suave" data-testid="malas-0">{T.truco.malasBuenas(resultado.puntosTras[a!]!)}</td>
      <td class="suave" data-testid="malas-1">{T.truco.malasBuenas(resultado.puntosTras[b!]!)}</td>
    </tr>
  </tbody>
</table>

<style>
  .linea {
    margin: 4px 0;
    color: var(--texto-suave);
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

  td.suave {
    white-space: nowrap;
    font-weight: 500;
    font-size: 0.85rem;
    color: var(--texto-suave);
  }

  .total th,
  .total td {
    border-top: 1px solid rgb(255 255 255 / 0.2);
  }

  .total td {
    color: var(--acento);
  }
</style>
