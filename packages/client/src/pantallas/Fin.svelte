<script lang="ts">
  import { HUMANO } from '../sesion/sesion.svelte';
  import type { Partida } from '../sesion/partida';
  import DesgloseEscoba from '../mesas/DesgloseEscoba.svelte';
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
    if (partida.id === 'klondike') {
      return partida.sesion.vista.situacion === 'victoria' ? T.fin.solitarioGanado : T.fin.abandono;
    }
    if (fin.empate) return T.fin.empate;
    return fin.ganadores.includes(HUMANO) ? T.fin.victoria : T.fin.derrota;
  });

  const parejas = $derived(partida.id !== 'klondike' && partida.sesion.vista.config.jugadores === 4);
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
