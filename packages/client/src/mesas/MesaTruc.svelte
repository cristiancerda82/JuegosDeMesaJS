<script lang="ts">
  import type {
    AccionTruc,
    Asiento,
    ConfigTruc,
    EstadoTruc,
    IdCarta,
    VistaTruc,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import { bandoDe, porBando, type SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenTruc from './ResumenTruc.svelte';

  interface Props {
    sesion: SesionMesa<ConfigTruc, EstadoTruc, AccionTruc, VistaTruc>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const mio = $derived(bandoDe(sesion.asiento));

  const jugable = (carta: IdCarta) =>
    legales.some((a) => a.tipo === 'jugar' && a.carta === carta);
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, n, sesion.asiento, sesion.red);
  const lados = $derived<[string, string]>(
    n === 2 ? [T.brisca.tu, T.brisca.rival] : [T.brisca.nosotros, T.brisca.ellos],
  );

  /** Nombre del truc al que se sube ahora: el siguiente al pendiente o al aceptado. */
  const siguienteTruc = $derived(
    T.truc.trucs[vista.truc.pendiente > 0 ? vista.truc.pendiente : vista.truc.nivel] ?? '',
  );

  const ORDEN: readonly AccionTruc['tipo'][] = [
    'vull',
    'noVull',
    'torne',
    'falta',
    'trucar',
    'envidar',
    'meVoy',
  ];
  const botones = $derived(
    ORDEN.filter((tipo) => legales.some((a) => a.tipo === tipo)).map((tipo) => ({
      tipo,
      texto: textoDe(tipo),
    })),
  );

  function textoDe(tipo: AccionTruc['tipo']): string {
    switch (tipo) {
      case 'vull':
        return T.truc.vull;
      case 'noVull':
        return T.truc.noVull;
      case 'torne':
        return T.truc.torne;
      case 'falta':
        return T.truc.falta;
      case 'trucar':
        return siguienteTruc;
      case 'envidar':
        return T.truc.envit;
      default:
        return T.truc.meVoy;
    }
  }

  const bazasBando = $derived.by(() => {
    const cuenta = [0, 0, 0];
    for (const b of vista.bazasJugadas) cuenta[b.ganador === null ? 2 : b.ganador]!++;
    return cuenta;
  });

  const detalle = (asiento: Asiento) => {
    const mostrado = vista.envit.mostrado[asiento];
    return mostrado === null || mostrado === undefined
      ? T.brisca.bazas(vista.bazas[asiento] ?? 0)
      : T.truc.detalleEnvit(mostrado);
  };

  /** Lo que necesita la mesa de bazas: el resumen de la mano lo muestra el panel propio. */
  const vistaMesa: VistaBazas = $derived({ ...vista, resultadosManos: [] });

  // ── Avisos de lo que dicen los demás ───────────────────────────────────────

  let anunciado: string | null = $state(null);
  let antes: VistaTruc | null = null;
  $effect(() => {
    const ahora = vista;
    const previa = antes;
    antes = ahora;
    if (previa === null || previa.turno === null) return;
    const quien = previa.turno;
    const cerrada = ahora.resultadosManos.length > previa.resultadosManos.length;
    let texto: string | null = null;
    if (cerrada) {
      const r = ahora.resultadosManos.at(-1)!;
      if (r.seFue !== null) texto = T.truc.seVa(nombre(r.seFue));
      else if (previa.truc.pendiente > 0) texto = T.truc.dice(nombre(quien), T.truc.noVull);
    } else if (previa.envit.estado === 'pendiente' && ahora.envit.estado !== 'pendiente') {
      texto = T.truc.dice(nombre(quien), ahora.envit.estado === 'querido' ? T.truc.vull : T.truc.noVull);
    } else if (ahora.envit.estado === 'pendiente' && ahora.envit.nivel !== previa.envit.nivel) {
      texto = T.truc.dice(nombre(quien), T.truc.nivelesEnvit[ahora.envit.nivel]!);
    } else if (ahora.truc.pendiente > previa.truc.pendiente) {
      texto = T.truc.dice(nombre(quien), T.truc.trucs[ahora.truc.pendiente - 1]!);
    } else if (previa.truc.pendiente > 0 && ahora.truc.pendiente === 0) {
      texto = T.truc.dice(nombre(quien), T.truc.vull);
    } else if (ahora.mesa.length > 0 || ahora.bazasJugadas.length > previa.bazasJugadas.length) {
      texto = null;
    } else {
      return;
    }
    anunciado = quien === sesion.asiento ? null : texto;
  });

  const enPausa = $derived(sesion.bloqueada && sesion.pensando === null);
  const aviso = $derived.by(() => {
    if (!enPausa) return null;
    if (anunciado !== null) return anunciado;
    const ultima = vista.bazasJugadas.at(-1);
    if (vista.mesa.length === 0 && ultima && ultima.ganador === null) return T.truc.parda;
    return null;
  });

  // ── Resumen al terminar cada mano ──────────────────────────────────────────

  let resumen: number | null = $state(null);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  let espera: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      sesion.pausar();
      // Primero se ve la última baza en la mesa y después el resumen.
      espera = setTimeout(() => (resumen = total - 1), ESPERA_RESUMEN_MS);
    }
    manosVistas = total;
  });
  $effect(() => () => {
    if (espera !== null) clearTimeout(espera);
  });

  function siguienteMano() {
    resumen = null;
    sesion.reanudar();
  }
