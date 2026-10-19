<script lang="ts">
  import {
    fuerza,
    PALOS_ESPANOLES,
    VALORES_BUTIFARRA,
    type AccionButifarra,
    type Asiento,
    type ConfigButifarra,
    type EstadoButifarra,
    type IdCarta,
    type PaloEspanol,
    type VistaButifarra,
  } from '@juegos/engine';
  import { FACTOR_PAUSAS } from '../ajustes';
  import { bandoDe, porBando, type SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento, type VistaBazas } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenButifarra from './ResumenButifarra.svelte';

  interface Props {
    sesion: SesionMesa<ConfigButifarra, EstadoButifarra, AccionButifarra, VistaButifarra>;
  }

  let { sesion }: Props = $props();

  /** Tiempo para ver la última baza de la mano antes de que salga el resumen. */
  const ESPERA_RESUMEN_MS = 1100 * FACTOR_PAUSAS;

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);

  const jugable = (carta: IdCarta) =>
    legales.some((a) => a.tipo === 'jugar' && a.carta === carta);
  const elecciones = $derived(
    legales.flatMap((a) => (a.tipo === 'elegir' ? [a.triunfo] : [])),
  );
  const puedeDelegar = $derived(legales.some((a) => a.tipo === 'delegar'));
  const decideContro = $derived(legales.some((a) => a.tipo === 'contro'));

  const nombre = (asiento: Asiento) => nombreAsiento(asiento, 4, sesion.asiento, sesion.red);
  const lados: [string, string] = [T.brisca.nosotros, T.brisca.ellos];
  const nombreTriunfo = (triunfo: PaloEspanol | null) =>
    triunfo === null ? T.butifarra.sinTriunfo : T.butifarra.palo(triunfo);

  /** La mano ordenada por palo y, dentro de cada palo, de la más baja a la manilla. */
  const manoOrdenada = $derived(
    [...(vista.miMano ?? [])].sort(
      (a, b) =>
        PALOS_ESPANOLES.indexOf(a.split('-')[0] as PaloEspanol) -
          PALOS_ESPANOLES.indexOf(b.split('-')[0] as PaloEspanol) ||
        fuerza(a, VALORES_BUTIFARRA) - fuerza(b, VALORES_BUTIFARRA),
    ),
  );

  /**
   * Lo que necesita la mesa de bazas. La última baza de la mano anterior se ve mientras el
   * repartidor elige, y el resumen de la mano lo muestra el panel propio.
   */
  const vistaMesa: VistaBazas = $derived({
    ...vista,
    miMano: manoOrdenada,
    ultimaBaza:
      vista.fase === 'jugar' || (vista.eleccion === null && vista.turno === vista.repartidor)
        ? vista.ultimaBaza
        : null,
    resultadosManos: [],
  });

  // ── Avisos de lo que eligen y dicen los demás ──────────────────────────────

  let anunciado: string | null = $state(null);
  let antes: VistaButifarra | null = null;
  $effect(() => {
    const ahora = vista;
    const previa = antes;
    antes = ahora;
    if (previa === null || previa.fase === 'jugar' || previa.turno === null) {
      if (ahora.mesa.length > 0 || ahora.fase !== 'jugar') anunciado = null;
      return;
    }
    if (previa.resultadosManos.length !== ahora.resultadosManos.length) return;
    const quien = previa.turno;
    if (quien === sesion.asiento) {
      anunciado = null;
      return;
    }
    const n = nombre(quien);
    if (previa.fase === 'elegir') {
      anunciado =
        ahora.eleccion === null
          ? T.butifarra.delego(n)
          : T.butifarra.eligio(n, ahora.eleccion.triunfo === null ? null : T.butifarra.palo(ahora.eleccion.triunfo).toLowerCase());
    } else if (previa.fase === 'contros') {
      anunciado =
        ahora.contros > previa.contros
          ? T.butifarra.dijo(n, T.butifarra.contros[previa.contros]!)
          : T.butifarra.paso_(n);
    }
  });

  const enPausa = $derived(sesion.bloqueada && sesion.pensando === null);
  const aviso = $derived(enPausa && vista.mesa.length === 0 ? anunciado : null);

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
>
  {#snippet info()}
    {#if vista.eleccion}
      <span data-testid="triunfo-butifarra">
        {T.butifarra.triunfo}: <b class="triunfo">{nombreTriunfo(vista.eleccion.triunfo)}</b>
        <span class="quien">({T.butifarra.elige(nombre(vista.eleccion.quien), vista.eleccion.delegada)})</span>
      </span>
      <b class="multiplicador" data-testid="multiplicador">{T.butifarra.multiplicador(vista.multiplicador)}</b>
    {:else if vista.turno !== null}
      <span data-testid="eligiendo">{T.butifarra.eligiendo(nombre(vista.turno))}</span>
    {/if}
    <span data-testid="marcador">
      {T.butifarra.puntos}: <b>{T.butifarra.marcador(...porBando(vista.totales, sesion.asiento), vista.config.objetivo)}</b>
    </span>
    <span>{T.butifarra.reparte(nombre(vista.repartidor))}</span>
  {/snippet}

  {#snippet acciones(cancelar: () => void)}
    {#if elecciones.length > 0}
      <div class="decision" role="group" aria-label={T.butifarra.eligeTitulo}>
        <span class="pregunta">{T.butifarra.eligeTitulo}</span>
        {#each elecciones as triunfo (triunfo ?? 'butifarra')}
          <button
            class="principal"
            data-testid="elegir-{triunfo ?? 'butifarra'}"
            onclick={() => {
              cancelar();
              sesion.jugar({ tipo: 'elegir', triunfo });
            }}>{nombreTriunfo(triunfo)}</button
          >
        {/each}
        {#if puedeDelegar}
          <button
            data-testid="delegar"
            onclick={() => {
              cancelar();
              sesion.jugar({ tipo: 'delegar' });
            }}>{T.butifarra.delegar}</button
          >
        {/if}
      </div>
    {:else if decideContro}
      <div class="decision" role="group" aria-label={T.butifarra.contros[vista.contros]}>
        <button
          class="principal"
          data-testid="contro"
          onclick={() => {
            cancelar();
            sesion.jugar({ tipo: 'contro' });
          }}>{T.butifarra.contros[vista.contros]}</button
        >
        <button
          data-testid="pasar"
          onclick={() => {
            cancelar();
            sesion.jugar({ tipo: 'pasar' });
          }}>{T.butifarra.paso}</button
        >
      </div>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.butifarra.finMano(resumen + 1)}</h2>
      <ResumenButifarra
        resultado={vista.resultadosManos[resumen]!}
        {lados}
        bando={bandoDe(sesion.asiento)}
        yo={sesion.asiento}
        red={sesion.red}
      />
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

  .quien {
    color: var(--texto-suave);
  }

  .multiplicador {
    padding: 0 8px;
    border-radius: 10px;
    color: #2b2005;
    background: var(--acento);
  }

  .decision {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .decision button {
    padding-inline: 10px;
  }

  .pregunta {
    flex-basis: 100%;
    text-align: center;
    font-weight: 600;
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
