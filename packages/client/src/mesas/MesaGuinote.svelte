<script lang="ts">
  import {
    cartaDeCambio,
    VALORES_GUINOTE,
    type AccionGuinote,
    type Asiento,
    type CanteGuinote,
    type ConfigGuinote,
    type EstadoGuinote,
    type IdCarta,
    type VistaGuinote,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import type { Sesion } from '../sesion/sesion.svelte';
  import { T } from '../textos';
  import { nombreAsiento } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';
  import ResumenGuinote from './ResumenGuinote.svelte';

  interface Props {
    sesion: Sesion<ConfigGuinote, EstadoGuinote, AccionGuinote, VistaGuinote>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);

  const jugable = (carta: IdCarta) =>
    legales.some((a) => a.tipo === 'jugar' && a.carta === carta);

  const cantes = $derived(
    legales.filter((a): a is Extract<AccionGuinote, { tipo: 'cantar' }> => a.tipo === 'cantar'),
  );
  const cambio = $derived(legales.find((a) => a.tipo === 'cambiarSiete'));

  const puntosCante = (palo: string) => (palo === vista.triunfo ? 40 : 20);
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, n);
  const lados = $derived<[string, string]>(
    n === 2 ? [T.brisca.tu, T.brisca.rival] : [T.brisca.nosotros, T.brisca.ellos],
  );

  // ── Aviso de los cantes ────────────────────────────────────────────────────

  let anunciado: CanteGuinote | null = $state(null);
  let cantesVistos = 0;
  $effect(() => {
    const total = vista.cantes.length;
    if (total > cantesVistos) anunciado = vista.cantes.at(-1)!;
    else if (total < cantesVistos) anunciado = null;
    cantesVistos = total;
  });

  const enPausa = $derived(sesion.bloqueada && sesion.pensando === null);
  const aviso = $derived.by(() => {
    const cante: CanteGuinote | null = anunciado;
    if (!enPausa || cante === null || vista.mesa.length > 0) return null;
    return T.guinote.canta(nombre(cante.asiento), cante.puntos, cante.palo);
  });

  // ── Resumen al terminar cada mano ──────────────────────────────────────────

  let resumen: number | null = $state(null);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      resumen = total - 1;
      sesion.pausar();
    }
    manosVistas = total;
  });

  function siguienteMano() {
    resumen = null;
    sesion.reanudar();
  }
</script>

<MesaBazas
  {vista}
  {sesion}
  {jugable}
  jugar={(carta) => sesion.jugar({ tipo: 'jugar', carta })}
  {aviso}
>
  {#snippet info()}
    <span>{T.brisca.triunfo}: <b class="triunfo">{vista.triunfo}</b></span>
    <span data-testid="marcador">
      {T.guinote.puntos}: <b>{T.guinote.marcador(vista.totales[0], vista.totales[1], vista.config.meta)}</b>
    </span>
    {#if vista.arrastre}
      <span class="arrastre" data-testid="arrastre" title={T.guinote.arrastreDesc}>{T.guinote.arrastre}</span>
    {/if}
    {#if vista.cantes.length > 0}
      <span class="cantes" data-testid="cantes">
        {T.tute.cantes}:
        {#each vista.cantes as c, i (c.palo)}
          {i > 0 ? ' · ' : ''}{T.tute.cante(nombre(c.asiento), c.puntos, c.palo)}
        {/each}
      </span>
    {/if}
  {/snippet}

  {#snippet detalleAviso()}
    {#if anunciado}
      <span class="pareja" aria-hidden="true">
        <span class="mini"><Carta id={`${anunciado.palo}-12`} /></span>
        <span class="mini"><Carta id={`${anunciado.palo}-10`} /></span>
      </span>
    {/if}
  {/snippet}

  {#snippet acciones(cancelar: () => void)}
    {#each cantes as c (c.palo)}
      <button
        class="principal"
        data-testid="cantar-{c.palo}"
        onclick={() => {
          cancelar();
          sesion.jugar(c);
        }}>{T.tute.cantar(puntosCante(c.palo), c.palo)}</button
      >
    {/each}
    {#if cambio && vista.muestra}
      <button
        class="principal"
        data-testid="cambiar-muestra"
        onclick={() => {
          cancelar();
          sesion.jugar(cambio);
        }}
      >
        {T.tute.cambiarSiete(nombreCarta(cartaDeCambio(vista.muestra, VALORES_GUINOTE)).toLowerCase())}
      </button>
    {/if}
  {/snippet}
</MesaBazas>

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.guinote.finMano(resumen + 1)}</h2>
      <ResumenGuinote resultado={vista.resultadosManos[resumen]!} {lados} />
      <p class="vueltas" data-testid="de-vueltas">{T.guinote.deVueltas(vista.config.meta)}</p>
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.guinote.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .triunfo {
    color: var(--acento);
    text-transform: capitalize;
  }

  .cantes {
    color: var(--texto);
  }

  .arrastre {
    padding: 0 8px;
    border-radius: 10px;
    font-weight: 700;
    color: #2b2005;
    background: var(--acento);
  }

  .pareja {
    display: inline-flex;
    gap: 2px;
  }

  .mini {
    display: block;
    width: 26px;
    aspect-ratio: 100 / 140;
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

  .vueltas {
    margin: 8px 0 0;
    color: var(--texto-suave);
  }

  .dialogo > button {
    margin-top: 14px;
    width: 100%;
  }
</style>
