<script lang="ts">
  import {
    basePinacle,
    clave,
    esComodinPinacle,
    igualesJSON,
    MINIMO_BARBELE,
    PALOS_FRANCESES,
    paloPinacle,
    planesParaBajar,
    rangoPinacle,
    type AccionBajada,
    type AccionPinacle,
    type Asiento,
    type CartaPinacle,
    type Combinacion,
    type ConfigPinacle,
    type EstadoPinacle,
    type PlanBajada,
    type VistaPinacle,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import { HUMANO, type Sesion } from '../sesion/sesion.svelte';
  import { T } from '../textos';
  import AsientoRival from './bazas/AsientoRival.svelte';
  import { lado, nombreAsiento } from './bazas/asientos';
  import ResumenPinacle from './ResumenPinacle.svelte';

  interface Props {
    sesion: Sesion<ConfigPinacle, EstadoPinacle, AccionPinacle, VistaPinacle>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = $derived(vista.config.jugadores);
  const parejas = $derived(n === 4);
  const rivales = $derived(Array.from({ length: n - 1 }, (_, i) => i + 1));
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, n);
  const lados = $derived(
    parejas ? [T.brisca.nosotros, T.brisca.ellos] : [T.brisca.tu, T.brisca.rival],
  );
  const bando = (asiento: Asiento) => asiento % 2;

  const miTurno = $derived(vista.turno === HUMANO && sesion.fin === null);
  const nombreDe = (c: CartaPinacle) => nombreCarta(basePinacle(c)).toLowerCase();
  const esLegal = (a: AccionPinacle) => legales.some((x) => igualesJSON(x, a));

  // ── Selección ──────────────────────────────────────────────────────────────

  let seleccion: CartaPinacle[] = $state([]);
  let aviso: string | null = $state(null);

  // La selección se vacía al cambiar de turno o de fase.
  $effect(() => {
    void vista.turno;
    void vista.fase;
    void vista.numeroMano;
    seleccion = [];
  });

  function tocarCarta(c: CartaPinacle) {
    if (!miTurno || vista.fase !== 'bajar') return;
    aviso = null;
    seleccion = seleccion.includes(c) ? seleccion.filter((x) => x !== c) : [...seleccion, c];
  }

  /** Las jugadas en orden; para si alguna no se acepta. */
  function ejecutar(acciones: readonly AccionPinacle[]) {
    seleccion = [];
    opciones = null;
    for (const a of acciones) if (!sesion.jugar(a)) break;
  }

  /** Planes cuya primera jugada es legal ahora (el barbelé o el montón pueden impedirla). */
  const validos = (planes: PlanBajada[]) =>
    planes.filter((p) => p.acciones.length > 0 && esLegal(p.acciones[0]!));

  const planesNuevos = $derived(
    miTurno && vista.fase === 'bajar' && seleccion.length >= 3
      ? validos(planesParaBajar(vista, seleccion))
      : [],
  );

  // ── Elegir entre varias formas ─────────────────────────────────────────────

  let opciones: { titulo: string; lista: { texto: string; hacer: () => void }[] } | null =
    $state(null);

  const NUMEROS: Record<number, string> = { 11: 'J', 12: 'Q', 13: 'K', 14: 'As' };
  const numero = (r: number) => NUMEROS[r] ?? String(r);
  const PALOS: Record<string, string> = {
    picas: 'picas',
    corazones: 'corazones',
    diamantes: 'diamantes',
    treboles: 'tréboles',
  };

  function describir(c: Combinacion): string {
    if (c.tipo === 'grupo') return T.pinacle.grupoDe(numero(c.numero), c.cartas.length);
    const hasta = c.desde + c.puestos.length - 1;
    return T.pinacle.escaleraDe(numero(c.desde), numero(hasta), PALOS[c.palo]!);
  }

  function hacerPlanes(planes: PlanBajada[]) {
    if (planes.length === 1) ejecutar(planes[0]!.acciones);
    else if (planes.length > 1) {
      opciones = {
        titulo: T.pinacle.eligeForma,
        lista: planes.map((p) => ({
          texto: describir(p.combinacion),
          hacer: () => ejecutar(p.acciones),
        })),
      };
    }
  }

  function bajar() {
    hacerPlanes(planesNuevos);
  }

  /** Tocar una combinación del bando: cambiar un comodín de un grupo, o añadir la selección. */
  function tocarCombinacion(c: Combinacion) {
    if (!miTurno || vista.fase !== 'bajar' || seleccion.length === 0) return;
    if (c.tipo === 'grupo' && seleccion.length === 1) {
      const cambio = legales.find(
        (a) => a.tipo === 'cambiar' && a.combinacion === c.id && clave(a.carta) === clave(seleccion[0]!),
      );
      if (cambio) return ejecutar([cambio]);
    }
    const planes = validos(planesParaBajar(vista, seleccion, c.id));
    if (planes.length === 0) aviso = T.pinacle.noEncaja;
    else hacerPlanes(planes);
  }

  /** Tocar un comodín de una escalera del bando con su carta natural elegida: cambiarlo. */
  function tocarComodin(c: Combinacion, ev: Event) {
    if (c.tipo !== 'escalera' || seleccion.length !== 1) return;
    const cambios = legales.filter(
      (a): a is Extract<AccionBajada, { tipo: 'cambiar' }> =>
        a.tipo === 'cambiar' && a.combinacion === c.id && clave(a.carta) === clave(seleccion[0]!),
    );
    if (cambios.length === 0) return;
    ev.stopPropagation();
    if (cambios.length === 1) return ejecutar(cambios);
    opciones = {
      titulo: T.pinacle.eligeExtremo,
      lista: cambios.map((a) => ({
        texto: a.extremo === 'abajo' ? T.pinacle.abajo : T.pinacle.arriba,
        hacer: () => ejecutar([a]),
      })),
    };
  }

  // ── Robar y descartar ──────────────────────────────────────────────────────

  const robo = (desde: 'mazo' | 'monton') =>
    legales.find((a) => a.tipo === 'robar' && a.desde === desde);

  function robar(desde: 'mazo' | 'monton') {
    const accion = robo(desde);
    if (accion) {
      aviso = null;
      sesion.jugar(accion);
    } else if (miTurno && vista.fase === 'robar' && desde === 'monton' && vista.monton.length > 0) {
      aviso = T.pinacle.noMonton;
    }
  }

  const descarte = $derived(
    seleccion.length === 1
      ? legales.find((a) => a.tipo === 'descartar' && clave(a.carta) === clave(seleccion[0]!))
      : undefined,
  );

  const barbelePendiente = $derived(vista.barbele[0]! && !vista.abierto[0]!);
  let confirmarBarbele = $state(false);

  function descartar() {
    if (!descarte) return;
    const bajados = vista.turnoActual.puntosBajados;
    if (barbelePendiente && bajados > 0 && bajados < MINIMO_BARBELE && !confirmarBarbele) {
      confirmarBarbele = true;
      return;
    }
    confirmarBarbele = false;
    ejecutar([descarte]);
  }

  // ── Mano ordenada ──────────────────────────────────────────────────────────

  let orden: 'palo' | 'numero' = $state('palo');
  const mano = $derived(vista.miMano ?? []);
  const paloDe = (c: CartaPinacle) =>
    esComodinPinacle(c) ? 9 : PALOS_FRANCESES.indexOf(paloPinacle(c)!);
  const rangoDe = (c: CartaPinacle) => (esComodinPinacle(c) ? 99 : rangoPinacle(c));
  const manoOrdenada = $derived(
    [...mano].sort((a, b) =>
      orden === 'palo'
        ? paloDe(a) - paloDe(b) || rangoDe(a) - rangoDe(b) || a.localeCompare(b)
        : rangoDe(a) - rangoDe(b) || paloDe(a) - paloDe(b) || a.localeCompare(b),
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
    if (vista.turno !== HUMANO) return T.brisca.turnoDe(nombre(vista.turno));
    if (vista.fase === 'robar') return T.pinacle.faseRobar;
    if (vista.debeBajar !== null) return T.pinacle.debeBajar(nombreDe(vista.debeBajar));
    return T.pinacle.faseBajar;
  });

  const avisoRival = $derived.by(() => {
    const u = vista.ultimaAccion;
    if (u === null || u.asiento === HUMANO) return null;
    const quien = nombre(u.asiento);
    const a = u.accion;
    if (a.tipo === 'robar') return a.desde === 'mazo' ? T.pinacle.roba(quien) : T.pinacle.seLleva(quien);
    if (a.tipo === 'bajar') return T.pinacle.baja(quien);
    if (a.tipo === 'anadir') return T.pinacle.anade(quien);
    if (a.tipo === 'cambiar') return T.pinacle.cambia(quien);
    return T.pinacle.descarta(quien, nombreDe(a.carta));
  });

  // ── Resumen al terminar cada mano ──────────────────────────────────────────

  let resumen = $state(false);
  /** Última mano terminada ya vista; `undefined` hasta la primera lectura (al retomar). */
  let manoVista: number | null | undefined = undefined;
  $effect(() => {
    const numeroMano = vista.ultimaMano?.numero ?? null;
    if (manoVista !== undefined && numeroMano !== manoVista && sesion.fin === null) {
      resumen = true;
      sesion.pausar();
    }
    manoVista = numeroMano;
  });

  function siguienteMano() {
    resumen = false;
    sesion.reanudar();
  }

  const propias = $derived(vista.combinaciones.filter((c) => c.bando === 0));
  const ajenas = $derived(vista.combinaciones.filter((c) => c.bando === 1));
  const cartasDe = (c: Combinacion) => (c.tipo === 'grupo' ? c.cartas : c.puestos);
</script>

{#snippet combinacion(c: Combinacion, propia: boolean)}
  {#if propia}
    <div
      class="combi"
      class:tocable={miTurno && vista.fase === 'bajar' && seleccion.length > 0}
      data-testid="combi-{c.id}"
      role="button"
      tabindex="-1"
      aria-label={describir(c)}
      onclick={() => tocarCombinacion(c)}
      onkeydown={() => {}}
    >
      {@render cartasCombi(c, true)}
    </div>
  {:else}
    <div class="combi" data-testid="combi-{c.id}" aria-label={describir(c)}>
      {@render cartasCombi(c, false)}
    </div>
  {/if}
{/snippet}

{#snippet cartasCombi(c: Combinacion, propia: boolean)}
    {#each cartasDe(c) as carta, i (carta)}
      {@const comodin = esComodinPinacle(carta)}
      <div
        class="mini"
        class:cambiado={c.cambiados.includes(carta)}
        data-testid={comodin ? `comodin-${c.id}-${i}` : undefined}
        role="presentation"
        onclick={(ev) => propia && comodin && tocarComodin(c, ev)}
      >
        <Carta id={basePinacle(carta)} />
      </div>
    {/each}
{/snippet}

<div class="pinacle" class:cuatro={n === 4}>
  <div class="info">
    {#each [0, 1] as b (b)}
      <span data-testid="puntos-bando-{b}">
        {lados[b]}: {T.pinacle.puntos(vista.puntos[b] ?? 0)}
        {#if vista.barbele[b]}
          <abbr class="barbele" title={T.pinacle.barbeleDesc} data-testid="barbele-{b}">{T.pinacle.barbele}</abbr>
        {/if}
      </span>
    {/each}
    <span>{T.pinacle.objetivo} · {T.pinacle.mano(vista.numeroMano)}</span>
  </div>

  {#each rivales as asiento (asiento)}
    <AsientoRival
      {asiento}
      lado={lado(asiento, n)}
      nombre={nombre(asiento)}
      detalle={T.pinacle.cartas(vista.cartasEnMano[asiento] ?? 0)}
      cartas={Math.min(vista.cartasEnMano[asiento] ?? 0, 11)}
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
        aria-label={T.pinacle.robarMazo}
        onclick={() => robar('mazo')}
        onkeydown={() => {}}
      >
        {#if vista.cartasEnMazo > 0}<Carta />{/if}
        <span class="cuenta" aria-hidden="true">{vista.cartasEnMazo}</span>
      </div>
      <div
        class="pila"
        class:robable={robo('monton') !== undefined}
        data-testid="monton"
        role="button"
        tabindex="-1"
        aria-label={arriba
          ? T.pinacle.llevarseMonton(nombreDe(arriba), vista.monton.length)
          : T.pinacle.montonVacio}
        onclick={() => robar('monton')}
        onkeydown={() => {}}
      >
        {#if arriba}
          <Carta id={basePinacle(arriba)} />
          <span class="cuenta" aria-hidden="true">{vista.monton.length}</span>
        {/if}
      </div>
    </div>
    {#if vista.monton.length > 1}
      <button class="enlace" onclick={() => (verMonton = true)} data-testid="ver-monton">
        {T.pinacle.verMonton(vista.monton.length)}
      </button>
    {/if}
    {#each rivales as asiento (asiento)}
      {#if vista.conocidas[asiento]!.length > 0}
        <div class="conocidas" data-testid="conocidas-{asiento}">
          <span>{nombre(asiento)} · {T.pinacle.conocidas}</span>
          <div class="fila-mini">
            {#each vista.conocidas[asiento]! as carta (carta)}
              <div class="mini"><Carta id={basePinacle(carta)} /></div>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
    {#if aviso}
      <p class="aviso" role="status" data-testid="aviso-pinacle">{aviso}</p>
    {:else if avisoRival}
      <p class="aviso" role="status" data-testid="aviso">{avisoRival}</p>
    {/if}
  </div>

  <section class="mesa-combis">
    <div class="bloque" data-testid="combis-propias">
      <h3>{T.pinacle.propias(parejas)}</h3>
      {#each propias as c (c.id)}
        {@render combinacion(c, true)}
      {:else}
        <p class="vacio">{T.pinacle.sinCombinaciones}</p>
      {/each}
    </div>
    <div class="bloque" data-testid="combis-ajenas">
      <h3>{T.pinacle.ajenas(parejas)}</h3>
      {#each ajenas as c (c.id)}
        {@render combinacion(c, false)}
      {:else}
        <p class="vacio">{T.pinacle.sinCombinaciones}</p>
      {/each}
    </div>
  </section>

  <div class="propio" class:activo={miTurno}>
    <div class="estado">
      <span class="nombre">{T.brisca.tu}</span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
    </div>
    {#if miTurno && vista.fase === 'bajar'}
      <div class="botones">
        <button class="principal" data-testid="bajar" disabled={planesNuevos.length === 0} onclick={bajar}>
          {T.pinacle.bajar}
        </button>
        <button data-testid="descartar" disabled={!descarte} onclick={descartar}>{T.pinacle.descartar}</button>
        {#if seleccion.length > 0}
          <button data-testid="limpiar" onclick={() => (seleccion = [])}>{T.pinacle.limpiar}</button>
        {/if}
      </div>
    {/if}
    <div class="mano" data-testid="mano">
      {#each manoOrdenada as c (c)}
        <button
          class="carta-mano"
          class:seleccionada={seleccion.includes(c)}
          class:del-monton={c === vista.debeBajar}
          data-testid="mano-{c}"
          aria-pressed={seleccion.includes(c)}
          onclick={() => tocarCarta(c)}
        >
          <Carta id={basePinacle(c)} />
        </button>
      {/each}
    </div>
    <div class="pie">
      <label class="orden">
        {T.pinacle.ordenar}
        <select bind:value={orden} data-testid="orden">
          <option value="palo">{T.pinacle.porPalo}</option>
          <option value="numero">{T.pinacle.porNumero}</option>
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
      <button onclick={() => (opciones = null)}>{T.pinacle.cancelar}</button>
    </div>
  </div>
{/if}

{#if confirmarBarbele}
  <div class="velo">
    <div class="dialogo" role="alertdialog" aria-modal="true" aria-labelledby="barbele-titulo" data-testid="aviso-barbele">
      <h2 id="barbele-titulo">{T.pinacle.barbele}</h2>
      <p>{T.pinacle.avisoBarbele(vista.turnoActual.puntosBajados)}</p>
      <button class="principal" onclick={() => (confirmarBarbele = false)}>{T.pinacle.seguirBajando}</button>
      <button data-testid="descartar-igual" onclick={descartar}>{T.pinacle.descartarIgual}</button>
    </div>
  </div>
{/if}

{#if verMonton}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="monton-titulo" data-testid="panel-monton">
      <h2 id="monton-titulo">{T.pinacle.montonTitulo}</h2>
      <div class="fila-mini envolver">
        {#each vista.monton as carta (carta)}
          <div class="mini"><Carta id={basePinacle(carta)} /></div>
        {/each}
      </div>
      <button onclick={() => (verMonton = false)}>{T.pinacle.cerrarPanel}</button>
    </div>
  </div>
{/if}

{#if resumen && vista.ultimaMano}
  {@const u = vista.ultimaMano}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.pinacle.finMano(u.numero)}</h2>
      <p>{u.cierra === null ? T.pinacle.mazoAgotado : T.pinacle.cierra(nombre(u.cierra))}</p>
      <ResumenPinacle resultado={u} lados={[lados[0]!, lados[1]!]} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.pinacle.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .pinacle {
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

  .info {
    grid-area: info;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px 14px;
    color: var(--texto-suave);
    font-size: 0.88rem;
  }

  .barbele {
    margin-left: 4px;
    padding: 0 6px;
    border-radius: 8px;
    font-size: 0.75rem;
    text-decoration: none;
    color: #2b2005;
    background: var(--acento);
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

  .conocidas {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    max-width: 100%;
    font-size: 0.8rem;
    color: var(--texto-suave);
  }

  .fila-mini {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 100%;
  }

  .fila-mini .mini {
    margin-right: calc(var(--ancho-mini) * -0.45);
  }

  .fila-mini.envolver {
    gap: 4px;
    margin: 8px 0;
  }

  .fila-mini.envolver .mini {
    margin-right: 0;
  }

  .mini {
    width: var(--ancho-mini);
    height: calc(var(--ancho-mini) * 1.4);
    flex-shrink: 0;
  }

  .mini.cambiado {
    opacity: 0.75;
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
    grid-template-columns: 1fr 1fr;
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

  .carta-mano.del-monton::after {
    content: '';
    position: absolute;
    left: 6%;
    width: calc(var(--ancho-carta) * 0.88);
    bottom: -7px;
    height: 4px;
    border-radius: 2px;
    background: var(--acento);
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

  .dialogo p {
    margin: 0;
  }
</style>
