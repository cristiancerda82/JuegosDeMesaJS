<script lang="ts">
  import MesaBrisca from '../mesas/MesaBrisca.svelte';
  import MesaBurro from '../mesas/MesaBurro.svelte';
  import MesaPinacle from '../mesas/MesaPinacle.svelte';
  import MesaButifarra from '../mesas/MesaButifarra.svelte';
  import MesaTruc from '../mesas/MesaTruc.svelte';
  import MesaJulepe from '../mesas/MesaJulepe.svelte';
  import MesaTuteSubastado from '../mesas/MesaTuteSubastado.svelte';
  import MesaCuatrola from '../mesas/MesaCuatrola.svelte';
  import MesaMentiroso from '../mesas/MesaMentiroso.svelte';
  import MesaOchoLoco from '../mesas/MesaOchoLoco.svelte';
  import MesaPicas from '../mesas/MesaPicas.svelte';
  import MesaBlackjack from '../mesas/MesaBlackjack.svelte';
  import MesaGinRummy from '../mesas/MesaGinRummy.svelte';
  import MesaRummy500 from '../mesas/MesaRummy500.svelte';
  import MesaHoldem from '../mesas/MesaHoldem.svelte';
  import MesaCulo from '../mesas/MesaCulo.svelte';
  import MesaCanasta from '../mesas/MesaCanasta.svelte';
  import MesaWhist from '../mesas/MesaWhist.svelte';
  import MesaSevens from '../mesas/MesaSevens.svelte';
  import MesaCasino from '../mesas/MesaCasino.svelte';
  import MesaDurak from '../mesas/MesaDurak.svelte';
  import MesaEuchre from '../mesas/MesaEuchre.svelte';
  import MesaBigTwo from '../mesas/MesaBigTwo.svelte';
  import MesaCribbage from '../mesas/MesaCribbage.svelte';
  import MesaBelote from '../mesas/MesaBelote.svelte';
  import MesaSchnapsen from '../mesas/MesaSchnapsen.svelte';
  import MesaSkat from '../mesas/MesaSkat.svelte';
  import MesaBridge from '../mesas/MesaBridge.svelte';
  import MesaPesca from '../mesas/MesaPesca.svelte';
  import MesaKingsCorner from '../mesas/MesaKingsCorner.svelte';
  import MesaBezique from '../mesas/MesaBezique.svelte';
  import MesaDoppelkopf from '../mesas/MesaDoppelkopf.svelte';
  import MesaTarot from '../mesas/MesaTarot.svelte';
  import MesaSueca from '../mesas/MesaSueca.svelte';
  import MesaPiquet from '../mesas/MesaPiquet.svelte';
  import MesaJass from '../mesas/MesaJass.svelte';
  import MesaKlaverjas from '../mesas/MesaKlaverjas.svelte';
  import MesaBarbu from '../mesas/MesaBarbu.svelte';
  import MesaFiveHundred from '../mesas/MesaFiveHundred.svelte';
  import MesaScopa from '../mesas/MesaScopa.svelte';
  import MesaCuarenta from '../mesas/MesaCuarenta.svelte';
  import MesaPishti from '../mesas/MesaPishti.svelte';
  import MesaEcarte from '../mesas/MesaEcarte.svelte';
  import MesaTysiacha from '../mesas/MesaTysiacha.svelte';
  import MesaSheepshead from '../mesas/MesaSheepshead.svelte';
  import MesaRentz from '../mesas/MesaRentz.svelte';
  import MesaBourre from '../mesas/MesaBourre.svelte';
  import MesaTresillo from '../mesas/MesaTresillo.svelte';
  import MesaConquian from '../mesas/MesaConquian.svelte';
  import MesaTreintaYUno from '../mesas/MesaTreintaYUno.svelte';
  import MesaTwentyNine from '../mesas/MesaTwentyNine.svelte';
  import MesaBriscolaChiamata from '../mesas/MesaBriscolaChiamata.svelte';
  import MesaHandAndFoot from '../mesas/MesaHandAndFoot.svelte';
  import MesaTressette from '../mesas/MesaTressette.svelte';
  import MesaSchafkopf from '../mesas/MesaSchafkopf.svelte';
  import MesaTruco from '../mesas/MesaTruco.svelte';
  import MesaPreference from '../mesas/MesaPreference.svelte';
  import MesaOhHell from '../mesas/MesaOhHell.svelte';
  import MesaSpiteMalice from '../mesas/MesaSpiteMalice.svelte';
  import MesaRemigio from '../mesas/MesaRemigio.svelte';
  import MesaChinchon from '../mesas/MesaChinchon.svelte';
  import MesaCinquillo from '../mesas/MesaCinquillo.svelte';
  import MesaCorazones from '../mesas/MesaCorazones.svelte';
  import MesaEscoba from '../mesas/MesaEscoba.svelte';
  import MesaFreeCell from '../mesas/MesaFreeCell.svelte';
  import MesaGuinote from '../mesas/MesaGuinote.svelte';
  import MesaKlondike from '../mesas/MesaKlondike.svelte';
  import MesaMus from '../mesas/MesaMus.svelte';
  import MesaPocha from '../mesas/MesaPocha.svelte';
  import MesaSieteYMedia from '../mesas/MesaSieteYMedia.svelte';
  import MesaSpider from '../mesas/MesaSpider.svelte';
  import MesaPiramide from '../mesas/MesaPiramide.svelte';
  import MesaGolf from '../mesas/MesaGolf.svelte';
  import MesaTriPeaks from '../mesas/MesaTriPeaks.svelte';
  import MesaYukon from '../mesas/MesaYukon.svelte';
  import MesaCanfield from '../mesas/MesaCanfield.svelte';
  import MesaCuarentaLadrones from '../mesas/MesaCuarentaLadrones.svelte';
  import MesaScorpion from '../mesas/MesaScorpion.svelte';
  import MesaBelleLucie from '../mesas/MesaBelleLucie.svelte';
  import MesaTute from '../mesas/MesaTute.svelte';
  import type { Partida } from '../sesion/partida';
  import { T } from '../textos';
  import ComoSeJuega from './ComoSeJuega.svelte';
  import Fin from './Fin.svelte';
  import FranjaRed from './FranjaRed.svelte';
  import { SesionRed } from '../sesion/sesion-red.svelte';
  import { ritmo } from '../ritmo/ritmo.svelte';
  import Asistente from '../asistente/Asistente.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';

  interface Props {
    partida: Partida;
    menu: () => void;
    revancha: () => void;
  }

  let { partida, menu, revancha }: Props = $props();

  let verAyuda = $state(false);
  let raiz: HTMLElement | undefined = $state();
  /** Altura de los avisos del modo asistido: las mesas la descuentan de su altura mínima. */
  let altoAsistente = $state(0);
  const sesionMesa = $derived(
    partida.sesion as unknown as SesionMesa<unknown, unknown, unknown, unknown>,
  );

  // Mientras se consulta la guía, la IA espera: la partida sigue en el mismo punto al cerrarla.
  $effect(() => {
    if (!verAyuda) return;
    const sesion = partida.sesion;
    sesion.pausar();
    return () => sesion.reanudar();
  });
