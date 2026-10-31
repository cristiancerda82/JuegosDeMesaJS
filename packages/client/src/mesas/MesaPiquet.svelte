<script lang="ts">
  import {
    paloPiquet,
    rangoPiquet,
    type AccionPiquet,
    type Asiento,
    type ConfigPiquet,
    type DeclaracionPiquet,
    type EstadoPiquet,
    type IdCarta,
    type VistaPiquet,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenPiquet from './ResumenPiquet.svelte';

  interface Props {
    sesion: SesionMesa<ConfigPiquet, EstadoPiquet, AccionPiquet, VistaPiquet>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 2;
  const PALOS = ['picas', 'corazones', 'treboles', 'diamantes'] as const;
  const TIPOS = ['punto', 'secuencia', 'conjunto'] as const;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const rival = $derived(yo === 0 ? 1 : 0);

  /** Tocar una carta: descartarla en el cambio o jugarla en las bazas. */
  const accionDe = (carta: IdCarta) =>
    legales.find((a) => (a.tipo === 'jugar' || a.tipo === 'descartar') && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, JUGADORES, yo, sesion.red);
  const detalle = (asiento: Asiento) => {
    const mayor = asiento === vista.mayor ? `${T.piquet.mayor} · ` : '';
    return `${mayor}${T.piquet.puntosMano(vista.puntosMano[asiento as 0 | 1])}`;
  };

  /** La mano por palos y, dentro de cada uno, de mayor a menor. */
  const manoOrdenada = $derived(
    [...(vista.miMano ?? [])].sort(
      (a, b) =>
        PALOS.indexOf(paloPiquet(a) as (typeof PALOS)[number]) -
          PALOS.indexOf(paloPiquet(b) as (typeof PALOS)[number]) || rangoPiquet(b) - rangoPiquet(a),
    ),
  );

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    config: { jugadores: JUGADORES },
    miMano: manoOrdenada,
    mazo: vista.enMonton,
    muestra: null,
    rotuloMuestra: null,
    bazas: [vista.bazas[0], vista.bazas[1]],
    resultadosManos: [],
  });

  // ── Cambio y declaraciones ─────────────────────────────────────────────────

  const cambiando = $derived(
    vista.fase === 'cambio' && legales.length > 0 && sesion.fin === null && !sesion.bloqueada,
  );
  const puedeRobar = $derived(cambiando && legales.some((a) => a.tipo === 'robar'));
  const descartadas = $derived(vista.misDescartes.length);

  const aviso = $derived.by(() => {
    if (sesion.fin !== null || vista.fase !== 'cambio') return null;
    if (vista.turno !== yo) return T.piquet.cambiando(nombre(vista.turno ?? rival));
    if (yo === vista.mayor) return T.piquet.cambiaMayor(descartadas);
    return T.piquet.cambiaMenor(descartadas, vista.enMonton);
  });

  const textoDeclaracion = (tipo: (typeof TIPOS)[number], d: DeclaracionPiquet) =>
    d.ganador === null
      ? T.piquet.declaracionNadie(tipo)
      : T.piquet.declaracion(tipo, nombre(d.ganador), d.largo, d.puntos);

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
  {nombre}
  {detalle}
  {aviso}
>
  {#snippet info()}
    <span class="mano" data-testid="mano-ronda">{T.piquet.manoRonda(vista.manoNumero, vista.config.manos)}</span>
    <span data-testid="marcador">{T.piquet.marcador(vista.puntos[yo as 0 | 1], vista.puntos[rival])}</span>
    {#if vista.declaraciones}
      {#each TIPOS as tipo (tipo)}
        <span data-testid="declaracion-{tipo}">{textoDeclaracion(tipo, vista.declaraciones[tipo])}</span>
      {/each}
    {/if}
    {#if vista.repique !== null}<span class="prima" data-testid="repique">{T.piquet.repique(nombre(vista.repique))}</span>{/if}
    {#if vista.pique !== null}<span class="prima" data-testid="pique">{T.piquet.pique(nombre(vista.pique))}</span>{/if}
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if puedeRobar}
      <div class="decisiones">
        <button
          class="principal"
          data-testid="robar"
          onclick={() => {
            cancelar();
            sesion.jugar({ tipo: 'robar' });
          }}>{descartadas === 0 ? T.piquet.noCambiar : T.piquet.robar(descartadas)}</button
        >
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.piquet.finMano(resumen + 1)}</h2>
      <ResumenPiquet resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.piquet.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .mano {
    font-weight: 700;
    color: var(--acento);
  }

  .prima {
    font-weight: 700;
    color: var(--acento);
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
