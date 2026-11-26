<script lang="ts">
  import {
    fuerza,
    PALOS_ESPANOLES,
    VALORES_MANILLA,
    type AccionManilla,
    type Asiento,
    type ConfigManilla,
    type EstadoManilla,
    type IdCarta,
    type PaloEspanol,
    type VistaManilla,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import { nombreCarta } from '../cartas/dibujo';
  import { bandoDe, porBando, type SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenManilla from './ResumenManilla.svelte';

  interface Props {
    sesion: SesionMesa<ConfigManilla, EstadoManilla, AccionManilla, VistaManilla>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);

  const jugable = (carta: IdCarta) => legales.some((a) => a.carta === carta);
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, 4, sesion.asiento, sesion.red);
  const lados: [string, string] = [T.brisca.nosotros, T.brisca.ellos];
  const palo = (p: PaloEspanol) => p.charAt(0).toUpperCase() + p.slice(1);

  /** La mano ordenada por palo y, dentro de cada palo, de la más baja a la manilla. */
  const manoOrdenada = $derived(
    [...(vista.miMano ?? [])].sort(
      (a, b) =>
        PALOS_ESPANOLES.indexOf(a.split('-')[0] as PaloEspanol) -
          PALOS_ESPANOLES.indexOf(b.split('-')[0] as PaloEspanol) ||
        fuerza(a, VALORES_MANILLA) - fuerza(b, VALORES_MANILLA),
    ),
  );

  const vistaMesa: VistaBazas = $derived({ ...vista, miMano: manoOrdenada, resultadosManos: [] });

  /** El pinte se ve en la mano de quien reparte hasta que lo juega. */
  const cartaVisible = (asiento: Asiento) =>
    asiento === vista.repartidor && vista.pinteEnMano ? vista.pinte : null;

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
  {cartaVisible}
  {nombre}
>
  {#snippet info()}
    <span data-testid="triunfo-manilla">
      {T.manilla.triunfo}: <b class="triunfo">{palo(vista.triunfo)}</b>
      <span class="pinte">({T.manilla.pinte(nombreCarta(vista.pinte))})</span>
    </span>
    <span data-testid="puntos-mano">{T.manilla.mano(...porBando(vista.puntos, sesion.asiento))}</span>
    <span data-testid="marcador">
      {T.butifarra.puntos}: <b>{T.butifarra.marcador(...porBando(vista.totales, sesion.asiento), vista.config.objetivo)}</b>
    </span>
    <span>{T.butifarra.reparte(nombre(vista.repartidor))}</span>
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.butifarra.finMano(resumen + 1)}</h2>
      <ResumenManilla resultado={vista.resultadosManos[resumen]!} {lados} bando={bandoDe(sesion.asiento)} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.butifarra.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .triunfo {
    color: var(--acento);
  }

  .pinte {
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
