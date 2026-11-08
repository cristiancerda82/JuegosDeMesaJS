<script lang="ts">
  import {
    cartaDeId,
    PALOS_FRANCESES,
    type AccionTreintaYUno,
    type Asiento,
    type ConfigTreintaYUno,
    type EstadoTreintaYUno,
    type IdCarta,
    type VistaTreintaYUno,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AsientoRival from './bazas/AsientoRival.svelte';
  import { lado, nombreNumerado } from './bazas/asientos';
  import ResumenTreintaYUno from './ResumenTreintaYUno.svelte';

  interface Props {
    sesion: SesionMesa<ConfigTreintaYUno, EstadoTreintaYUno, AccionTreintaYUno, VistaTreintaYUno>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  const rivales = $derived(Array.from({ length: n }, (_, a) => a).filter((a) => a !== yo));
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);
  const miTurno = $derived(vista.turno === yo && sesion.fin === null);

  // ── Acciones ───────────────────────────────────────────────────────────────

  const robo = (desde: 'mazo' | 'descarte') =>
    legales.find((a) => a.tipo === 'robar' && a.desde === desde);
  const plantarse = $derived(legales.find((a) => a.tipo === 'plantarse'));
  const descarte = (c: IdCarta) => legales.find((a) => a.tipo === 'descartar' && a.carta === c);

  function jugar(accion: AccionTreintaYUno | undefined) {
    if (accion) sesion.jugar(accion);
  }

  // ── Mano ordenada: por palo y de mayor a menor ─────────────────────────────

  const paloDe = (c: IdCarta) =>
    PALOS_FRANCESES.indexOf(cartaDeId(c)!.palo as (typeof PALOS_FRANCESES)[number]);
  const fuerza = (c: IdCarta) => {
    const v = cartaDeId(c)!.valor;
    return v === 1 ? 14 : v;
  };
  const manoOrdenada = $derived(
    [...(vista.miMano ?? [])].sort((a, b) => paloDe(a) - paloDe(b) || fuerza(b) - fuerza(a)),
  );

  // ── Textos ─────────────────────────────────────────────────────────────────

  const detalle = (a: Asiento) => {
    const marcas = [T.treinta.vidas(vista.vidas[a] ?? 0)];
    if ((vista.vidas[a] ?? 0) <= 0) marcas.push(T.treinta.fuera);
    else if (vista.plantado === a) marcas.push(T.treinta.plantado);
    return marcas.join(' · ');
  };

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (vista.turno !== yo) return T.brisca.turnoDe(nombre(vista.turno));
    return vista.fase === 'descartar' ? T.treinta.faseDescartar : T.treinta.faseRobar;
  });

  const avisoPlantado = $derived(
    vista.plantado === null
      ? null
      : T.treinta.sePlanta(nombre(vista.plantado), vista.ultimos),
  );

  // ── Resumen al terminar cada ronda ─────────────────────────────────────────

  let resumen: number | null = $state(null);
  /** Rondas terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let rondasVistas: number | null = null;
  $effect(() => {
    const total = vista.resultadosRondas.length;
    if (rondasVistas !== null && total > rondasVistas && sesion.fin === null) {
      resumen = total - 1;
      sesion.pausar();
    }
    rondasVistas = total;
  });

  function siguienteRonda() {
    resumen = null;
    sesion.reanudar();
  }

  const arriba = $derived(vista.descarte.at(-1) ?? null);
</script>

<div class="treinta" class:muchos={n >= 5}>
  <div class="info">
    <span data-testid="ronda-treinta">{T.treinta.ronda(vista.rondaNumero)}</span>
    <span data-testid="vidas">{T.treinta.tusVidas(vista.vidas[yo] ?? 0)}</span>
  </div>

  {#each rivales as asiento (asiento)}
    <AsientoRival
      {asiento}
      lado={lado(asiento, n, yo)}
      nombre={nombre(asiento)}
      detalle={detalle(asiento)}
      cartas={vista.cartasEnMano[asiento] ?? 0}
      visible={vista.conocidas[asiento]?.at(-1) ?? null}
      activo={vista.turno === asiento && sesion.fin === null}
    />
  {/each}

  <div class="centro">
    <div class="pilas">
      <div
        class="pila"
        class:robable={robo('mazo') !== undefined}
        data-testid="mazo"
        role="button"
        tabindex="-1"
        aria-label={T.treinta.robarMazo}
        onclick={() => jugar(robo('mazo'))}
        onkeydown={() => {}}
      >
        {#if vista.enMazo > 0}<Carta />{/if}
        <span class="cuenta" aria-hidden="true">{vista.enMazo}</span>
      </div>
      <div
        class="pila"
        class:robable={robo('descarte') !== undefined}
        data-testid="descarte"
        role="button"
        tabindex="-1"
        aria-label={T.treinta.robarDescarte}
        onclick={() => jugar(robo('descarte'))}
        onkeydown={() => {}}
      >
        {#if arriba}
          {#key arriba}
            <div class="arriba" data-carta={arriba}><Carta id={arriba} /></div>
          {/key}
        {/if}
      </div>
    </div>
    {#if avisoPlantado}
      <p class="aviso" role="status" data-testid="aviso-plantado">{avisoPlantado}</p>
    {/if}
  </div>

  <div class="propio" class:activo={miTurno}>
    <div class="estado">
      <span class="nombre">{T.brisca.tu}</span>
      <span class="valor" data-testid="valor">{T.treinta.valor(vista.valor ?? 0)}</span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
      {#if miTurno && plantarse}
        <button data-accion={plantarse.tipo} data-jugada={JSON.stringify(plantarse)} class="principal" data-testid="plantarse" onclick={() => jugar(plantarse)}>
          {T.treinta.plantarse}
        </button>
      {/if}
    </div>
    <div class="mano" data-testid="mano">
      {#each manoOrdenada as c (c)}
        {@const accion = descarte(c)}
        <button data-accion={accion?.tipo} data-jugada={JSON.stringify(accion)}
          class="carta-mano"
          class:jugable={accion !== undefined}
          class:cogida={vista.cogida === c}
          data-testid="mano-{c}"
          data-carta={c}
          disabled={accion === undefined}
          onclick={() => jugar(accion)}
        >
          <Carta id={c} />
        </button>
      {/each}
    </div>
  </div>
</div>

{#if resumen !== null && vista.resultadosRondas[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-ronda" data-testid="panel-mano">
      <h2 id="fin-ronda">{T.treinta.finRonda(resumen + 1)}</h2>
      <ResumenTreintaYUno resultado={vista.resultadosRondas[resumen]!} {yo} {nombre} />
      <button class="principal" onclick={siguienteRonda} data-testid="siguiente-mano">
        {T.treinta.siguienteRonda}
      </button>
    </div>
  </div>
{/if}

<style>
  .treinta {
    --ancho-carta: min(20vw, 13dvh, 96px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --ancho-rival: min(8vw, 5dvh, 40px);
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto 1fr auto;
    grid-template-areas:
      'info info info'
      'arriba arriba arriba'
      'izquierda centro derecha'
      'abajo abajo abajo';
    gap: 6px;
    width: min(100%, 860px);
    min-height: calc(100dvh - 60px - var(--alto-asistente, 0px));
    margin: 0 auto;
    padding: 0 8px 12px;
    user-select: none;
    -webkit-user-select: none;
  }

  /* Con 5 o 6 jugadores, los rivales de arriba comparten la fila. */
  .treinta.muchos {
    --ancho-rival: min(6vw, 4dvh, 32px);
  }

  .treinta :global(.asiento.arriba-izquierda),
  .treinta :global(.asiento.arriba-derecha) {
    grid-area: arriba;
  }

  .treinta :global(.asiento.arriba-izquierda) {
    justify-self: start;
  }

  .treinta :global(.asiento.arriba-derecha) {
    justify-self: end;
  }

  .info {
    grid-area: info;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px 14px;
    color: var(--texto-suave);
    font-size: 0.88rem;
  }

  .centro {
    grid-area: centro;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 0;
  }

  .pilas {
    display: flex;
    gap: clamp(12px, 5vw, 32px);
  }

  .pila {
    position: relative;
    width: calc(var(--ancho-carta) * 0.8);
    height: calc(var(--alto-carta) * 0.8);
    border-radius: 7%;
    outline: 2px dashed rgb(255 255 255 / 0.2);
    outline-offset: -2px;
  }

  .pila.robable {
    cursor: pointer;
    outline: 3px solid rgb(255 224 102 / 0.7);
    outline-offset: 2px;
  }

  .arriba {
    position: absolute;
    inset: 0;
  }

  .cuenta {
    position: absolute;
    right: 3px;
    bottom: 3px;
    padding: 0 5px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    background: rgb(0 0 0 / 0.55);
  }

  .aviso {
    margin: 0;
    padding: 4px 12px;
    border-radius: 14px;
    font-size: 0.88rem;
    text-align: center;
    background: rgb(0 0 0 / 0.35);
  }

  .propio {
    grid-area: abajo;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .estado {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 10px;
    min-height: 40px;
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

  .valor {
    font-weight: 700;
    color: var(--acento);
  }

  .turno {
    font-weight: 600;
    text-align: center;
  }

  .mano {
    display: flex;
    justify-content: center;
    gap: 6px;
    width: 100%;
  }

  .carta-mano {
    width: var(--ancho-carta);
    height: var(--alto-carta);
    padding: 0;
    border: 0;
    background: none;
    transition: translate 120ms;
  }

  .carta-mano:disabled {
    opacity: 1;
    cursor: default;
  }

  .carta-mano.jugable {
    cursor: pointer;
  }

  .carta-mano.jugable:hover {
    translate: 0 -8px;
  }

  .carta-mano.jugable :global(.carta) {
    outline: 2px solid rgb(255 224 102 / 0.7);
    border-radius: 7%;
  }

  .carta-mano.cogida :global(.carta) {
    outline: 3px solid var(--texto-suave);
    border-radius: 7%;
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
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: min(100%, 460px);
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
    margin: 0;
  }
</style>
