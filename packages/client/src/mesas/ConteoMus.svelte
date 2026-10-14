<script lang="ts">
  import type { ConfigMus, ResultadoManoMus } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { T } from '../textos';
  import { nombreAsiento } from './bazas/asientos';

  interface Props {
    resultado: ResultadoManoMus;
    config: ConfigMus;
    /** Enseñar las cartas de los cuatro jugadores. */
    conCartas?: boolean;
  }

  let { resultado, config, conCartas = true }: Props = $props();

  const parejas = [T.mus.nosotros, T.mus.ellos];
  const parejasEn = [T.mus.nosotrosEn, T.mus.ellosEn];
  const celda = (n: number) => (n === 0 ? '–' : `${n}`);

  function estado(l: ResultadoManoMus['lances'][number]): string {
    switch (l.estado) {
      case 'paso':
        return T.mus.estadoLance.paso;
      case 'querido':
        return T.mus.estadoLance.querido(l.apuesta[0] + l.apuesta[1]);
      case 'noQuerido':
        return T.mus.estadoLance.noQuerido(
          l.apuesta[0] + l.apuesta[1],
          parejasEn[l.apuesta[0] > 0 ? 0 : 1]!,
        );
      case 'ordago':
        return T.mus.estadoLance.ordago;
      case 'sinApuesta':
        return T.mus.estadoLance.sinApuesta(l.ganador === null ? '' : parejasEn[l.ganador]!);
      case 'noSeJuega':
        return T.mus.estadoLance.noSeJuega;
    }
  }
</script>

<div class="conteo" data-testid="conteo-mus">
  {#if conCartas}
    <ul class="manos">
      {#each resultado.manos as cartas, a (a)}
        <li data-testid="cartas-{a}">
          <span class="quien">
            {nombreAsiento(a, 4)}{#if a === resultado.mano}<small>{' · '}{T.mus.mano}</small>{/if}
          </span>
          <span class="cartas">
            {#each cartas as id (id)}
              <span class="mini"><Carta {id} /></span>
            {/each}
          </span>
        </li>
      {/each}
    </ul>
  {/if}

  {#if resultado.ordago}
    <p class="nota" data-testid="por-ordago">{T.mus.porOrdago(T.mus.lances[resultado.ordago])}</p>
  {/if}

  <table>
    <thead>
      <tr>
        <th scope="col">{T.mus.lance}</th>
        <th scope="col">{T.mus.gana}</th>
        <th scope="col">{parejas[0]}</th>
        <th scope="col">{parejas[1]}</th>
      </tr>
    </thead>
    <tbody>
      {#each resultado.lances as l (l.lance)}
        <tr data-testid="lance-{l.lance}">
          <th scope="row">
            {T.mus.lances[l.lance]}
            <small>{estado(l)}</small>
          </th>
          <td>{l.ganador === null ? '–' : parejas[l.ganador]}</td>
          <td>{celda(l.apuesta[0] + l.jugadas[0])}</td>
          <td>{celda(l.apuesta[1] + l.jugadas[1])}</td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <th scope="row" colspan="2">{T.mus.total} · {T.opciones.piedrasN(config.puntos).toLowerCase()}</th>
        <td data-testid="piedras-0">{resultado.piedrasTras[0]}</td>
        <td data-testid="piedras-1">{resultado.piedrasTras[1]}</td>
      </tr>
    </tfoot>
  </table>

  {#if resultado.juegoGanado !== null}
    <p class="juego" data-testid="juego-ganado">{T.mus.ganaJuego(parejas[resultado.juegoGanado]!)}</p>
  {/if}
  <p class="nota">{T.mus.juegos(resultado.juegosTras[0], resultado.juegosTras[1])}</p>
</div>

<style>
  .conteo {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .manos {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .manos li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .quien {
    font-size: 0.85rem;
    font-weight: 600;
  }

  .quien small {
    font-weight: 400;
    color: var(--acento);
  }

  .cartas {
    display: flex;
    gap: 2px;
  }

  .mini {
    display: block;
    width: 30px;
    aspect-ratio: 100 / 140;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
    font-size: 0.95rem;
  }

  th,
  td {
    padding: 3px 5px;
  }

  thead th {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--texto-suave);
  }

  tbody th {
    text-align: left;
    font-weight: 600;
  }

  tbody th small {
    display: block;
    font-weight: 400;
    font-size: 0.75rem;
    color: var(--texto-suave);
  }

  td {
    text-align: center;
  }

  tfoot {
    border-top: 1px solid rgb(255 255 255 / 0.25);
    font-weight: 800;
  }

  tfoot th {
    text-align: left;
  }

  .juego {
    margin: 0;
    font-weight: 800;
    color: var(--acento);
  }

  .nota {
    margin: 0;
    font-size: 0.85rem;
    color: var(--texto-suave);
  }
</style>
