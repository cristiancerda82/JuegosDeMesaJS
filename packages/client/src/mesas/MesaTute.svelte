<script lang="ts">
  import {
    cartaDeCambio,
    type AccionTute,
    type Asiento,
    type Cante,
    type ConfigTute,
    type EstadoTute,
    type IdCarta,
    type VistaTute,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import { bandoDe, porBando, type SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreAsiento } from './bazas/asientos';
  import MesaBazas from './bazas/MesaBazas.svelte';

  interface Props {
    sesion: SesionMesa<ConfigTute, EstadoTute, AccionTute, VistaTute>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);

  const jugable = (carta: IdCarta) =>
    legales.some((a) => a.tipo === 'jugar' && a.carta === carta);

  const cantes = $derived(
    legales.filter((a): a is Extract<AccionTute, { tipo: 'cantar' }> => a.tipo === 'cantar'),
  );
  const tute = $derived(legales.find((a) => a.tipo === 'cantarTute'));
  const cambio = $derived(legales.find((a) => a.tipo === 'cambiarSiete'));

  const puntosCante = (palo: string) => (palo === vista.triunfo ? 40 : 20);
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, n, sesion.asiento, sesion.red);
  const nombreBando = (bando: 0 | 1) =>
    n === 2
      ? bando === bandoDe(sesion.asiento)
        ? T.brisca.tu
        : T.brisca.rival
      : bando === bandoDe(sesion.asiento)
        ? T.brisca.nosotros
        : T.brisca.ellos;

  /** Con 4 jugadores, la carta de triunfo del repartidor se ve en su mano. */
  const cartaVisible = (asiento: Asiento) =>
    asiento === vista.repartidor ? vista.cartaTriunfo : null;

  // ── Avisos de cantes y del tute ────────────────────────────────────────────

  let anunciado: Cante | null = $state(null);
  let cantesVistos = 0;
  $effect(() => {
    const total = vista.cantes.length;
    if (total > cantesVistos) anunciado = vista.cantes.at(-1)!;
    else if (total < cantesVistos) anunciado = null;
    cantesVistos = total;
  });

  /** Se anuncia durante la pausa que sigue al cante o al cierre de la mano por tute. */
  const enPausa = $derived(sesion.bloqueada && sesion.pensando === null);
  const tuteCerrado = $derived.by(() => {
    const ultima = vista.resultadosManos.at(-1);
    const manoNueva = vista.bazas.every((b) => b === 0) && vista.mesa.length === 0;
    return ultima?.tute && (manoNueva || sesion.fin !== null) ? ultima : null;
  });

  const aviso = $derived.by(() => {
    if (!enPausa) return null;
    if (tuteCerrado && tuteCerrado.ganador !== null) {
      return T.tute.tuteGana(nombreBando(tuteCerrado.ganador));
    }
    if (anunciado && vista.mesa.length === 0) {
      return T.tute.canta(nombre(anunciado.asiento), anunciado.puntos, anunciado.palo);
    }
    return null;
  });
</script>

<MesaBazas
  {vista}
  {sesion}
  {jugable}
  jugar={(carta) => sesion.jugar({ tipo: 'jugar', carta })}
  {cartaVisible}
  {aviso}
>
  {#snippet info()}
    <span>{T.brisca.triunfo}: <b class="triunfo">{vista.triunfo}</b></span>
    {#if vista.config.manos > 1}
      <span>{T.brisca.manosGanadas(...porBando(vista.manosGanadas, sesion.asiento))}</span>
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
    {#if anunciado && !tuteCerrado}
      <span class="pareja" aria-hidden="true">
        <span class="mini"><Carta id={`${anunciado.palo}-12`} /></span>
        <span class="mini"><Carta id={`${anunciado.palo}-11`} /></span>
      </span>
    {/if}
  {/snippet}

  {#snippet acciones(cancelar: () => void)}
    {#if tute}
      <button
        class="principal"
        data-testid="cantar-tute"
        onclick={() => {
          cancelar();
          sesion.jugar(tute);
        }}>{T.tute.cantarTute}</button
      >
    {/if}
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
        {T.tute.cambiarSiete(nombreCarta(cartaDeCambio(vista.muestra)).toLowerCase())}
      </button>
    {/if}
  {/snippet}
</MesaBazas>

<style>
  .triunfo {
    color: var(--acento);
    text-transform: capitalize;
  }

  .cantes {
    color: var(--texto);
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
</style>
