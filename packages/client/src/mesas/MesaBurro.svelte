<script lang="ts">
  import {
    numeroBurro,
    type AccionBurro,
    type Asiento,
    type ConfigBurro,
    type EstadoBurro,
    type IdCarta,
    type VistaBurro,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { animar, medir, type Posiciones } from '../interaccion/flip';
  import { HUMANO, type Sesion } from '../sesion/sesion.svelte';
  import { T } from '../textos';

  interface Props {
    sesion: Sesion<ConfigBurro, EstadoBurro, AccionBurro, VistaBurro>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const n = $derived(vista.config.jugadores);

  const nombre = (asiento: Asiento) =>
    asiento === HUMANO ? T.brisca.tu : T.corazones.rivalN(asiento);

  /** Se pasa al siguiente asiento y se recibe del anterior. */
  const siguiente = $derived((HUMANO + 1) % n);
  const anterior = $derived((HUMANO - 1 + n) % n);

  /** Rivales de izquierda a derecha: el siguiente (a quien se pasa) queda a la derecha. */
  const rivales = $derived(Array.from({ length: n - 1 }, (_, i) => n - 1 - i));

  const plantado = (asiento: Asiento) => vista.plantados.includes(asiento);
  const yoPlantado = $derived(plantado(HUMANO));

  /** La mano agrupada por número, para ver de un vistazo cuántas iguales hay. */
  const mano = $derived(
    [...(vista.miMano ?? [])].sort((a, b) => numeroBurro(a) - numeroBurro(b) || a.localeCompare(b)),
  );

  const puedoPasar = (carta: IdCarta) =>
    sesion.legales.some((a) => a.tipo === 'pasar' && a.carta === carta);

  function pasar(carta: IdCarta) {
    if (puedoPasar(carta)) sesion.jugar({ tipo: 'pasar', carta });
  }

  /** Siempre se intenta: si no se puede plantar, la sesión lo rechaza y no pasa nada. */
  function plantarse() {
    sesion.jugar({ tipo: 'plantarse' });
  }

  // Si alguien se ha plantado, la mesa no lo anuncia: solo se ven sus cartas tumbadas.
  const estado = $derived(
    yoPlantado
      ? T.burro.teHasPlantado
      : vista.miPase !== null
        ? T.burro.esperando
        : T.burro.eligeCarta(nombre(siguiente)),
  );

  // ── Resumen al terminar cada mano ──────────────────────────────────────────

  let resumen = $state(false);
  /** Manos ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  $effect(() => {
    const numero = vista.numeroMano;
    if (manosVistas !== null && numero > manosVistas && sesion.fin === null) {
      sesion.pausar();
      resumen = true;
    }
    manosVistas = numero;
  });

  function siguienteMano() {
    resumen = false;
    sesion.reanudar();
  }

  // ── Animación ──────────────────────────────────────────────────────────────

  let raiz: HTMLElement | undefined = $state();
  let previas: Posiciones = new Map();
  $effect.pre(() => {
    void vista;
    if (raiz) previas = medir(raiz);
  });
  $effect(() => {
    void vista;
    if (raiz) animar(raiz, previas);
  });
</script>

<div class="burro" bind:this={raiz} style:--rivales={n - 1}>
  <div class="info">
    <span data-testid="mano-burro">{T.burro.mano(vista.numeroMano + 1)}</span>
    <span>{T.burro.pasasA(nombre(siguiente))} →</span>
  </div>

  <ul class="rivales">
    {#each rivales as a (a)}
      <li
        class="rival"
        class:plantado={plantado(a)}
        data-testid="asiento-{a}"
        data-plantado={plantado(a)}
        data-zona="mano-{a}"
      >
        <span class="nombre">{nombre(a)}</span>
        <span class="letras" data-testid="letras-{a}" aria-label={T.burro.letrasDe(vista.letras[a]!)}>
          {T.burro.letras(vista.letras[a]!)}
        </span>
        <span class="dorsos" class:eligio={vista.eligieron[a] && !plantado(a)}>
          {#each Array.from({ length: vista.cartasEnMano[a]! }, (_, i) => i) as i (i)}
            <span class="dorso"><Carta /></span>
          {/each}
        </span>
      </li>
    {/each}
  </ul>

  <div class="yo" class:plantado={yoPlantado} data-testid="asiento-0" data-plantado={yoPlantado}>
    <p class="estado" data-testid="estado-burro">{estado}</p>

    <div class="mano" data-zona="mano-{HUMANO}">
      {#each mano as id (id)}
        <button
          class="carta"
          class:elegida={vista.miPase === id}
          class:recibida={vista.recibida === id && vista.miPase !== id}
          data-carta={id}
          data-desde="mano-{anterior}"
          data-testid="mano-{id}"
          aria-pressed={vista.miPase === id}
          onclick={() => pasar(id)}
        >
          <Carta {id} />
          {#if vista.recibida === id && vista.miPase !== id}
            <span class="etiqueta">{T.burro.recibida}</span>
          {/if}
        </button>
      {/each}
    </div>

    <div class="pie">
      <span class="nombre">{nombre(HUMANO)}</span>
      <span class="letras" data-testid="letras-0" aria-label={T.burro.letrasDe(vista.letras[HUMANO]!)}>
        {T.burro.letras(vista.letras[HUMANO]!)}
      </span>
    </div>

    <button class="principal plantarse" onclick={plantarse} data-testid="me-planto">
      {T.burro.mePlanto}
    </button>
  </div>
</div>

{#if resumen && vista.ultimaMano}
  {@const r = vista.ultimaMano}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.burro.finMano(vista.numeroMano)}</h2>
      {#if r.nula}
        <p data-testid="mano-nula">{T.burro.nula}</p>
      {:else}
        <p>{T.burro.primero(nombre(r.primero))}</p>
        <div class="cuatro" data-testid="cuatro">
          {#each r.cuatro as id (id)}
            <span class="mini"><Carta {id} /></span>
          {/each}
        </div>
        <p class="nota">{T.burro.orden}</p>
        <ol class="orden" data-testid="orden">
          {#each r.orden as a (a)}
            <li>{nombre(a)}</li>
          {/each}
          <li class="ultimo">{nombre(r.burro)}</li>
        </ol>
        <p class="letra" data-testid="lleva-letra">{T.burro.llevaLetra(nombre(r.burro))}</p>
      {/if}
      <table>
        <caption>{T.burro.letrasCol}</caption>
        <tbody>
          {#each Array.from({ length: n }, (_, a) => a) as a (a)}
            <tr>
              <th scope="row">{nombre(a)}</th>
              <td class="letras">{T.burro.letras(vista.letras[a]!)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.burro.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .burro {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 860px;
    margin: 0 auto;
    padding: 4px 16px 20px;
  }

  .info {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 0.9rem;
    color: var(--texto-suave);
  }

  .rivales {
    display: grid;
    grid-template-columns: repeat(var(--rivales), minmax(0, 1fr));
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .rival {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 0;
    padding: 6px 4px 10px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.15);
  }

  .nombre {
    font-weight: 700;
    font-size: 0.9rem;
  }

  .letras {
    font-family: ui-monospace, monospace;
    font-weight: 800;
    letter-spacing: 0.15em;
    color: var(--acento);
  }

  .dorsos {
    display: flex;
    justify-content: center;
    height: 62px;
    align-items: flex-end;
  }

  .dorsos {
    --w: min(7.5vw, 40px);
  }

  .dorso {
    display: block;
    width: var(--w);
    aspect-ratio: 100 / 140;
    margin-left: calc(var(--w) * -0.45);
    transition:
      rotate 250ms,
      translate 250ms,
      margin 250ms;
  }

  .dorso:first-child {
    margin-left: 0;
  }

  /* Quien ya eligió aparta un poco su carta: se ve, pero no cuál es. */
  .eligio .dorso:last-child {
    translate: 0 -10px;
  }

  /* Las manos de quien se ha plantado quedan tumbadas sobre la mesa. */
  .rival.plantado .dorso {
    rotate: 90deg;
    margin-left: calc(var(--w) * -0.75);
  }

  .rival.plantado .dorso:first-child {
    margin-left: 0;
  }

  .yo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
  }

  .estado {
    margin: 0;
    min-height: 1.3em;
    color: var(--texto-suave);
    text-align: center;
  }

  .mano {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .carta {
    position: relative;
    display: block;
    width: min(20vw, 92px);
    aspect-ratio: 100 / 140;
    padding: 0;
    border: none;
    border-radius: 7%;
    background: none;
    transition:
      translate 150ms,
      rotate 250ms;
  }

  .carta.elegida {
    translate: 0 -16px;
    outline: 3px solid var(--resalte);
  }

  .carta.recibida {
    outline: 3px solid var(--acento);
    animation: llegar 900ms ease-out;
  }

  .etiqueta {
    position: absolute;
    left: 50%;
    bottom: -1.4em;
    translate: -50% 0;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--acento);
    white-space: nowrap;
  }

  .yo.plantado .carta {
    rotate: -6deg;
    opacity: 0.75;
  }

  .pie {
    display: flex;
    gap: 10px;
    align-items: baseline;
    margin-top: 6px;
  }

  .plantarse {
    width: min(100%, 320px);
    min-height: 56px;
    font-size: 1.25rem;
    font-weight: 800;
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
    padding: 16px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  .dialogo h2 {
    font-size: 1.1rem;
    margin-bottom: 10px;
  }

  .dialogo p {
    margin: 6px 0;
  }

  .cuatro {
    display: flex;
    justify-content: center;
    gap: 4px;
  }

  .mini {
    display: block;
    width: 44px;
    aspect-ratio: 100 / 140;
  }

  .orden {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px 14px;
    margin: 0;
    padding-left: 1.2em;
  }

  .orden .ultimo {
    color: var(--acento);
    font-weight: 700;
  }

  .letra {
    font-weight: 800;
    color: var(--acento);
  }

  .nota {
    font-size: 0.85rem;
    color: var(--texto-suave);
  }

  table {
    margin: 8px auto 0;
    border-collapse: collapse;
  }

  caption {
    color: var(--texto-suave);
    font-size: 0.85rem;
  }

  th,
  td {
    padding: 2px 10px;
  }

  th {
    text-align: left;
    font-weight: 500;
  }

  .dialogo > button {
    margin-top: 14px;
    width: 100%;
  }

  @keyframes llegar {
    from {
      outline-color: transparent;
      translate: 0 -6px;
    }
  }
</style>
