<script lang="ts">
  import {
    paloKlaverjas,
    parejaKlaverjas,
    rangoKlaverjas,
    type AccionKlaverjas,
    type Asiento,
    type ConfigKlaverjas,
    type EstadoKlaverjas,
    type IdCarta,
    type VistaKlaverjas,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenKlaverjas from './ResumenKlaverjas.svelte';

  interface Props {
    sesion: SesionMesa<ConfigKlaverjas, EstadoKlaverjas, AccionKlaverjas, VistaKlaverjas>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;
  const JUGADORES = 4;
  const PALOS = ['picas', 'corazones', 'treboles', 'diamantes'] as const;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);
  const mio = $derived(parejaKlaverjas(yo));
  const lados: [string, string] = [T.brisca.nosotros, T.brisca.ellos];
  const lado = (pareja: number) => lados[pareja === mio ? 0 : 1]!;

  const accionDe = (carta: IdCarta) =>
    legales.find((a) => a.tipo === 'carta' && a.carta === carta) ?? null;
  const jugable = (carta: IdCarta) => accionDe(carta) !== null;
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, JUGADORES, yo, sesion.red);
  const detalle = (asiento: Asiento) => {
    const marcas = [];
    if (asiento === vista.repartidor) marcas.push(T.klaverjas.reparte);
    if (vista.fase === 'propuesta' && vista.pasados.includes(asiento)) marcas.push(T.klaverjas.pasa);
    return marcas.join(' · ');
  };

  /** La mano por palos (el triunfo, o el propuesto, primero) y por orden dentro del palo. */
  const manoOrdenada = $derived.by(() => {
    const t = vista.triunfo ?? vista.propuesto;
    const orden = [t, ...PALOS.filter((p) => p !== t)];
    return [...(vista.miMano ?? [])].sort(
      (a, b) =>
        orden.indexOf(paloKlaverjas(a)) - orden.indexOf(paloKlaverjas(b)) ||
        rangoKlaverjas(b, t) - rangoKlaverjas(a, t),
    );
  });

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    mazo: 0,
    muestra: null,
    bazas: [0, 1, 2, 3].map((a) => vista.bazasGanadas[parejaKlaverjas(a)]),
    resultadosManos: [],
  });

  // ── Triunfo ────────────────────────────────────────────────────────────────

  const decisiones = $derived(legales.filter((a) => a.tipo !== 'carta'));
  const idDe = (a: AccionKlaverjas) => (a.tipo === 'elegir' ? `palo-${a.palo}` : a.tipo);
  const etiqueta = (a: AccionKlaverjas) =>
    a.tipo === 'elegir'
      ? T.klaverjas.palo(a.palo)
      : a.tipo === 'jugar'
        ? T.klaverjas.jugar(vista.propuesto)
        : T.klaverjas.pasar;

  const aviso = $derived.by(() => {
    if (sesion.fin !== null || vista.fase === 'bazas') return null;
    if (vista.turno === yo) {
      return vista.fase === 'eleccion' ? T.klaverjas.eligeTu : T.klaverjas.dices;
    }
    const quien = nombre(vista.turno ?? 0);
    return vista.fase === 'eleccion' ? T.klaverjas.eligiendo(quien) : T.klaverjas.diciendo(quien);
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
    <span class="ronda" data-testid="mano-ronda">
      {T.klaverjas.manoRonda(Math.min(vista.resultadosManos.length + 1, vista.config.manos), vista.config.manos)}
    </span>
    {#if vista.triunfo !== null && vista.juega !== null}
      <span class="triunfo" data-testid="triunfo-klaverjas">
        {T.klaverjas.triunfo(vista.triunfo, lado(vista.juega))}
      </span>
    {:else}
      <span class="triunfo" data-testid="propuesto">{T.klaverjas.propuesto(vista.propuesto)}</span>
    {/if}
    {#each [mio, 1 - mio] as p, i (p)}
      <span class="puntos" data-testid="puntos-{i}">
        {T.klaverjas.puntos(
          lados[i]!,
          vista.cartasMano[p as 0 | 1],
          vista.roemMano[p as 0 | 1],
          vista.puntos[p as 0 | 1],
        )}
      </span>
    {/each}
    {#if vista.ultimaBaza && vista.ultimaBaza.roem > 0 && vista.fase === 'bazas'}
      <span class="roem" data-testid="roem">
        {T.klaverjas.roem(nombre(vista.ultimaBaza.ganador), vista.ultimaBaza.roem)}
      </span>
    {/if}
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if decisiones.length > 0 && sesion.fin === null && !sesion.bloqueada}
      <div class="decisiones">
        {#each decisiones as a (idDe(a))}
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
      <h2 id="fin-mano">{T.klaverjas.finMano(resumen + 1)}</h2>
      <ResumenKlaverjas resultado={vista.resultadosManos[resumen]!} {lados} bando={mio} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.klaverjas.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .triunfo {
    font-weight: 700;
    color: var(--acento);
  }

  .ronda,
  .puntos {
    color: var(--texto-suave);
  }

  .roem {
    font-weight: 600;
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
