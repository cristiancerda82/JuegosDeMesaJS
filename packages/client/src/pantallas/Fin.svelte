<script lang="ts">
  import { nombreNumerado } from '../mesas/bazas/asientos';
  import { bandoDe, porBando } from '../sesion/sesion-mesa';
  import type { Partida } from '../sesion/partida';
  import DesgloseEscoba from '../mesas/DesgloseEscoba.svelte';
  import ConteoMus from '../mesas/ConteoMus.svelte';
  import ResultadoChinchon from '../mesas/ResultadoChinchon.svelte';
  import ResumenGuinote from '../mesas/ResumenGuinote.svelte';
  import ResultadoSieteYMedia from '../mesas/ResultadoSieteYMedia.svelte';
  import ResumenPinacle from '../mesas/ResumenPinacle.svelte';
  import ResumenButifarra from '../mesas/ResumenButifarra.svelte';
  import ResumenTruc from '../mesas/ResumenTruc.svelte';
  import ResumenJulepe from '../mesas/ResumenJulepe.svelte';
  import ResumenTuteSubastado from '../mesas/ResumenTuteSubastado.svelte';
  import ResumenRemigio from '../mesas/ResumenRemigio.svelte';
  import { formatoTiempo } from '../mesas/tiempo';
  import { T } from '../textos';

  interface Props {
    partida: Partida;
    revancha: () => void;
    menu: () => void;
    /** En red, solo el anfitrión pide la revancha: los demás la esperan. */
    esperaRevancha?: boolean;
  }

  let { partida, revancha, menu, esperaRevancha = false }: Props = $props();

  const fin = $derived(partida.sesion.fin!);
  /** Asiento y bando del jugador: el fin se ve desde él. */
  const yo = $derived(partida.sesion.asiento);
  const mio = $derived(bandoDe(yo) as 0 | 1);

  const titulo = $derived.by(() => {
    if (partida.id === 'klondike' || partida.id === 'freecell' || partida.id === 'spider') {
      return partida.sesion.vista.situacion === 'victoria' ? T.fin.solitarioGanado : T.fin.abandono;
    }
    if (partida.id === 'burro') {
      return fin.ganadores.includes(yo) ? T.burro.librado : T.burro.eresBurro;
    }
    if (fin.empate) return T.fin.empate;
    return fin.ganadores.includes(yo) ? T.fin.victoria : T.fin.derrota;
  });

  // En el Chinchón y la Siete y media cada uno juega por su cuenta: no hay parejas.
  const parejas = $derived(
    partida.id !== 'klondike' &&
      partida.id !== 'freecell' &&
      partida.id !== 'spider' &&
      partida.id !== 'chinchon' &&
      partida.id !== 'sieteYMedia' &&
      partida.id !== 'cinquillo' &&
      partida.id !== 'pocha' &&
      partida.id !== 'mus' &&
      partida.id !== 'corazones' &&
      partida.id !== 'burro' &&
      partida.id !== 'julepe' &&
      partida.id !== 'remigio' &&
      partida.id !== 'tuteSubastado' &&
      partida.sesion.vista.config.jugadores === 4,
  );

  /** En el Chinchón: nombres por asiento y clasificación por puntos. */
  const nombreChinchon = (asiento: number, jugadores: number) =>
    nombreNumerado(asiento, jugadores, yo, partida.sesion.red, T.brisca.rivalN, T.brisca.rival);
  const lados = $derived(
    parejas ? [T.brisca.nosotros, T.brisca.ellos] : [T.brisca.tu, T.brisca.rival],
  );

  /** En el Tute, la mano que terminó por tute y el bando que lo cantó. */
  const tuteFinal = $derived.by(() => {
    if (partida.id !== 'tute') return null;
    const ultima = partida.sesion.vista.resultadosManos.at(-1);
    return ultima?.tute && ultima.ganador !== null ? lados[ultima.ganador === mio ? 0 : 1]! : null;
  });
</script>

