<script lang="ts">
  import { HUMANO } from '../sesion/sesion.svelte';
  import type { Partida } from '../sesion/partida';
  import DesgloseEscoba from '../mesas/DesgloseEscoba.svelte';
  import ResultadoChinchon from '../mesas/ResultadoChinchon.svelte';
  import ResumenGuinote from '../mesas/ResumenGuinote.svelte';
  import ResultadoSieteYMedia from '../mesas/ResultadoSieteYMedia.svelte';
  import { formatoTiempo } from '../mesas/tiempo';
  import { T } from '../textos';

  interface Props {
    partida: Partida;
    revancha: () => void;
    menu: () => void;
  }

  let { partida, revancha, menu }: Props = $props();

  const fin = $derived(partida.sesion.fin!);

  const titulo = $derived.by(() => {
    if (partida.id === 'klondike' || partida.id === 'freecell') {
      return partida.sesion.vista.situacion === 'victoria' ? T.fin.solitarioGanado : T.fin.abandono;
    }
    if (fin.empate) return T.fin.empate;
    return fin.ganadores.includes(HUMANO) ? T.fin.victoria : T.fin.derrota;
  });

  // En el Chinchón y la Siete y media cada uno juega por su cuenta: no hay parejas.
  const parejas = $derived(
    partida.id !== 'klondike' &&
      partida.id !== 'freecell' &&
      partida.id !== 'chinchon' &&
      partida.id !== 'sieteYMedia' &&
      partida.id !== 'cinquillo' &&
      partida.sesion.vista.config.jugadores === 4,
  );

  /** En el Chinchón: nombres por asiento y clasificación por puntos. */
  const nombreChinchon = (asiento: number, jugadores: number) =>
    asiento === HUMANO ? T.brisca.tu : jugadores === 2 ? T.brisca.rival : T.brisca.rivalN(asiento);
  const lados = $derived(
    parejas ? [T.brisca.nosotros, T.brisca.ellos] : [T.brisca.tu, T.brisca.rival],
  );

  /** En el Tute, la mano que terminó por tute y el bando que lo cantó. */
  const tuteFinal = $derived.by(() => {
    if (partida.id !== 'tute') return null;
    const ultima = partida.sesion.vista.resultadosManos.at(-1);
    return ultima?.tute && ultima.ganador !== null ? lados[ultima.ganador]! : null;
  });
</script>

