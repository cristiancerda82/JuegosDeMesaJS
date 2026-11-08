<script lang="ts">
  import type {
    AccionTruco,
    Asiento,
    ConfigTruco,
    EstadoTruco,
    IdCarta,
    VistaTruco,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import { bandoDe, porBando, type SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenTruco from './ResumenTruco.svelte';

  interface Props {
    sesion: SesionMesa<ConfigTruco, EstadoTruco, AccionTruco, VistaTruco>;
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

  /** Nombre del truco que se canta ahora: el siguiente al pendiente o al aceptado. */
  const siguienteTruco = $derived(
    T.truco.trucos[vista.truco.pendiente > 0 ? vista.truco.pendiente : vista.truco.nivel] ?? '',
  );

  const ORDEN: readonly AccionTruco['tipo'][] = [
    'quiero',
    'noQuiero',
    'envido',
    'realEnvido',
    'faltaEnvido',
    'truco',
    'meVoy',
  ];
  const botones = $derived(
    ORDEN.filter((tipo) => legales.some((a) => a.tipo === tipo)).map((tipo) => ({
      tipo,
      texto: textoDe(tipo),
    })),
  );

  function textoDe(tipo: AccionTruco['tipo']): string {
    switch (tipo) {
      case 'quiero':
        return T.truco.quiero;
      case 'noQuiero':
        return T.truco.noQuiero;
      case 'envido':
        return T.truco.cantos.envido;
      case 'realEnvido':
        return T.truco.cantos.real;
      case 'faltaEnvido':
        return T.truco.cantos.falta;
      case 'truco':
        return siguienteTruco;
      default:
        return T.truco.meVoy;
    }
  }

  const bazasBando = $derived.by(() => {
    const cuenta = [0, 0, 0];
    for (const b of vista.bazasJugadas) cuenta[b.ganador === null ? 2 : b.ganador]!++;
    return cuenta;
  });

  const detalle = (asiento: Asiento) => {
    const mostrado = vista.envido.mostrado[asiento];
    return mostrado === null || mostrado === undefined
      ? T.brisca.bazas(vista.bazas[asiento] ?? 0)
      : T.truco.detalleEnvido(mostrado);
  };

  /** Lo que necesita la mesa de bazas: el resumen de la mano lo muestra el panel propio. */
  const vistaMesa: VistaBazas = $derived({ ...vista, resultadosManos: [] });

  // ── Avisos de lo que cantan los demás ──────────────────────────────────────

  let anunciado: string | null = $state(null);
  let antes: VistaTruco | null = null;
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
      if (r.seFue !== null) texto = T.truco.seVa(nombre(r.seFue));
      else if (previa.truco.pendiente > 0) texto = T.truco.dice(nombre(quien), T.truco.noQuiero);
    } else if (previa.envido.estado === 'pendiente' && ahora.envido.estado !== 'pendiente') {
      texto = T.truco.dice(
        nombre(quien),
        ahora.envido.estado === 'querido' ? T.truco.quiero : T.truco.noQuiero,
      );
    } else if (ahora.envido.cantos.length > previa.envido.cantos.length) {
      texto = T.truco.dice(nombre(quien), T.truco.cantos[ahora.envido.cantos.at(-1)!]);
    } else if (ahora.truco.pendiente > previa.truco.pendiente) {
      texto = T.truco.dice(nombre(quien), T.truco.trucos[ahora.truco.pendiente - 1]!);
    } else if (previa.truco.pendiente > 0 && ahora.truco.pendiente === 0) {
      texto = T.truco.dice(nombre(quien), T.truco.quiero);
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
    if (vista.mesa.length === 0 && ultima && ultima.ganador === null) return T.truco.parda;
    return null;
  });

  /** Lo cantado del envido, para mostrarlo: «Envido, Real envido». */
  const cantado = $derived(vista.envido.cantos.map((c) => T.truco.cantos[c]).join(', '));

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
    <b class="valor" data-testid="valor-mano">{T.truco.valeMano(vista.valorMano)}</b>
    {#if vista.truco.pendiente > 0}
      <span class="pendiente" data-testid="truco-pendiente">
        {T.truco.pendiente(T.truco.trucos[vista.truco.pendiente - 1]!)}
      </span>
    {/if}
    {#if vista.envido.estado === 'pendiente'}
      <span class="pendiente" data-testid="envido-pendiente">{T.truco.pendiente(cantado)}</span>
    {:else if vista.envido.estado === 'querido'}
      <span data-testid="envido-querido">
        {T.truco.envidoQuerido(vista.envido.valor)}:
        {#each vista.envido.mostrado as p, a (a)}
          {#if p !== null}<span class="envido">{T.truco.puntosEnvido(nombre(a), p)}</span>{/if}
        {/each}
      </span>
    {:else if vista.envido.estado === 'noQuerido'}
      <span data-testid="envido-no-querido">{T.truco.envidoNoQuerido}</span>
    {/if}
    <span data-testid="bazas-truco">
      {T.truc.bazas(bazasBando[mio]!, bazasBando[1 - mio]!, bazasBando[2]!)}
    </span>
    <span data-testid="marcador">
      {T.truco.marcador(...porBando(vista.puntos, sesion.asiento))}
    </span>
  {/snippet}

  {#snippet acciones(cancelar: () => void)}
    {#if botones.length > 1}
      <div class="apuestas" role="group" aria-label={T.truco.cantos.envido}>
        {#each botones as b (b.tipo)}
          <button data-accion={b.tipo}
            class:principal={b.tipo !== 'meVoy' && b.tipo !== 'noQuiero'}
            data-testid="truco-{b.tipo}"
            onclick={() => {
              cancelar();
              sesion.jugar({ tipo: b.tipo } as AccionTruco);
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
      <h2 id="fin-mano">{T.truco.finMano(resumen + 1)}</h2>
      <ResumenTruco
        resultado={vista.resultadosManos[resumen]!}
        {lados}
        yo={sesion.asiento}
        jugadores={n}
        red={sesion.red}
      />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.truco.siguienteMano}
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

  .envido + .envido::before {
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
