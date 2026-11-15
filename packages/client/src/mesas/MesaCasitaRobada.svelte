<script lang="ts">
  import type {
    AccionCasitaRobada,
    Asiento,
    ConfigCasitaRobada,
    EstadoCasitaRobada,
    IdCarta,
    VistaCasitaRobada,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import { nombreNumerado } from './bazas/asientos';

  interface Props {
    sesion: SesionMesa<ConfigCasitaRobada, EstadoCasitaRobada, AccionCasitaRobada, VistaCasitaRobada>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);
  const rivales = $derived(Array.from({ length: n }, (_, a) => (yo + 1 + a) % n).slice(0, n - 1));
  const miTurno = $derived(vista.turno === yo && sesion.fin === null && !sesion.bloqueada);

  // ── Jugar ──────────────────────────────────────────────────────────────────

  /** La carta que el jugador ha tocado y con la que puede robar: falta elegir a quién. */
  let eligiendo: IdCarta | null = $state(null);
  const jugadasDe = (carta: IdCarta) => legales.filter((a) => a.carta === carta);
  // Si cambia el turno o la mano, se cierra la pregunta.
  $effect(() => {
    if (!miTurno) eligiendo = null;
  });

  function tocar(carta: IdCarta) {
    if (!miTurno) return;
    const jugadas = jugadasDe(carta);
    if (jugadas.length === 1) sesion.jugar(jugadas[0]!);
    else if (jugadas.length > 1) eligiendo = carta;
  }

  function jugar(accion: AccionCasitaRobada) {
    eligiendo = null;
    sesion.jugar(accion);
  }

  // ── Textos ─────────────────────────────────────────────────────────────────

  const turnoTexto = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    return vista.turno === yo ? T.casitaRobada.tuTurno : T.brisca.turnoDe(nombre(vista.turno));
  });

  const aviso = $derived.by(() => {
    if (vista.final && vista.final.para !== null && vista.final.cartas > 0) {
      return T.casitaRobada.finalMesa(nombre(vista.final.para), vista.final.cartas);
    }
    const j = vista.ultimaJugada;
    if (j === null) return null;
    return T.casitaRobada.jugada(
      nombre(j.asiento),
      j.deLaMesa.length,
      j.robo === null ? null : nombre(j.robo.a),
      j.robo?.cartas ?? 0,
    );
  });
</script>

