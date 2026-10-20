<script lang="ts">
  import {
    baseRemigio,
    claveRemigio,
    esComodinRemigio,
    igualesJSON,
    PALOS_ESPANOLES,
    paloRemigio,
    planesRemigio,
    posicionRemigio,
    type AccionRemigio,
    type Asiento,
    type CartaRemigio,
    type CombinacionRemigio,
    type ConfigRemigio,
    type EstadoRemigio,
    type PlanRemigio,
    type VistaRemigio,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AsientoRival from './bazas/AsientoRival.svelte';
  import { lado, nombreNumerado } from './bazas/asientos';
  import ResumenRemigio from './ResumenRemigio.svelte';

  interface Props {
    sesion: SesionMesa<ConfigRemigio, EstadoRemigio, AccionRemigio, VistaRemigio>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const yo = $derived(sesion.asiento);
  const rivales = $derived(
    Array.from({ length: n }, (_, a) => a).filter((a) => a !== yo && !vista.eliminados[a]),
  );
  const nombre = (asiento: Asiento) =>
    nombreNumerado(asiento, n, yo, sesion.red, T.brisca.rivalN, T.brisca.rival);

  const miTurno = $derived(vista.turno === yo && sesion.fin === null);
  const nombreDe = (c: CartaRemigio) => nombreCarta(baseRemigio(c)).toLowerCase();
  const esLegal = (a: AccionRemigio) => legales.some((x) => igualesJSON(x, a));

  // ── Selección ──────────────────────────────────────────────────────────────

  let seleccion: CartaRemigio[] = $state([]);
  let aviso: string | null = $state(null);

  // La selección se vacía al cambiar de turno, de fase o de mano.
  $effect(() => {
    void vista.turno;
    void vista.fase;
    void vista.numeroMano;
    seleccion = [];
  });

  function tocarCarta(c: CartaRemigio) {
    if (!miTurno || vista.fase !== 'bajar') return;
    aviso = null;
    seleccion = seleccion.includes(c) ? seleccion.filter((x) => x !== c) : [...seleccion, c];
  }

  /** Las jugadas en orden; para si alguna no se acepta. */
  function ejecutar(acciones: readonly AccionRemigio[]) {
    seleccion = [];
    opciones = null;
    for (const a of acciones) if (!sesion.jugar(a)) break;
  }

  /** Planes cuya primera jugada es legal ahora (añadir exige haber bajado). */
  const validos = (planes: PlanRemigio[]) =>
    planes.filter((p) => p.jugadas.length > 0 && esLegal(p.jugadas[0]!));

  const planes = (destino: number | null) =>
    validos(
      planesRemigio(
        vista.miMano ?? [],
        vista.combinaciones,
        seleccion,
        { id: vista.siguienteId, duenio: yo },
        destino,
      ),
    );

  const planesNuevos = $derived(
    miTurno && vista.fase === 'bajar' && seleccion.length >= 3 ? planes(null) : [],
  );

  // ── Elegir entre varias formas ─────────────────────────────────────────────

  let opciones: { titulo: string; lista: { texto: string; hacer: () => void }[] } | null =
    $state(null);

  const NUMEROS: Record<number, string> = { 1: 'As', 10: 'Sota', 11: 'Caballo', 12: 'Rey' };
  const numero = (v: number) => NUMEROS[v] ?? String(v);
  const VALORES = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

  function describir(c: CombinacionRemigio): string {
    if (c.tipo === 'grupo') return T.remigio.grupoDe(numero(c.numero), c.cartas.length);
    const hasta = c.desde + c.puestos.length - 1;
    return T.remigio.escaleraDe(numero(VALORES[c.desde - 1]!), numero(VALORES[hasta - 1]!), c.palo);
  }

  function hacerPlanes(lista: PlanRemigio[]) {
    if (lista.length === 1) ejecutar(lista[0]!.jugadas);
    else if (lista.length > 1) {
      opciones = {
        titulo: T.remigio.eligeForma,
        lista: lista.map((p) => ({
          texto: describir(p.combinacion),
          hacer: () => ejecutar(p.jugadas),
        })),
      };
    }
  }

  function bajar() {
    hacerPlanes(planesNuevos);
  }

  /** Tocar una combinación: cambiar un comodín de un grupo, o añadir la selección. */
  function tocarCombinacion(c: CombinacionRemigio) {
    if (!miTurno || vista.fase !== 'bajar' || seleccion.length === 0) return;
    if (!vista.bajado[yo]) {
      aviso = T.remigio.antesBaja;
      return;
    }
    if (c.tipo === 'grupo' && seleccion.length === 1) {
      const cambio = legales.find(
        (a) =>
          a.tipo === 'cambiar' &&
          a.combinacion === c.id &&
          claveRemigio(a.carta) === claveRemigio(seleccion[0]!),
      );
      if (cambio) return ejecutar([cambio]);
    }
    const lista = planes(c.id);
    if (lista.length === 0) aviso = T.remigio.noEncaja;
    else hacerPlanes(lista);
  }

  /** Tocar un comodín de una escalera con su carta natural elegida: cambiarlo. */
  function tocarComodin(c: CombinacionRemigio, ev: Event) {
    if (c.tipo !== 'escalera' || seleccion.length !== 1) return;
    const cambio = legales.find(
      (a) =>
        a.tipo === 'cambiar' &&
        a.combinacion === c.id &&
        claveRemigio(a.carta) === claveRemigio(seleccion[0]!),
    );
    if (!cambio) return;
    ev.stopPropagation();
    ejecutar([cambio]);
  }

  // ── Robar y descartar ──────────────────────────────────────────────────────

  const robo = (desde: 'mazo' | 'monton') =>
    legales.find((a) => a.tipo === (desde === 'mazo' ? 'robarMazo' : 'robarMonton'));

  function robar(desde: 'mazo' | 'monton') {
    const accion = robo(desde);
    if (accion) {
      aviso = null;
      sesion.jugar(accion);
    }
  }

  const descarte = $derived(
    seleccion.length === 1
      ? legales.find(
          (a) => a.tipo === 'descartar' && claveRemigio(a.carta) === claveRemigio(seleccion[0]!),
        )
      : undefined,
  );

  function descartar() {
    if (descarte) ejecutar([descarte]);
  }

  // ── Mano ordenada ──────────────────────────────────────────────────────────

  let orden: 'palo' | 'numero' = $state('palo');
  const mano = $derived(vista.miMano ?? []);
  const paloDe = (c: CartaRemigio) =>
    esComodinRemigio(c) ? 9 : PALOS_ESPANOLES.indexOf(paloRemigio(c)!);
  const posicionDe = (c: CartaRemigio) => (esComodinRemigio(c) ? 99 : posicionRemigio(c));
  const manoOrdenada = $derived(
    [...mano].sort((a, b) =>
      orden === 'palo'
        ? paloDe(a) - paloDe(b) || posicionDe(a) - posicionDe(b) || a.localeCompare(b)
        : posicionDe(a) - posicionDe(b) || paloDe(a) - paloDe(b) || a.localeCompare(b),
    ),
  );

  // ── Montón ─────────────────────────────────────────────────────────────────

  let verMonton = $state(false);
  const arriba = $derived(vista.monton.at(-1) ?? null);

  // ── Textos de estado ───────────────────────────────────────────────────────

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (vista.turno !== yo) return T.brisca.turnoDe(nombre(vista.turno));
    return vista.fase === 'robar' ? T.remigio.faseRobar : T.remigio.faseBajar;
  });

  const avisoRival = $derived.by(() => {
    const u = vista.ultimaAccion;
    if (u === null || u.asiento === yo) return null;
    const quien = nombre(u.asiento);
    switch (u.tipo) {
      case 'robarMazo':
        return T.remigio.roba(quien);
      case 'robarMonton':
        return T.remigio.robaMonton(quien, u.carta ? nombreDe(u.carta) : '');
      case 'bajar':
        return T.remigio.baja(quien);
      case 'anadir':
        return T.remigio.anade(quien);
      case 'cambiar':
        return T.remigio.cambia(quien);
      default:
        return T.remigio.descarta(quien, u.carta ? nombreDe(u.carta) : '');
    }
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

  /** Las combinaciones por jugador: las propias primero. */
  const porJugador = $derived(
    [yo, ...rivales]
      .map((a) => ({ a, combis: vista.combinaciones.filter((c) => c.duenio === a) }))
      .filter((x) => x.a === yo || x.combis.length > 0),
  );
  const cartasDe = (c: CombinacionRemigio) => (c.tipo === 'grupo' ? c.cartas : c.puestos);
  const tocables = $derived(miTurno && vista.fase === 'bajar' && seleccion.length > 0);
</script>

<div class="remigio" class:muchos={n >= 4}>
  <div class="info">
    <span data-testid="puntos-propios">{T.brisca.tu}: {T.remigio.puntos(vista.puntos[yo] ?? 0)}</span>
    <span>{T.remigio.limite} · {T.remigio.mano(vista.numeroMano + 1)}</span>
  </div>

  {#each rivales as asiento (asiento)}
    <AsientoRival
      {asiento}
      lado={lado(asiento, n, yo)}
      nombre={nombre(asiento)}
      detalle={T.remigio.detalle(vista.cartasEnMano[asiento] ?? 0, vista.puntos[asiento] ?? 0)}
      cartas={Math.min(vista.cartasEnMano[asiento] ?? 0, 8)}
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
        aria-label={T.remigio.robarMazo}
        onclick={() => robar('mazo')}
        onkeydown={() => {}}
      >
        {#if vista.mazo > 0}<Carta />{/if}
        <span class="cuenta" aria-hidden="true">{vista.mazo}</span>
      </div>
      <div
        class="pila"
        class:robable={robo('monton') !== undefined}
        data-testid="monton"
        role="button"
        tabindex="-1"
        aria-label={arriba ? T.remigio.robarMonton(nombreDe(arriba)) : T.remigio.montonVacio}
        onclick={() => robar('monton')}
        onkeydown={() => {}}
      >
        {#if arriba}
          <Carta id={baseRemigio(arriba)} />
          <span class="cuenta" aria-hidden="true">{vista.monton.length}</span>
        {/if}
      </div>
    </div>
    {#if vista.monton.length > 1}
      <button class="enlace" onclick={() => (verMonton = true)} data-testid="ver-monton">
        {T.remigio.verMonton(vista.monton.length)}
      </button>
    {/if}
    {#if aviso}
      <p class="aviso" role="status" data-testid="aviso-remigio">{aviso}</p>
    {:else if avisoRival}
      <p class="aviso" role="status" data-testid="aviso">{avisoRival}</p>
    {/if}
  </div>

  <section class="mesa-combis" data-testid="mesa-combis">
    {#each porJugador as { a, combis } (a)}
      <div class="bloque" data-testid="combis-{a}">
        <h3>{a === yo ? T.remigio.propias : T.remigio.de(nombre(a))}</h3>
        {#each combis as c (c.id)}
          <div
            class="combi"
            class:tocable={tocables}
            data-testid="combi-{c.id}"
            role="button"
            tabindex="-1"
            aria-label={describir(c)}
            onclick={() => tocarCombinacion(c)}
            onkeydown={() => {}}
          >
            {#each cartasDe(c) as carta, i (carta)}
              {@const comodin = esComodinRemigio(carta)}
              <div
                class="mini"
                data-testid={comodin ? `comodin-${c.id}-${i}` : undefined}
                role="presentation"
                onclick={(ev) => comodin && tocarComodin(c, ev)}
              >
                <Carta id={baseRemigio(carta)} />
              </div>
            {/each}
          </div>
        {:else}
          <p class="vacio">{T.remigio.sinCombinaciones}</p>
        {/each}
      </div>
    {/each}
  </section>

  <div class="propio" class:activo={miTurno}>
    <div class="estado">
      <span class="nombre">{T.brisca.tu}</span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
    </div>
    {#if miTurno && vista.fase === 'bajar'}
      <div class="botones">
        <button class="principal" data-testid="bajar" disabled={planesNuevos.length === 0} onclick={bajar}>
          {T.remigio.bajar}
        </button>
        <button data-testid="descartar" disabled={!descarte} onclick={descartar}>{T.remigio.descartar}</button>
        {#if seleccion.length > 0}
          <button data-testid="limpiar" onclick={() => (seleccion = [])}>{T.remigio.limpiar}</button>
        {/if}
      </div>
    {/if}
    <div class="mano" data-testid="mano">
      {#each manoOrdenada as c (c)}
        <button
          class="carta-mano"
          class:seleccionada={seleccion.includes(c)}
          data-testid="mano-{c}"
          data-carta={c}
          aria-pressed={seleccion.includes(c)}
          onclick={() => tocarCarta(c)}
        >
          <Carta id={baseRemigio(c)} />
        </button>
      {/each}
    </div>
    <div class="pie">
      <label class="orden">
        {T.remigio.ordenar}
        <select bind:value={orden} data-testid="orden">
          <option value="palo">{T.remigio.porPalo}</option>
          <option value="numero">{T.remigio.porNumero}</option>
        </select>
      </label>
    </div>
  </div>
</div>

{#if opciones}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="opciones-titulo" data-testid="opciones-bajada">
      <h2 id="opciones-titulo">{opciones.titulo}</h2>
      {#each opciones.lista as o, i (i)}
        <button class="principal" data-testid="opcion-{i}" onclick={o.hacer}>{o.texto}</button>
      {/each}
      <button onclick={() => (opciones = null)}>{T.remigio.cancelar}</button>
    </div>
  </div>
{/if}

{#if verMonton}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="monton-titulo" data-testid="panel-monton">
      <h2 id="monton-titulo">{T.remigio.montonTitulo}</h2>
      <div class="fila-mini">
        {#each vista.monton as carta (carta)}
          <div class="mini"><Carta id={baseRemigio(carta)} /></div>
        {/each}
      </div>
      <button onclick={() => (verMonton = false)}>{T.remigio.cerrarPanel}</button>
    </div>
  </div>
{/if}

{#if resumen !== null && vista.resultadosManos[resumen]}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.remigio.finMano(resumen + 1)}</h2>
      <ResumenRemigio resultado={vista.resultadosManos[resumen]!} {nombre} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.remigio.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .remigio {
    --ancho-carta: min(15vw, 9dvh, 70px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --ancho-rival: min(8vw, 5dvh, 40px);
    --ancho-mini: min(8vw, 5dvh, 38px);
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto auto auto auto;
    grid-template-areas:
      'info info info'
      'arriba arriba arriba'
      'izquierda centro derecha'
      'combis combis combis'
      'abajo abajo abajo';
    gap: 6px;
    width: min(100%, 900px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    user-select: none;
    -webkit-user-select: none;
  }

  /* Con 4 y 5 jugadores, los rivales de arriba comparten la fila. */
  .remigio.muchos {
    --ancho-rival: min(6vw, 4dvh, 32px);
  }

  .remigio :global(.asiento.arriba-izquierda),
  .remigio :global(.asiento.arriba-derecha) {
    grid-area: arriba;
  }

  .remigio :global(.asiento.arriba-izquierda) {
    justify-self: start;
  }

  .remigio :global(.asiento.arriba-derecha) {
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
    gap: 6px;
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
  }

  .pila.robable {
    cursor: pointer;
    outline: 3px solid rgb(255 224 102 / 0.7);
    outline-offset: 2px;
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

  .enlace {
    min-height: 32px;
    padding: 2px 10px;
    font-size: 0.85rem;
  }

  .fila-mini {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;
    margin: 8px 0;
  }

  .mini {
    width: var(--ancho-mini);
    height: calc(var(--ancho-mini) * 1.4);
    flex-shrink: 0;
  }

  .aviso {
    margin: 0;
    padding: 4px 12px;
    border-radius: 14px;
    font-size: 0.9rem;
    text-align: center;
    background: rgb(0 0 0 / 0.35);
  }

  .mesa-combis {
    grid-area: combis;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
    max-height: 32dvh;
    overflow-y: auto;
  }

  .bloque {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 8px 14px;
    min-width: 0;
    padding: 6px;
    border-radius: 10px;
    background: rgb(0 0 0 / 0.15);
  }

  .bloque h3 {
    flex-basis: 100%;
    margin: 0;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--texto-suave);
  }

  .vacio {
    margin: 0;
    font-size: 0.8rem;
    color: var(--texto-suave);
  }

  .combi {
    display: flex;
    padding-right: calc(var(--ancho-mini) * 0.5);
    border-radius: 6px;
  }

  .combi .mini {
    margin-right: calc(var(--ancho-mini) * -0.5);
  }

  .combi.tocable {
    cursor: pointer;
    outline: 2px solid rgb(255 224 102 / 0.6);
    outline-offset: 2px;
  }

  .propio {
    grid-area: abajo;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .estado,
  .botones {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 10px;
  }

  .estado {
    min-height: 36px;
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
    text-align: center;
  }

  /* La mano se reparte en filas; cada carta tapa parte de la anterior y deja ver su índice. */
  .mano {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 6px;
    width: 100%;
    padding: 10px calc(var(--ancho-carta) * 0.55) 0 0;
  }

  .carta-mano {
    position: relative;
    width: calc(var(--ancho-carta) * 0.45);
    height: var(--alto-carta);
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    transition: translate 120ms;
  }

  .carta-mano :global(.carta) {
    position: absolute;
    left: 0;
    top: 0;
    width: var(--ancho-carta);
    height: var(--alto-carta);
  }

  .carta-mano.seleccionada {
    translate: 0 -10px;
  }

  .carta-mano.seleccionada :global(.carta) {
    outline: 3px solid var(--resalte);
    border-radius: 7%;
  }

  .pie {
    display: flex;
    justify-content: center;
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
