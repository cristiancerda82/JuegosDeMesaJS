<script lang="ts">
  import type { Asiento, ResultadoManoTruc } from '@juegos/engine';
  import { bandoDe, type InfoRed } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento } from './bazas/asientos';

  interface Props {
    resultado: ResultadoManoTruc;
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

  const envit = $derived.by(() => {
    const e = resultado.envit;
    if (e.estado === 'nada' || e.ganador === null) return T.truc.sinEnvit;
    return T.truc.envitResumen(T.truc.nivelesEnvit[e.nivel]!, e.estado === 'querido', lado(e.ganador));
  });
  const mostrados = $derived(
    resultado.envit.mostrado.flatMap((p, s) => (p === null ? [] : [T.truc.puntosEnvit(nombre(s), p)])),
  );
  const trucTexto = $derived.by(() => {
    const t = resultado.truc;
    const gana = lado(resultado.ganadorMano);
    if (resultado.seFue !== null) return T.truc.seFueResumen(nombre(resultado.seFue), gana);
    if (t.pendiente > 0) return T.truc.trucResumen(`${T.truc.trucs[t.pendiente - 1]} ${T.truc.noVull.toLowerCase()}`, gana);
    return T.truc.trucResumen(t.nivel > 0 ? T.truc.trucs[t.nivel - 1]! : null, gana);
  });
  const total = $derived(
    [0, 1].map((k) => resultado.piedrasEnvit[k]! + resultado.piedrasTruc[k]!),
  );
</script>

<p class="linea" data-testid="resumen-envit">{envit}</p>
{#if mostrados.length > 0}
  <p class="linea" data-testid="resumen-puntos-envit">{mostrados.join(' · ')}</p>
{/if}
<p class="linea" data-testid="resumen-truc">{trucTexto}</p>
<table class="resumen" data-testid="resumen-truc-tabla">
  <thead>
    <tr>
      <th scope="col">{T.truc.concepto}</th>
      <th scope="col">{lados[0]}</th>
      <th scope="col">{lados[1]}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">{T.truc.filaEnvit}</th>
      <td>{resultado.piedrasEnvit[a!]}</td>
      <td>{resultado.piedrasEnvit[b!]}</td>
    </tr>
    <tr>
      <th scope="row">{T.truc.filaTruc}</th>
      <td>{resultado.piedrasTruc[a!]}</td>
      <td>{resultado.piedrasTruc[b!]}</td>
    </tr>
    <tr class="total">
      <th scope="row">{T.truc.totalMano}</th>
      <td data-testid="mano-0">{total[a!]}</td>
      <td data-testid="mano-1">{total[b!]}</td>
    </tr>
    <tr class="total">
      <th scope="row">{T.truc.piedrasCame}</th>
      <td data-testid="piedras-0">{resultado.piedrasTras[a!]}</td>
      <td data-testid="piedras-1">{resultado.piedrasTras[b!]}</td>
    </tr>
  </tbody>
</table>
{#if resultado.came !== null}
  <p class="came" data-testid="came-cerrada">{T.truc.cameCerrada(lado(resultado.came))}</p>
{/if}

<style>
  .linea {
    margin: 4px 0;
    color: var(--texto-suave);
  }

  .came {
    margin: 8px 0 0;
    font-weight: 700;
    color: var(--acento);
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