<div class="velo">
  <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-titulo" data-testid="fin">
    <h2 id="fin-titulo">{titulo}</h2>

    {#if partida.id === 'klondike'}
      <p>{T.fin.resumenKlondike(partida.sesion.vista.movimientos, formatoTiempo(partida.sesion.tiempoMs()))}</p>
    {:else if partida.id === 'freecell'}
      {@const vista = partida.sesion.vista}
      <p data-testid="resumen-freecell">
        {T.fin.resumenFreeCell(vista.numero, vista.movimientos, formatoTiempo(partida.sesion.tiempoMs()))}
      </p>
    {:else if partida.id === 'escoba'}
      {@const vista = partida.sesion.vista}
      {@const ultima = vista.resultadosManos.at(-1)}
      {#if ultima}
        <DesgloseEscoba
          resultado={ultima}
          lados={[lados[0]!, lados[1]!]}
          totales={vista.puntosPartida}
        />
      {/if}
    {:else if partida.id === 'guinote'}
      {@const ultima = partida.sesion.vista.resultadosManos.at(-1)}
      {#if ultima}
        <ResumenGuinote resultado={ultima} lados={[lados[0]!, lados[1]!]} />
      {/if}
      <p class="nota" data-testid="fin-guinote">
        {T.fin.manosJugadas(partida.sesion.vista.resultadosManos.length)}
      </p>
    {:else if partida.id === 'cinquillo'}
      {@const vista = partida.sesion.vista}
      {@const n = vista.config.jugadores}
      <table>
        <caption>{T.cinquillo.clasificacion}</caption>
        <tbody>
          {#each Array.from({ length: n }, (_, a) => a).sort((a, b) => vista.totales[a]! - vista.totales[b]!) as a (a)}
            <tr>
              <th scope="row">{nombreChinchon(a, n)}</th>
              <td data-testid="total-{a}">{vista.totales[a]}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else if partida.id === 'sieteYMedia'}
      {@const vista = partida.sesion.vista}
      {@const n = vista.config.jugadores}
      {@const ultima = vista.resultadosManos.at(-1)}
      {#if ultima}
        <ResultadoSieteYMedia resultado={ultima} nombre={(a) => nombreChinchon(a, n)} />
      {/if}
      <table>
        <caption>{T.sieteYMedia.clasificacion}</caption>
        <tbody>
          {#each Array.from({ length: n }, (_, a) => a).sort((a, b) => vista.fichas[b]! - vista.fichas[a]!) as a (a)}
            <tr>
              <th scope="row">{nombreChinchon(a, n)}</th>
              <td data-testid="fichas-{a}">{T.sieteYMedia.fichas(vista.fichas[a]!)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else if partida.id === 'chinchon'}
      {@const vista = partida.sesion.vista}
      {@const n = vista.config.jugadores}
      {@const ultima = vista.resultadosManos.at(-1)}
      {#if ultima}
        <ResultadoChinchon
          resultado={ultima}
          nombre={(a) => nombreChinchon(a, n)}
          eliminadosAntes={vista.resultadosManos.at(-2)?.eliminadosTras ?? new Array<boolean>(n).fill(false)}
        />
      {/if}
      <table>
        <caption>{T.chinchon.clasificacion}</caption>
        <tbody>
          {#each Array.from({ length: n }, (_, a) => a).sort((a, b) => vista.puntos[a]! - vista.puntos[b]!) as a (a)}
            <tr>
              <th scope="row">{nombreChinchon(a, n)}</th>
              <td data-testid="clasificacion-{a}">
                {vista.eliminados[a] ? T.chinchon.eliminado : T.chinchon.puntos(vista.puntos[a]!)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      {@const vista = partida.sesion.vista}
      {#if vista.config.manos === 1}
        {@const puntos = vista.resultadosManos[0]?.puntos ?? [0, 0]}
        <table>
          <caption>{T.fin.puntos}</caption>
          <tbody>
            {#each lados as lado, i (lado)}
              <tr><th scope="row">{lado}</th><td data-testid="puntos-{i}">{puntos[i]}</td></tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <table>
          <caption>{T.fin.manos}</caption>
          <tbody>
            {#each lados as lado, i (lado)}
              <tr><th scope="row">{lado}</th><td>{vista.manosGanadas[i]}</td></tr>
            {/each}
          </tbody>
        </table>
        <ol class="manos">
          {#each vista.resultadosManos as r, i (i)}
            <li>{r.puntos[0]} – {r.puntos[1]}</li>
          {/each}
        </ol>
      {/if}
      {#if partida.id === 'tute'}
        {#if tuteFinal}
          <p class="nota" data-testid="fin-tute">{T.fin.porTute(tuteFinal)}</p>
        {:else}
          <p class="nota">{T.fin.detallePuntos}</p>
        {/if}
      {/if}
    {/if}

    <div class="botones">
      <button class="principal" onclick={revancha} data-testid="revancha">{T.fin.revancha}</button>
      <button onclick={menu}>{T.fin.menu}</button>
    </div>
  </div>
</div>

<style>
  .velo {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgb(0 0 0 / 0.5);
    z-index: 2000;
    animation: aparecer var(--duracion) ease-out;
  }

  .dialogo {
    width: min(100%, 380px);
    padding: 22px 20px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  h2 {
    font-size: 1.6rem;
    margin-bottom: 10px;
  }

  table {
    margin: 10px auto;
    border-collapse: collapse;
    font-size: 1.1rem;
  }

  caption {
    color: var(--texto-suave);
    font-size: 0.9rem;
    margin-bottom: 4px;
  }

  th,
  td {
    padding: 4px 14px;
  }

  th {
    text-align: left;
    font-weight: 500;
  }

  td {
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .manos {
    margin: 0 auto 6px;
    padding: 0;
    list-style-position: inside;
    color: var(--texto-suave);
  }

  .nota {
    margin: 4px 0 0;
    font-size: 0.85rem;
    color: var(--texto-suave);
  }

  .botones {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
  }

  @keyframes aparecer {
    from {
      opacity: 0;
    }
  }
</style>
