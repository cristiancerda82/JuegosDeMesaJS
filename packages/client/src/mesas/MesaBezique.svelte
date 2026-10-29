<script lang="ts">
  import {
    paloBezique,
    puntosCanteBezique,
    rangoBezique,
    type AccionBezique,
    type Asiento,
    type ConfigBezique,
    type EstadoBezique,
    type IdCarta,
    type VistaBezique,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenBezique from './ResumenBezique.svelte';

  interface Props {
    sesion: SesionMesa<ConfigBezique, EstadoBezique, AccionBezique, VistaBezique>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 2;
  const PALOS = ['picas', 'corazones', 'treboles', 'diamantes'] as const;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const rival = $derived(yo === 0 ? 1 : 0);

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => a.tipo === 'jugar' && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, JUGADORES, yo, sesion.red);
  const detalle = (asiento: Asiento) => {
    const reparte = asiento === vista.repartidor ? `${T.bezique.reparte} · ` : '';
    return `${reparte}${T.bezique.puntosMano(vista.puntosMano[asiento as 0 | 1])}`;
  };

  /** La mano por palos (el triunfo primero) y por orden dentro del palo. */
  const manoOrdenada = $derived.by(() => {
    const t = vista.triunfo;
    const orden = [t, ...PALOS.filter((p) => p !== t)];
    return [...(vista.miMano ?? [])].sort(
      (a, b) =>
        orden.indexOf(paloBezique(a)) - orden.indexOf(paloBezique(b)) ||
        rangoBezique(b) - rangoBezique(a),
    );
  });

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    config: { jugadores: JUGADORES },
    miMano: manoOrdenada,
    mazo: vista.enMazo,
    muestra: vista.vuelta,
    rotuloMuestra: null,
    bazas: [0, 0],
    resultadosManos: [],
  });

  // ── Declarar ───────────────────────────────────────────────────────────────

  const declarando = $derived(
    vista.fase === 'declarar' && legales.length > 0 && sesion.fin === null && !sesion.bloqueada,
  );

  function etiqueta(a: AccionBezique): string {
    if (a.tipo === 'cantar') {
      const palo = a.cante === 'matrimonio' ? paloBezique(a.cartas[0]!) : null;
      return T.bezique.cante(a.cante, palo, puntosCanteBezique(a.cante, a.cartas, vista.triunfo));
    }
    if (a.tipo === 'cambiar') return T.bezique.cambiar;
    return T.bezique.noCantar;
  }

  function idDe(a: AccionBezique): string {
    if (a.tipo === 'cantar') {
      return a.cante === 'matrimonio' ? `cantar-matrimonio-${paloBezique(a.cartas[0]!)}` : `cantar-${a.cante}`;
    }
    return a.tipo;
  }

  const aviso = $derived.by(() => {
    if (sesion.fin !== null) return null;
    const ultimo = vista.cantes.at(-1);
    if (!ultimo || ultimo.asiento === yo || vista.mesa.length > 0) return null;
    const palo = ultimo.cante === 'matrimonio' ? paloBezique(ultimo.cartas[0]!) : null;
    return T.bezique.canta(nombre(ultimo.asiento), ultimo.cante, palo, ultimo.puntos);
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
  jugar={(carta) => {
    const accion = accionDe(carta);
    if (accion) sesion.jugar(accion);
  }}
  marcadas={vista.cantadas[yo] ?? []}
  {nombre}
  {detalle}
  {aviso}
>
  {#snippet info()}
    <span class="triunfo" data-testid="triunfo">{T.bezique.triunfo(vista.triunfo)}</span>
    <span data-testid="marcador">{T.bezique.marcador(vista.puntos[yo as 0 | 1], vista.puntos[rival])}</span>
    {#if vista.fase === 'final'}<span data-testid="ultimas">{T.bezique.ultimas}</span>{/if}
    {#if (vista.cantadas[rival] ?? []).length > 0}
      <span class="cantadas" data-testid="cantadas-rival">
        {T.bezique.cantadasDe(nombre(rival))}
        {#each vista.cantadas[rival]! as id, i (`${id}-${i}`)}
          <span class="mini" data-carta={id}><Carta {id} /></span>
        {/each}
      </span>
    {/if}
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if declarando}
      <div class="decisiones">
        {#each legales as a (idDe(a))}
          <button
            class:principal={a.tipo !== 'pasar'}
            data-testid={idDe(a)}
            onclick={() => {
              cancelar();
              sesion.jugar(a);
            }}>{etiqueta(a)}</button
          >
        {/each}
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.bezique.finMano(resumen + 1)}</h2>
      <ResumenBezique resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.bezique.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .triunfo {
    font-weight: 700;
    color: var(--acento);
  }

  .cantadas {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .mini {
    display: inline-block;
    width: 26px;
    aspect-ratio: 100 / 140;
  }

  .decisiones {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .decisiones button {
    min-height: 40px;
    padding: 4px 12px;
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
    width: min(100%, 460px);
    max-height: calc(100dvh - 92px);
    overflow-y: auto;
    padding: 14px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  .dialogo h2 {
    font-size: 1.1rem;
    margin-bottom: 4px;
  }

  .dialogo > button {
    margin-top: 10px;
    width: 100%;
  }
</style>