<div class="velo">
  <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-titulo" data-testid="fin">
    <h2 id="fin-titulo">{titulo}</h2>

    {#if partida.id === 'klondike'}
      <p>{T.fin.resumenKlondike(partida.sesion.vista.movimientos, formatoTiempo(partida.sesion.tiempoMs()))}</p>
    {:else if partida.id === 'spider'}
      {@const vista = partida.sesion.vista}
      <p data-testid="resumen-spider">
        {T.fin.resumenSpider(vista.completadas.length, vista.movimientos, formatoTiempo(partida.sesion.tiempoMs()))}
      </p>
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
          bando={mio}
          totales={vista.puntosPartida}
        />
      {/if}
    {:else if partida.id === 'guinote'}
      {@const ultima = partida.sesion.vista.resultadosManos.at(-1)}
      {#if ultima}
        <ResumenGuinote resultado={ultima} lados={[lados[0]!, lados[1]!]} bando={mio} />
      {/if}
      <p class="nota" data-testid="fin-guinote">
        {T.fin.manosJugadas(partida.sesion.vista.resultadosManos.length)}
      </p>
    {:else if partida.id === 'mus'}
      {@const vista = partida.sesion.vista}
      {@const ultima = vista.resultadosManos.at(-1)}
      {#if ultima}
        <ConteoMus resultado={ultima} config={vista.config} conCartas={false} {yo} red={partida.sesion.red} />
      {/if}
      <table>
        <caption>{T.mus.clasificacion}</caption>
        <tbody>
          <tr><th scope="row">{T.mus.nosotros}</th><td data-testid="juegos-0">{vista.juegos[mio]}</td></tr>
          <tr><th scope="row">{T.mus.ellos}</th><td data-testid="juegos-1">{vista.juegos[1 - mio]}</td></tr>
        </tbody>
      </table>
    {:else if partida.id === 'pocha'}
      {@const vista = partida.sesion.vista}
      {@const n = vista.config.jugadores}
      <table>
        <caption>{T.pocha.clasificacion}</caption>
        <tbody>
          {#each Array.from({ length: n }, (_, a) => a).sort((a, b) => vista.totales[b]! - vista.totales[a]!) as a (a)}
            <tr>
              <th scope="row">{nombreChinchon(a, n)}</th>
              <td data-testid="total-{a}">{vista.totales[a]}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else if partida.id === 'corazones'}
      {@const vista = partida.sesion.vista}
      <table>
        <caption>{T.corazones.clasificacion}</caption>
        <tbody>
          {#each [0, 1, 2, 3].sort((a, b) => vista.totales[a]! - vista.totales[b]!) as a (a)}
            <tr>
              <th scope="row">{nombreChinchon(a, 4)}</th>
              <td data-testid="total-{a}">{vista.totales[a]}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else if partida.id === 'burro'}
      {@const vista = partida.sesion.vista}
      {@const n = vista.config.jugadores}
      {@const burro = vista.letras.findIndex((l) => l >= T.burro.palabra.length)}
      {#if burro !== -1 && burro !== yo}
        <p data-testid="quien-burro">{T.burro.esBurro(nombreChinchon(burro, n))}</p>
      {/if}
      <table>
        <caption>{T.burro.letrasCol}</caption>
        <tbody>
          {#each Array.from({ length: n }, (_, a) => a).sort((a, b) => vista.letras[a]! - vista.letras[b]!) as a (a)}
            <tr>
              <th scope="row">{nombreChinchon(a, n)}</th>
              <td class="letras" data-testid="letras-{a}">{T.burro.letras(vista.letras[a]!)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
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
    {:else if partida.id === 'remigio'}
      {@const vista = partida.sesion.vista}
      {@const n = vista.config.jugadores}
      {@const ultima = vista.resultadosManos.at(-1)}
      {#if ultima}
        <ResumenRemigio resultado={ultima} nombre={(a) => nombreChinchon(a, n)} />
      {/if}
      <table>
        <caption>{T.remigio.clasificacion}</caption>
        <tbody>
          {#each Array.from({ length: n }, (_, a) => a).sort((a, b) => vista.puntos[a]! - vista.puntos[b]!) as a (a)}
            <tr>
              <th scope="row">{nombreChinchon(a, n)}</th>
              <td data-testid="clasificacion-{a}">
                {vista.eliminados[a] ? T.remigio.eliminado : T.remigio.puntos(vista.puntos[a]!)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else if partida.id === 'tuteSubastado'}
      {@const vista = partida.sesion.vista}
      {@const ultima = vista.resultadosManos.at(-1)}
      {#if ultima}
        <ResumenTuteSubastado resultado={ultima} nombre={(a) => nombreChinchon(a, 4)} />
      {/if}
      <table>
        <caption>{T.tuteSubastado.clasificacion}</caption>
        <tbody>
          {#each [0, 1, 2, 3].sort((a, b) => vista.fichas[b]! - vista.fichas[a]!) as a (a)}
            <tr>
              <th scope="row">{nombreChinchon(a, 4)}</th>
              <td data-testid="fichas-{a}">{T.tuteSubastado.fichas(vista.fichas[a]!)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else if partida.id === 'julepe'}
      {@const vista = partida.sesion.vista}
      {@const n = vista.config.jugadores}
      {@const ultima = vista.resultadosManos.at(-1)}
      {#if ultima}
        <ResumenJulepe resultado={ultima} nombre={(a) => nombreChinchon(a, n)} />
      {/if}
      <table>
        <caption>{T.julepe.clasificacion}</caption>
        <tbody>
          {#each Array.from({ length: n }, (_, a) => a).sort((a, b) => vista.fichas[b]! - vista.fichas[a]!) as a (a)}
            <tr>
              <th scope="row">{nombreChinchon(a, n)}</th>
              <td data-testid="fichas-{a}">{T.julepe.fichas(vista.fichas[a]!)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else if partida.id === 'truc'}
      {@const vista = partida.sesion.vista}
      {@const ultima = vista.resultadosManos.at(-1)}
      {#if ultima}
        <ResumenTruc resultado={ultima} lados={[lados[0]!, lados[1]!]} {yo} jugadores={vista.config.jugadores} red={partida.sesion.red} />
      {/if}
      <table>
        <caption>{T.truc.camesTitulo}</caption>
        <tbody>
          {#each lados as lado, i (lado)}
            <tr><th scope="row">{lado}</th><td data-testid="cames-{i}">{porBando(vista.cames, yo)[i]}</td></tr>
          {/each}
        </tbody>
      </table>
    {:else if partida.id === 'butifarra'}
      {@const vista = partida.sesion.vista}
      {@const ultima = vista.resultadosManos.at(-1)}
      {#if ultima}
        <ResumenButifarra resultado={ultima} lados={[lados[0]!, lados[1]!]} bando={mio} {yo} red={partida.sesion.red} />
      {/if}
      <p class="nota" data-testid="fin-butifarra">{T.fin.manosJugadas(vista.resultadosManos.length)}</p>
    {:else if partida.id === 'pinacle'}
      {@const vista = partida.sesion.vista}
      {#if vista.ultimaMano}
        <ResumenPinacle resultado={vista.ultimaMano} lados={[lados[0]!, lados[1]!]} bando={mio} />
      {/if}
      <table>
        <caption>{T.pinacle.clasificacion}</caption>
        <tbody>
          {#each lados as lado, i (lado)}
            <tr><th scope="row">{lado}</th><td data-testid="puntos-{i}">{porBando(vista.puntos, yo)[i]}</td></tr>
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
              <tr><th scope="row">{lado}</th><td data-testid="puntos-{i}">{porBando(puntos, yo)[i]}</td></tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <table>
          <caption>{T.fin.manos}</caption>
          <tbody>
            {#each lados as lado, i (lado)}
              <tr><th scope="row">{lado}</th><td>{porBando(vista.manosGanadas, yo)[i]}</td></tr>
            {/each}
          </tbody>
        </table>
        <ol class="manos">
          {#each vista.resultadosManos as r, i (i)}
            <li>{porBando(r.puntos, yo).join(' – ')}</li>
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

    {#if partida.sesion.def.pista}
      <p class="nota" data-testid="pistas-usadas">{T.partida.pistasUsadas(partida.sesion.pistas)}</p>
    {/if}

    {#if partida.sesion.novedades}
      {@const n = partida.sesion.novedades}
      {#if n.racha >= 2 || n.mejorRacha || n.mejorTiempo || n.menosMovimientos}
        <ul class="novedades" data-testid="novedades">
          {#if n.racha >= 2}<li data-testid="racha-en-curso">{T.estadisticas.rachaEnCurso(n.racha)}</li>{/if}
          {#if n.mejorRacha}<li>{T.estadisticas.nuevaMejorRacha}</li>{/if}
          {#if n.mejorTiempo}<li data-testid="record-tiempo">{T.estadisticas.recordTiempo}</li>{/if}
          {#if n.menosMovimientos}<li data-testid="record-movimientos">{T.estadisticas.recordMovimientos}</li>{/if}
        </ul>
      {/if}
    {/if}

    <div class="botones">
      {#if esperaRevancha}
        <p class="nota" role="status" data-testid="espera-revancha">{T.red.esperandoRevancha}</p>
      {:else}
        <button class="principal" onclick={revancha} data-testid="revancha">{T.fin.revancha}</button>
      {/if}
      <button onclick={menu}>{partida.sesion.red ? T.red.salir : T.fin.menu}</button>
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

  .letras {
    font-family: ui-monospace, monospace;
    letter-spacing: 0.15em;
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

  .novedades {
    margin: 10px 0 0;
    padding: 0;
    list-style: none;
    font-weight: 700;
    color: var(--acento);
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