</script>

<div class="partida" bind:this={raiz} style:--alto-asistente="{altoAsistente}px">
  <header>
    <button onclick={menu} data-testid="volver-menu">← {T.partida.menu}</button>
    <h1>{partida.sesion.def.nombre}</h1>
    <Asistente juego={partida.id} sesion={sesionMesa} {raiz} parte="interruptor" />
    <button
      class="ayuda"
      onclick={() => (verAyuda = true)}
      aria-label={T.ayuda.botonCorto}
      title={T.ayuda.botonCorto}
      data-testid="ver-ayuda">?</button
    >
  </header>

  {#if partida.sesion.red}
    <FranjaRed
      red={partida.sesion.red}
      asiento={partida.sesion.asiento}
      reconectando={partida.sesion instanceof SesionRed && partida.sesion.cliente.estado === 'reconectando'}
    />
  {/if}

  <div bind:clientHeight={altoAsistente}>
    <Asistente juego={partida.id} sesion={sesionMesa} {raiz} parte="avisos" />
  </div>

  {#if partida.id === 'klondike'}
    <MesaKlondike sesion={partida.sesion} />
  {:else if partida.id === 'scorpion'}
    <MesaScorpion sesion={partida.sesion} />
  {:else if partida.id === 'belleLucie'}
    <MesaBelleLucie sesion={partida.sesion} />
  {:else if partida.id === 'cuarentaLadrones'}
    <MesaCuarentaLadrones sesion={partida.sesion} />
  {:else if partida.id === 'canfield'}
    <MesaCanfield sesion={partida.sesion} />
  {:else if partida.id === 'yukon'}
    <MesaYukon sesion={partida.sesion} />
  {:else if partida.id === 'tripeaks'}
    <MesaTriPeaks sesion={partida.sesion} />
  {:else if partida.id === 'golf'}
    <MesaGolf sesion={partida.sesion} />
  {:else if partida.id === 'piramide'}
    <MesaPiramide sesion={partida.sesion} />
  {:else if partida.id === 'spider'}
    <MesaSpider sesion={partida.sesion} />
  {:else if partida.id === 'freecell'}
    <MesaFreeCell sesion={partida.sesion} />
  {:else if partida.id === 'cinquillo'}
    <MesaCinquillo sesion={partida.sesion} />
  {:else if partida.id === 'corazones'}
    <MesaCorazones sesion={partida.sesion} />
  {:else if partida.id === 'burro'}
    <MesaBurro sesion={partida.sesion} />
  {:else if partida.id === 'remigio'}
    <MesaRemigio sesion={partida.sesion} />
  {:else if partida.id === 'sevens'}
    <MesaSevens sesion={partida.sesion} />
  {:else if partida.id === 'casino'}
    <MesaCasino sesion={partida.sesion} />
  {:else if partida.id === 'durak'}
    <MesaDurak sesion={partida.sesion} />
  {:else if partida.id === 'euchre'}
    <MesaEuchre sesion={partida.sesion} />
  {:else if partida.id === 'bigTwo'}
    <MesaBigTwo sesion={partida.sesion} />
  {:else if partida.id === 'cribbage'}
    <MesaCribbage sesion={partida.sesion} />
  {:else if partida.id === 'belote'}
    <MesaBelote sesion={partida.sesion} />
  {:else if partida.id === 'schnapsen' || partida.id === 'sixtySix'}
    <MesaSchnapsen sesion={partida.sesion} />
  {:else if partida.id === 'skat'}
    <MesaSkat sesion={partida.sesion} />
  {:else if partida.id === 'bridge'}
    <MesaBridge sesion={partida.sesion} />
  {:else if partida.id === 'pesca'}
    <MesaPesca sesion={partida.sesion} />
  {:else if partida.id === 'kingsCorner'}
    <MesaKingsCorner sesion={partida.sesion} />
  {:else if partida.id === 'bezique'}
    <MesaBezique sesion={partida.sesion} />
  {:else if partida.id === 'doppelkopf'}
    <MesaDoppelkopf sesion={partida.sesion} />
  {:else if partida.id === 'tarot'}
    <MesaTarot sesion={partida.sesion} />
  {:else if partida.id === 'sueca'}
    <MesaSueca sesion={partida.sesion} />
  {:else if partida.id === 'piquet'}
    <MesaPiquet sesion={partida.sesion} />
  {:else if partida.id === 'jass'}
    <MesaJass sesion={partida.sesion} />
  {:else if partida.id === 'klaverjas'}
    <MesaKlaverjas sesion={partida.sesion} />
  {:else if partida.id === 'barbu'}
    <MesaBarbu sesion={partida.sesion} />
  {:else if partida.id === 'fiveHundred'}
    <MesaFiveHundred sesion={partida.sesion} />
  {:else if partida.id === 'scopa'}
    <MesaScopa sesion={partida.sesion} />
  {:else if partida.id === 'tressette'}
    <MesaTressette sesion={partida.sesion} />
  {:else if partida.id === 'schafkopf'}
    <MesaSchafkopf sesion={partida.sesion} />
  {:else if partida.id === 'truco'}
    <MesaTruco sesion={partida.sesion} />
  {:else if partida.id === 'preference'}
    <MesaPreference sesion={partida.sesion} />
  {:else if partida.id === 'cuarenta'}
    <MesaCuarenta sesion={partida.sesion} />
  {:else if partida.id === 'pishti'}
    <MesaPishti sesion={partida.sesion} />
  {:else if partida.id === 'ecarte'}
    <MesaEcarte sesion={partida.sesion} />
  {:else if partida.id === 'tysiacha'}
    <MesaTysiacha sesion={partida.sesion} />
  {:else if partida.id === 'sheepshead'}
    <MesaSheepshead sesion={partida.sesion} />
  {:else if partida.id === 'rentz'}
    <MesaRentz sesion={partida.sesion} />
  {:else if partida.id === 'bourre'}
    <MesaBourre sesion={partida.sesion} />
  {:else if partida.id === 'tresillo'}
    <MesaTresillo sesion={partida.sesion} />
  {:else if partida.id === 'conquian'}
    <MesaConquian sesion={partida.sesion} />
  {:else if partida.id === 'treintaYUno'}
    <MesaTreintaYUno sesion={partida.sesion} />
  {:else if partida.id === 'twentyNine'}
    <MesaTwentyNine sesion={partida.sesion} />
  {:else if partida.id === 'briscolaChiamata'}
    <MesaBriscolaChiamata sesion={partida.sesion} />
  {:else if partida.id === 'handAndFoot'}
    <MesaHandAndFoot sesion={partida.sesion} />
  {:else if partida.id === 'ohHell'}
    <MesaOhHell sesion={partida.sesion} />
  {:else if partida.id === 'spiteMalice'}
    <MesaSpiteMalice sesion={partida.sesion} />
  {:else if partida.id === 'whist'}
    <MesaWhist sesion={partida.sesion} />
  {:else if partida.id === 'canasta'}
    <MesaCanasta sesion={partida.sesion} />
  {:else if partida.id === 'culo'}
    <MesaCulo sesion={partida.sesion} />
  {:else if partida.id === 'holdem'}
    <MesaHoldem sesion={partida.sesion} />
  {:else if partida.id === 'rummy500'}
    <MesaRummy500 sesion={partida.sesion} />
  {:else if partida.id === 'ginRummy'}
    <MesaGinRummy sesion={partida.sesion} />
  {:else if partida.id === 'blackjack'}
    <MesaBlackjack sesion={partida.sesion} />
  {:else if partida.id === 'picas'}
    <MesaPicas sesion={partida.sesion} />
  {:else if partida.id === 'ochoLoco'}
    <MesaOchoLoco sesion={partida.sesion} />
  {:else if partida.id === 'mentiroso'}
    <MesaMentiroso sesion={partida.sesion} />
  {:else if partida.id === 'cuatrola'}
    <MesaCuatrola sesion={partida.sesion} />
  {:else if partida.id === 'tuteSubastado'}
    <MesaTuteSubastado sesion={partida.sesion} />
  {:else if partida.id === 'julepe'}
    <MesaJulepe sesion={partida.sesion} />
  {:else if partida.id === 'truc'}
    <MesaTruc sesion={partida.sesion} />
  {:else if partida.id === 'butifarra'}
    <MesaButifarra sesion={partida.sesion} />
  {:else if partida.id === 'pinacle'}
    <MesaPinacle sesion={partida.sesion} />
  {:else if partida.id === 'mus'}
    <MesaMus sesion={partida.sesion} />
  {:else if partida.id === 'pocha'}
    <MesaPocha sesion={partida.sesion} />
  {:else if partida.id === 'chinchon'}
    <MesaChinchon sesion={partida.sesion} />
  {:else if partida.id === 'escoba'}
    <MesaEscoba sesion={partida.sesion} />
  {:else if partida.id === 'tute'}
    <MesaTute sesion={partida.sesion} />
  {:else if partida.id === 'guinote'}
    <MesaGuinote sesion={partida.sesion} />
  {:else if partida.id === 'sieteYMedia'}
    <MesaSieteYMedia sesion={partida.sesion} />
  {:else}
    <MesaBrisca sesion={partida.sesion} />
  {/if}

  <!-- Velocidad Pausada: la baza terminada espera a que el jugador siga (vale para cualquier mesa). -->
  {#if partida.sesion.retenida && ritmo.tapetes === 0}
    <button class="seguir" onclick={() => partida.sesion.seguir()} data-testid="seguir">
      {T.partida.seguir}
    </button>
  {/if}

  {#if partida.sesion.fin !== null}
    <Fin
      {partida}
      {revancha}
      {menu}
      esperaRevancha={partida.sesion.red !== null && partida.sesion.red.anfitrion !== partida.sesion.asiento}
    />
  {/if}

  {#if verAyuda}
    <ComoSeJuega juego={partida.id} cerrar={() => (verAyuda = false)} />
  {/if}
</div>

<style>
  header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 8px 4px;
    max-width: 860px;
    margin: 0 auto;
  }

  header button {
    padding: 0.3rem 0.8rem;
    min-height: 40px;
  }

  h1 {
    font-size: 1.15rem;
  }

  .seguir {
    position: fixed;
    left: 50%;
    bottom: calc(16px + env(safe-area-inset-bottom));
    translate: -50% 0;
    z-index: 30;
    min-height: 44px;
    padding: 0.4rem 1.6rem;
    font-weight: 700;
    background: var(--acento);
    color: #2b2005;
    box-shadow: 0 4px 14px rgb(0 0 0 / 0.4);
  }

  /* Con el interruptor del modo asistido, este ya empuja a la derecha. */
  :global(header .asistente + .ayuda) {
    margin-left: 0;
  }

  .ayuda {
    margin-left: auto;
    width: 40px;
    padding: 0;
    border-radius: 50%;
    font-weight: 800;
    font-size: 1.1rem;
  }
</style>
