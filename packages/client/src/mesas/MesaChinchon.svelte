<script lang="ts">
  import {
    cartaDeId,
    esComodin,
    mejorReparto,
    PALOS_ESPANOLES,
    type AccionChinchon,
    type Asiento,
    type ConfigChinchon,
    type EstadoChinchon,
    type IdCarta,
    type VistaChinchon,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import { Interaccion } from '../interaccion/interaccion.svelte';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AsientoRival from './bazas/AsientoRival.svelte';
  import { nombreNumerado, relativo, type Lado } from './bazas/asientos';
  import ManoPropia from './bazas/ManoPropia.svelte';
  import ResultadoChinchon from './ResultadoChinchon.svelte';

  interface Props {
    sesion: SesionMesa<ConfigChinchon, EstadoChinchon, AccionChinchon, VistaChinchon>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  const rivales = $derived(Array.from({ length: n }, (_, a) => a).filter((a) => a !== yo));

  // Cada uno juega por su cuenta; el turno gira en sentido antihorario.
  const LADOS: Readonly<Record<number, readonly Lado[]>> = {
    2: ['abajo', 'arriba'],
    3: ['abajo', 'derecha', 'arriba'],
    4: ['abajo', 'derecha', 'arriba', 'izquierda'],
  };
  const lado = (asiento: Asiento) => LADOS[n]![relativo(asiento, n, yo)]!;
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);

  // ── Acciones legales ───────────────────────────────────────────────────────

  const robo = (desde: 'mazo' | 'descarte') =>
    legales.find((a) => a.tipo === 'robar' && a.desde === desde);
  const descarte = (carta: string) =>
    legales.find((a) => a.tipo === 'descartar' && a.carta === carta);
  const cierre = (carta: string) =>
    legales.find((a) => a.tipo === 'cerrar' && a.carta === carta);

  function jugar(accion: AccionChinchon | undefined) {
    if (!accion) return;
    interaccion.cancelar();
    sesion.jugar(accion);
  }

  const interaccion = new Interaccion({
    destinos(origen) {
      if (origen === 'mazo' || origen === 'descarte') return robo(origen) ? ['mano'] : [];
      return descarte(origen) ? ['descarte'] : [];
    },
    destinoObvio(origen) {
      if (origen === 'mazo' || origen === 'descarte') return robo(origen) ? 'mano' : null;
      return descarte(origen) ? 'descarte' : null;
    },
    mover(origen, destino) {
      if (destino === 'mano' && (origen === 'mazo' || origen === 'descarte')) jugar(robo(origen));
      else if (destino === 'descarte') jugar(descarte(origen));
    },
    elementos: (_origen, nodo) => [nodo],
    // Un toque en el mazo o en el descarte roba directamente.
    alTocar(origen) {
      if (origen !== 'mazo' && origen !== 'descarte') return false;
      const accion = robo(origen);
      if (accion) jugar(accion);
      return accion !== undefined;
    },
  });

  const elegida = $derived(
    interaccion.seleccion !== null &&
      interaccion.seleccion !== 'mazo' &&
      interaccion.seleccion !== 'descarte'
      ? (interaccion.seleccion as IdCarta)
      : null,
  );

  // ── Mano ordenada y combinaciones ──────────────────────────────────────────

  type Orden = 'combinaciones' | 'palo' | 'valor';
  let orden: Orden = $state('combinaciones');

  const mano = $derived(vista.miMano ?? []);
  const reparto = $derived(mejorReparto(mano, vista.config.baraja));

  const valorDe = (c: IdCarta) => (esComodin(c) ? 99 : cartaDeId(c)!.valor);
  const paloDe = (c: IdCarta) =>
    esComodin(c) ? 9 : PALOS_ESPANOLES.indexOf(cartaDeId(c)!.palo as (typeof PALOS_ESPANOLES)[number]);

  const manoOrdenada = $derived.by(() => {
    if (orden === 'combinaciones') {
      const sueltas = [...reparto.sueltas].sort((a, b) => valorDe(a) - valorDe(b));
      return [...reparto.combinaciones.flat(), ...sueltas];
    }
    const porPalo = (a: IdCarta, b: IdCarta) => paloDe(a) - paloDe(b) || valorDe(a) - valorDe(b);
    const porValor = (a: IdCarta, b: IdCarta) => valorDe(a) - valorDe(b) || paloDe(a) - paloDe(b);
    return [...mano].sort(orden === 'palo' ? porPalo : porValor);
  });

  const grupo = (carta: IdCarta) => {
    const i = reparto.combinaciones.findIndex((c) => c.includes(carta));
    return i < 0 ? null : i;
  };

  // ── Estado del turno y avisos ──────────────────────────────────────────────

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (vista.turno !== yo) return T.brisca.turnoDe(nombre(vista.turno));
    return vista.fase === 'robar' ? T.chinchon.faseRobar : T.chinchon.faseDescartar;
  });

  /** Lo último que hizo un rival, para poder seguir su turno. */
  const avisoRival = $derived.by(() => {
    const a = vista.ultimaAccion;
    if (a === null || a.asiento === yo) return null;
    return a.tipo === 'robar'
      ? T.chinchon.robaDe(nombre(a.asiento), a.desde)
      : T.chinchon.descarta(nombre(a.asiento), nombreCarta(a.carta).toLowerCase());
  });

  // ── Resultado al terminar cada mano ────────────────────────────────────────

  let resultado: number | null = $state(null);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      resultado = total - 1;
      sesion.pausar();
    }
    manosVistas = total;
  });

  const eliminadosAntes = (i: number) =>
    i === 0
      ? new Array<boolean>(n).fill(false)
      : vista.resultadosManos[i - 1]!.eliminadosTras;

  function siguienteMano() {
    resultado = null;
    sesion.reanudar();
  }

  // ── Animación ──────────────────────────────────────────────────────────────

  let raiz: HTMLElement | undefined = $state();
  let previas: Posiciones = new Map();
  $effect.pre(() => {
    void vista;
    void manoOrdenada;
    if (raiz) previas = medir(raiz);
  });
  $effect(() => {
    void vista;
    void manoOrdenada;
    if (raiz) animar(raiz, previas);
  });
