<script lang="ts">
  import {
    paloEuchre,
    parejaEuchre,
    rangoEuchre,
    type AccionEuchre,
    type Asiento,
    type ConfigEuchre,
    type EstadoEuchre,
    type IdCarta,
    type VistaEuchre,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenEuchre from './ResumenEuchre.svelte';

  interface Props {
    sesion: SesionMesa<ConfigEuchre, EstadoEuchre, AccionEuchre, VistaEuchre>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 4;
  const PALOS = ['picas', 'corazones', 'treboles', 'diamantes'] as const;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const mio = $derived(parejaEuchre(yo));
  const lados: [string, string] = [T.brisca.nosotros, T.brisca.ellos];
  const eligiendo = $derived(vista.fase === 'primera' || vista.fase === 'segunda');

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => (a.tipo === 'jugar' || a.tipo === 'descartar') && a.carta === carta) ??
    null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, JUGADORES, yo, sesion.red);
  const detalle = (asiento: Asiento) => {
    if (asiento === vista.fuera) return T.euchre.deja;
    const reparte = asiento === vista.repartidor ? `${T.euchre.reparte} · ` : '';
    return `${reparte}${T.euchre.bazasDe(vista.bazas[asiento] ?? 0)}`;
  };

  const bazasPareja = (p: 0 | 1) =>
    [0, 1, 2, 3].filter((a) => parejaEuchre(a) === p).reduce((s, a) => s + (vista.bazas[a] ?? 0), 0);

  /** La mano por palos (el triunfo primero, con sus jotas) y por rango. */
  const manoOrdenada = $derived.by(() => {
    const t = vista.triunfo;
    const orden = t === null ? [...PALOS] : [t, ...PALOS.filter((p) => p !== t)];
    return [...(vista.miMano ?? [])].sort(
      (a, b) =>
        orden.indexOf(paloEuchre(a, t)) - orden.indexOf(paloEuchre(b, t)) ||
        rangoEuchre(b, t) - rangoEuchre(a, t),
    );
  });

  /** La carta vuelta se ve junto a la mesa mientras se elige el triunfo. */
  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    mazo: 0,
    muestra: eligiendo ? vista.cartaVuelta : null,
    rotuloMuestra: T.euchre.cartaVuelta,
    resultadosManos: [],
  });

  // ── Elegir el triunfo ──────────────────────────────────────────────────────

  const decisiones = $derived(
    legales.filter((a) => a.tipo === 'pedir' || a.tipo === 'nombrar' || a.tipo === 'pasar'),
  );

  function etiqueta(a: AccionEuchre): string {
    if (a.tipo === 'pedir') return a.solo ? T.euchre.pedirSolo : T.euchre.pedir;
    if (a.tipo === 'nombrar') {
      const palo = T.euchre.paloCorto(a.palo);
      return a.solo ? `${palo} ${T.euchre.soloSufijo}` : palo;
    }
    return T.euchre.paso;
  }

  function idDe(a: AccionEuchre): string {
    if (a.tipo === 'pedir') return a.solo ? 'pedir-solo' : 'pedir';
    if (a.tipo === 'nombrar') return `nombrar-${a.palo}${a.solo ? '-solo' : ''}`;
    return 'paso';
  }

  const aviso = $derived.by(() => {
    const hecha = vista.ultimaAccion;
    if (hecha === null || sesion.fin !== null) return null;
    const a = hecha.accion;
    const quien = nombre(hecha.asiento);
    if (a.tipo === 'pedir') return T.euchre.pide(quien, a.solo);
    if (a.tipo === 'nombrar') return T.euchre.nombra(quien, T.euchre.paloCorto(a.palo), a.solo);
    if (a.tipo === 'pasar') return eligiendo ? T.euchre.pasa(quien) : null;
    if (a.tipo === 'descartar') return T.euchre.seDescarta(quien);
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
  jugar={(carta) => {
    const accion = accionDe(carta);
    if (accion) sesion.jugar(accion);
  }}
  {nombre}
  {detalle}
  {aviso}
>
  {#snippet info()}
    <span class="triunfo" data-testid="triunfo">
      {vista.triunfo === null ? T.euchre.sinTriunfo : T.euchre.triunfo(vista.triunfo)}
    </span>
    {#if vista.elige !== null}
      <span data-testid="elige">{T.euchre.elige(nombre(vista.elige), vista.solo)}</span>
    {/if}
    {#each [mio, 1 - mio] as p, i (p)}
      <span class="pareja" data-testid="pareja-{i}">
        {T.euchre.pareja(lados[i]!, bazasPareja(p as 0 | 1), vista.puntos[p as 0 | 1])}
      </span>
    {/each}
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if decisiones.length > 0 && sesion.fin === null && !sesion.bloqueada}
      <div class="decisiones">
        {#each decisiones as a (idDe(a))}
          <button
            class:principal={a.tipo !== 'pasar' && !('solo' in a && a.solo)}
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
      <h2 id="fin-mano">{T.euchre.finMano(resumen + 1)}</h2>
      <ResumenEuchre resultado={vista.resultadosManos[resumen]!} {lados} bando={mio} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.euchre.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .triunfo {
    font-weight: 700;
    color: var(--acento);
  }

  .pareja {
    color: var(--texto-suave);
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