</script>

<MesaBazas
  vista={vistaMesa}
  {sesion}
  {jugable}
  jugar={(carta) => sesion.jugar({ tipo: 'jugar', carta })}
  {aviso}
  {nombre}
  {detalle}
>
  {#snippet info()}
    <b class="valor" data-testid="valor-mano">{T.truc.valeMano(vista.valorMano)}</b>
    {#if vista.truc.pendiente > 0}
      <span class="pendiente" data-testid="truc-pendiente">
        {T.truc.pendiente(T.truc.trucs[vista.truc.pendiente - 1]!)}
      </span>
    {/if}
    {#if vista.envit.estado === 'pendiente'}
      <span class="pendiente" data-testid="envit-pendiente">
        {T.truc.pendiente(T.truc.nivelesEnvit[vista.envit.nivel]!)}
      </span>
    {:else if vista.envit.estado === 'querido'}
      <span data-testid="envit-querido">
        {T.truc.envitQuerido(vista.envit.valor)}:
        {#each vista.envit.mostrado as p, a (a)}
          {#if p !== null}<span class="envit">{T.truc.puntosEnvit(nombre(a), p)}</span>{/if}
        {/each}
      </span>
    {:else if vista.envit.estado === 'noQuerido'}
      <span data-testid="envit-no-querido">{T.truc.envitNoQuerido}</span>
    {/if}
    <span data-testid="bazas-truc">
      {T.truc.bazas(bazasBando[mio]!, bazasBando[1 - mio]!, bazasBando[2]!)}
    </span>
    <span data-testid="marcador">
      {T.truc.piedras}: <b>{T.truc.marcador(...porBando(vista.piedras, sesion.asiento))}</b>
      · {T.truc.cames(...porBando(vista.cames, sesion.asiento))}
    </span>
  {/snippet}

  {#snippet acciones(cancelar: () => void)}
    {#if botones.length > 1}
      <div class="apuestas" role="group" aria-label={T.truc.envit}>
        {#each botones as b (b.tipo)}
          <button
            class:principal={b.tipo !== 'meVoy' && b.tipo !== 'noVull'}
            data-testid="truc-{b.tipo}"
            onclick={() => {
              cancelar();
              sesion.jugar({ tipo: b.tipo } as AccionTruc);
            }}>{b.texto}</button
          >
        {/each}
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.truc.finMano(resumen + 1)}</h2>
      <ResumenTruc
        resultado={vista.resultadosManos[resumen]!}
        {lados}
        yo={sesion.asiento}
        jugadores={n}
        red={sesion.red}
      />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.truc.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .valor {
    padding: 0 8px;
    border-radius: 10px;
    color: #2b2005;
    background: var(--acento);
  }

  .pendiente {
    color: var(--acento);
    font-weight: 600;
  }

  .envit + .envit::before {
    content: ' · ';
  }

  .apuestas {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .apuestas button {
    padding-inline: 10px;
  }

  .velo {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgb(0 0 0 / 0.5);
    z-index: 1500;
  }

  .dialogo {
    width: min(100%, 420px);
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
    padding: 18px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  .dialogo h2 {
    font-size: 1.2rem;
    margin-bottom: 8px;
  }

  .dialogo > button {
    margin-top: 14px;
    width: 100%;
  }
</style>
