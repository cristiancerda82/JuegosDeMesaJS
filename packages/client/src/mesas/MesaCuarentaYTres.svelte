<script lang="ts">
  import {
    cartaDeCambio,
    fuerza,
    PALOS_ESPANOLES,
    type AccionCuarentaYTres,
    type Asiento,
    type ConfigCuarentaYTres,
    type EstadoCuarentaYTres,
    type IdCarta,
    type PaloEspanol,
    type VistaCuarentaYTres,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import { nombreCarta } from '../cartas/dibujo';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenCuarentaYTres from './ResumenCuarentaYTres.svelte';

  interface Props {
    sesion: SesionMesa<
      ConfigCuarentaYTres,
      EstadoCuarentaYTres,
      AccionCuarentaYTres,
      VistaCuarentaYTres
    >;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const yo = $derived(sesion.asiento);

  const jugable = (carta: IdCarta) =>
    legales.some((a) => a.tipo === 'jugar' && a.carta === carta);
  const cambio = $derived(legales.find((a) => a.tipo === 'cambiarSiete'));
  // Cada uno contra todos: los rivales se numeran, sin compañero.
  const nombre = (asiento: Asiento) => nombreNumerado(asiento, 3, yo, sesion.red, T.brisca.rivalN);
  const palo = (p: PaloEspanol) => p.charAt(0).toUpperCase() + p.slice(1);
  const carta = (id: IdCarta) => nombreCarta(id).toLowerCase();

  const detalle = (asiento: Asiento) => {
    const marcas = [T.cuarentaYTres.tantosCortos(vista.tantos[asiento] ?? 0)];
    if (asiento === vista.repartidor) marcas.push(T.burroBazas.reparte);
    const saldo = vista.saldos[asiento] ?? 0;
    if (saldo !== 0) marcas.push(T.cuarentaYTres.saldoCorto(saldo));
    return marcas.join(' · ');
  };

  /** La mano por palos y, dentro de cada palo, de la más baja al As. */
  const manoOrdenada = $derived(
    [...(vista.miMano ?? [])].sort(
      (a, b) =>
        PALOS_ESPANOLES.indexOf(a.split('-')[0] as PaloEspanol) -
          PALOS_ESPANOLES.indexOf(b.split('-')[0] as PaloEspanol) || fuerza(a) - fuerza(b),
    ),
  );

  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    rotuloMuestra: T.cuarentaYTres.muestra,
    resultadosManos: [],
  });

  /** El cambio de la muestra se avisa hasta que se juega la carta siguiente. */
  const aviso = $derived.by(() => {
    const c = vista.cambio;
    const jugadas = vista.bazasJugadas.length * 3 + vista.mesa.length;
    if (c === null || jugadas !== c.cartasJugadas) return null;
    return T.cuarentaYTres.cambia(nombre(c.asiento), carta(c.carta), carta(vista.muestra));
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
  jugar={(c) => sesion.jugar({ tipo: 'jugar', carta: c })}
  {nombre}
  {detalle}
  {aviso}
>
  {#snippet info()}
    <span data-testid="triunfo-cuarenta-y-tres"
      >{T.cuarentaYTres.triunfo}: <b class="triunfo">{palo(vista.triunfo)}</b></span
    >
    <span class="suave" data-testid="mano-cuarenta-y-tres"
      >{T.cuarentaYTres.manoDe(vista.manoNumero, vista.config.manos)}</span
    >
    <span class="suave" data-testid="saldo-{yo}">{T.cuarentaYTres.tuSaldo(vista.saldos[yo] ?? 0)}</span>
  {/snippet}
  {#snippet acciones(cancelar)}
    {#if cambio}
      <button
        data-accion={cambio.tipo}
        data-jugada={JSON.stringify(cambio)}
        class="principal"
        data-testid="cambiar-muestra"
        onclick={() => {
          cancelar();
          sesion.jugar(cambio);
        }}
      >
        {T.cuarentaYTres.cambiar(carta(cartaDeCambio(vista.muestra)))}
      </button>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.burroBazas.finMano(resumen + 1)}</h2>
      <ResumenCuarentaYTres resultado={vista.resultadosManos[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.burroBazas.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .triunfo {
    color: var(--acento);
  }

  .suave {
    color: var(--texto-suave);
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
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
    padding: 14px;
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