{#snippet casita(a: Asiento)}
  {@const cartas = vista.casitas[a] ?? []}
  {@const arriba = cartas.at(-1)}
  <div class="casita" data-testid="casita-{a}">
    <span class="mini" class:vacia={!arriba} data-carta={arriba}>
      {#if arriba}<Carta id={arriba} />{/if}
    </span>
    <span class="cuenta" data-testid="cuenta-casita-{a}">
      {cartas.length === 0 ? T.casitaRobada.vacia : T.casitaRobada.cartas(cartas.length)}
    </span>
  </div>
{/snippet}

<div class="casita-robada">
  <div class="rivales">
    {#each rivales as a (a)}
      <section class="puesto" class:activo={vista.turno === a && sesion.fin === null} data-testid="puesto-{a}">
        <b>{nombre(a)}</b>
        <div class="dorsos">
          {#each { length: vista.cartasEnMano[a] ?? 0 }, k (k)}
            <span class="dorso"><Carta /></span>
          {/each}
        </div>
        {@render casita(a)}
      </section>
    {/each}
  </div>

  <div class="centro">
    <div class="mesa" data-testid="mesa" aria-label={T.casitaRobada.mesa}>
      {#each vista.mesa as c (c)}
        <span class="naipe" data-carta={c}><Carta id={c} /></span>
      {/each}
    </div>
    <p class="mazo" data-testid="mazo">{T.casitaRobada.mazo(vista.mazo)}</p>
    {#if aviso}<p class="aviso" role="status" data-testid="aviso">{aviso}</p>{/if}
  </div>

  <section class="propio" class:activo={miTurno} data-testid="puesto-{yo}">
    <div class="fila-propia">
      <span class="nombre">{T.brisca.tu}</span>
      {@render casita(yo)}
    </div>
    <p class="turno" role="status" data-testid="turno">{turnoTexto}</p>
    {#if eligiendo !== null}
      {@const carta = eligiendo}
      <div class="robo" data-testid="panel-robo">
        <p>{T.casitaRobada.preguntaRobo}</p>
        <div class="botones">
          {#each jugadasDe(carta).filter((a) => a.robar !== null) as a (a.robar)}
            <button
              class="principal"
              data-accion="jugar"
              data-jugada={JSON.stringify(a)}
              data-testid="robar-{a.robar}"
              onclick={() => jugar(a)}>{T.casitaRobada.robarA(nombre(a.robar!), vista.casitas[a.robar!]!.length)}</button
            >
          {/each}
          <button
            data-accion="jugar"
            data-jugada={JSON.stringify({ tipo: 'jugar', carta, robar: null })}
            data-testid="no-robar"
            onclick={() => jugar({ tipo: 'jugar', carta, robar: null })}>{T.casitaRobada.noRobar}</button
          >
          <button data-testid="cancelar-robo" onclick={() => (eligiendo = null)}>{T.casitaRobada.cancelar}</button>
        </div>
      </div>
    {/if}
    <div class="mano" data-testid="mano">
      {#each vista.miMano ?? [] as c (c)}
        <button
          class="naipe grande"
          class:elegida={eligiendo === c}
          data-carta={c}
          data-testid="carta-{c}"
          data-accion="jugar"
          disabled={!miTurno}
          onclick={() => tocar(c)}
        >
          <Carta id={c} />
        </button>
      {/each}
    </div>
  </section>
</div>

<style>
  .casita-robada {
    --ancho-carta: min(15vw, 9dvh, 70px);
    --ancho-mini: min(9vw, 5dvh, 40px);
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: min(100%, 760px);
    min-height: calc(100dvh - 60px - var(--alto-asistente, 0px));
    margin: 0 auto;
    padding: 0 8px 12px;
  }

  .rivales {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 6px;
  }

  .puesto {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 4px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.18);
    font-size: 0.85rem;
    min-width: 0;
  }

  .puesto.activo,
  .propio.activo {
    outline: 2px solid var(--acento);
  }

  .dorsos {
    display: flex;
    gap: 2px;
    min-height: calc(var(--ancho-mini) * 0.7);
  }

  .dorso {
    display: block;
    width: calc(var(--ancho-mini) * 0.5);
    aspect-ratio: 100 / 140;
  }

  .casita {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .mini {
    display: block;
    width: var(--ancho-mini);
    aspect-ratio: 100 / 140;
    border-radius: 7%;
  }

  .mini.vacia {
    outline: 2px dashed rgb(255 255 255 / 0.2);
    outline-offset: -2px;
  }

  .cuenta {
    font-weight: 700;
  }

  .centro {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 1;
  }

  .mesa {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    min-height: calc(var(--ancho-carta) * 1.4);
    max-width: 100%;
  }

  .naipe {
    display: block;
    width: var(--ancho-carta);
    aspect-ratio: 100 / 140;
    border-radius: 7%;
  }

  .mazo {
    margin: 0;
    font-size: 0.85rem;
    color: var(--texto-suave);
  }

  .aviso {
    margin: 0;
    padding: 4px 12px;
    border-radius: 14px;
    font-size: 0.9rem;
    text-align: center;
    background: rgb(0 0 0 / 0.35);
  }

  .propio {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 8px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.12);
  }

  .fila-propia {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 600;
    background: rgb(0 0 0 / 0.2);
  }

  .activo .nombre {
    background: var(--acento);
    color: #2b2005;
  }

  .turno {
    margin: 0;
    min-height: 1.3em;
    font-weight: 600;
    text-align: center;
  }

  .robo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .robo p {
    margin: 0;
  }

  .botones {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .mano {
    display: flex;
    gap: 8px;
  }

  .naipe.grande {
    width: calc(var(--ancho-carta) * 1.2);
    padding: 0;
    border: 0;
    background: none;
    transition: translate 120ms;
  }

  .naipe.grande:disabled {
    opacity: 1;
    cursor: default;
  }

  .naipe.grande.elegida {
    translate: 0 -10px;
  }

  .naipe.grande.elegida :global(.carta) {
    outline: 3px solid var(--resalte);
    border-radius: 7%;
  }
</style>