</script>

<div class="chinchon" class:cuatro={n === 4} bind:this={raiz}>
  <div class="info">
    {#each [yo, ...rivales] as asiento (asiento)}
      <span class:eliminado={vista.eliminados[asiento]} data-testid="puntos-{asiento}">
        {nombre(asiento)}: {vista.eliminados[asiento] ? T.chinchon.eliminado : T.chinchon.puntos(vista.puntos[asiento] ?? 0)}
      </span>
    {/each}
    <span>/ {vista.config.limite}</span>
  </div>

  {#each rivales as asiento (asiento)}
    <AsientoRival
      {asiento}
      lado={lado(asiento)}
      nombre={nombre(asiento)}
      detalle={vista.eliminados[asiento] ? T.chinchon.eliminado : T.chinchon.puntos(vista.puntos[asiento] ?? 0)}
      cartas={vista.cartasEnMano[asiento] ?? 0}
      activo={vista.turno === asiento && sesion.fin === null}
    />
  {/each}

  <div class="centro">
    <div class="pilas">
      <div
        class="pila mazo"
        class:robable={robo('mazo') !== undefined}
        data-zona="mazo"
        data-testid="mazo"
        role="button"
        tabindex="-1"
        aria-label={T.chinchon.robarMazo}
        use:interaccion.origen={'mazo'}
      >
        {#if vista.mazo > 0}<Carta />{/if}
        <span class="cuenta" aria-hidden="true">{vista.mazo}</span>
      </div>
      <div
        class="pila descarte"
        class:robable={robo('descarte') !== undefined}
        class:legal={interaccion.resaltados.has('descarte')}
        data-zona="descarte"
        data-destino="descarte"
        data-testid="descarte"
        role="button"
        tabindex="-1"
        aria-label={vista.descarteArriba
          ? T.chinchon.robarDescarte(nombreCarta(vista.descarteArriba).toLowerCase())
          : T.chinchon.descarte}
        use:interaccion.origen={'descarte'}
        onclick={() => interaccion.tocarDestino('descarte')}
        onkeydown={() => {}}
      >
        {#if vista.descarteArriba}
          {#key vista.descarteArriba}
            <div
              class="arriba"
              data-carta={vista.descarteArriba}
              data-desde={vista.ultimaAccion && vista.ultimaAccion.tipo !== 'robar'
                ? `mano-${vista.ultimaAccion.asiento}`
                : 'mazo'}
            >
              <Carta id={vista.descarteArriba} />
            </div>
          {/key}
        {/if}
      </div>
    </div>
    {#if avisoRival}
      <p class="aviso" role="status" data-testid="aviso">{avisoRival}</p>
    {/if}
  </div>

  <div class="propio" class:activo={vista.turno === yo && sesion.fin === null}>
    <div class="estado">
      <span class="nombre">{T.brisca.tu}</span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
      {#if elegida !== null && vista.fase === 'descartar' && vista.turno === yo}
        <button data-testid="descartar" disabled={!descarte(elegida)} onclick={() => jugar(descarte(elegida))}
          >{T.chinchon.descartar}</button
        >
        <button class="principal" data-testid="cerrar" disabled={!cierre(elegida)} onclick={() => jugar(cierre(elegida))}
          >{T.chinchon.cerrar}</button
        >
      {/if}
    </div>
    <ManoPropia
      cartas={manoOrdenada}
      jugable={(c) => descarte(c) !== undefined}
      {interaccion}
      {grupo}
      destino="mano"
    />
    <div class="pie">
      <span class="sueltas" data-testid="sueltas">{T.chinchon.sueltas(reparto.puntos)}</span>
      <label class="orden">
        {T.chinchon.ordenar}
        <select bind:value={orden} data-testid="orden">
          <option value="combinaciones">{T.chinchon.porCombinaciones}</option>
          <option value="palo">{T.chinchon.porPalo}</option>
          <option value="valor">{T.chinchon.porValor}</option>
        </select>
      </label>
    </div>
  </div>
</div>

{#if resultado !== null && vista.resultadosManos[resultado]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.chinchon.finMano}</h2>
      <ResultadoChinchon
        resultado={vista.resultadosManos[resultado]!}
        {nombre}
        eliminadosAntes={eliminadosAntes(resultado)}
      />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.chinchon.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .chinchon {
    --ancho-carta: min(19vw, 13dvh, 104px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --ancho-rival: min(10vw, 7dvh, 54px);
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto 1fr auto;
    grid-template-areas:
      'info info info'
      'arriba arriba arriba'
      'izquierda centro derecha'
      'abajo abajo abajo';
    gap: 8px;
    width: min(100%, 860px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .chinchon.cuatro {
    --ancho-rival: min(9vw, 6dvh, 48px);
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

  .info .eliminado {
    color: var(--peligro);
    text-decoration: line-through;
  }

  .centro {
    grid-area: centro;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 0;
  }

  .pilas {
    display: flex;
    gap: clamp(14px, 6vw, 40px);
  }

  .pila {
    position: relative;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    border-radius: 7%;
    outline: 2px dashed rgb(255 255 255 / 0.2);
    outline-offset: -2px;
    touch-action: none;
  }

  .pila.robable {
    cursor: pointer;
    outline: 3px solid rgb(255 224 102 / 0.7);
    outline-offset: 2px;
  }

  .descarte.legal {
    outline: 3px solid var(--resalte);
    box-shadow: 0 0 18px rgb(255 224 102 / 0.45);
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
    font-size: 0.9rem;
    background: rgb(0 0 0 / 0.35);
  }

  .propio {
    grid-area: abajo;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .estado {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 10px;
    min-height: 44px;
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
    font-weight: 600;
  }

  .pie {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 16px;
    margin-top: 8px;
    font-size: 0.88rem;
    color: var(--texto-suave);
  }

  .orden select {
    margin-left: 6px;
    min-height: 34px;
    padding: 2px 6px;
    border-radius: 8px;
    background: rgb(0 0 0 / 0.3);
    border: 1px solid rgb(255 255 255 / 0.25);
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
