<script lang="ts">
  import type { Asiento, IdCarta } from '@juegos/engine';
  import Carta from '../../cartas/Carta.svelte';
  import type { Lado } from './asientos';

  interface Props {
    asiento: Asiento;
    lado: Lado;
    nombre: string;
    /** Texto bajo el nombre (p. ej. las bazas ganadas). */
    detalle: string;
    cartas: number;
    activo: boolean;
    /** Carta de la mano que todos ven (la carta de triunfo del repartidor en el Tute de 4). */
    visible?: IdCarta | null;
    /** Mano entera boca arriba (el muerto del Bridge), en vez de los dorsos. */
    abiertas?: readonly IdCarta[] | null;
    /** Cartas de la mano boca arriba que puede jugar el jugador. */
    jugableAbierta?: (carta: IdCarta) => boolean;
    jugarAbierta?: (carta: IdCarta) => void;
  }

  let {
    asiento,
    lado,
    nombre,
    detalle,
    cartas,
    activo,
    visible = null,
    abiertas = null,
    jugableAbierta = () => false,
    jugarAbierta = () => {},
  }: Props = $props();

  const dorsos = $derived(visible === null ? cartas : Math.max(0, cartas - 1));

  /** Con más de 12 cartas los dorsos se solapan más, para ocupar lo mismo que 12. */
  const MAXIMO = 12;
  const solape = $derived(cartas > MAXIMO ? (MAXIMO - 1) * 0.55 / (cartas - 1) - 1 : null);
  const solapeLateral = $derived(cartas > MAXIMO ? (MAXIMO - 1) * 0.4 / (cartas - 1) - 1.4 : null);
</script>

<div class="asiento {lado}" class:activo data-testid="asiento-{asiento}">
  <div class="nombre">
    {nombre}
    <small>{detalle}</small>
  </div>
  <div
    class="mano-rival"
    class:abierta={abiertas !== null}
    data-zona="mano-{asiento}"
    style:--solape-rival={solape}
    style:--solape-rival-lateral={solapeLateral}
  >
    {#if abiertas !== null}
      {#each abiertas as id (id)}
        <button
          type="button"
          class="dorso carta-abierta"
          class:jugable={jugableAbierta(id)}
          disabled={!jugableAbierta(id)}
          data-carta={id}
          data-testid="abierta-{id}"
          onclick={() => jugarAbierta(id)}
        >
          <Carta {id} />
        </button>
      {/each}
    {:else if visible !== null}
      <div class="dorso" data-carta={visible}><Carta id={visible} /></div>
    {/if}
    {#if abiertas === null}
      {#each { length: dorsos }, k (k)}
        <div class="dorso"><Carta /></div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .asiento {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .arriba {
    grid-area: arriba;
  }

  .arriba-izquierda .nombre,
  .arriba-derecha .nombre,
  :global(.muchos) .arriba .nombre {
    font-size: 0.8rem;
    padding: 2px 6px;
    text-align: center;
  }

  .arriba-izquierda .nombre small,
  .arriba-derecha .nombre small,
  :global(.muchos) .arriba .nombre small {
    display: block;
    margin: 0;
  }

  .izquierda {
    grid-area: izquierda;
    align-self: center;
  }

  .derecha {
    grid-area: derecha;
    align-self: center;
  }

  .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 600;
    background: rgb(0 0 0 / 0.2);
  }

  .nombre small {
    font-weight: 400;
    color: var(--texto-suave);
    margin-left: 4px;
  }

  .izquierda .nombre,
  .derecha .nombre {
    max-width: 22vw;
    text-align: center;
    font-size: 0.85rem;
    padding: 2px 6px;
  }

  .izquierda .nombre small,
  .derecha .nombre small {
    display: block;
    margin: 0;
  }

  .activo .nombre {
    background: var(--acento);
    color: #2b2005;
  }

  .activo .nombre small {
    color: #5b4a12;
  }

  .mano-rival {
    display: flex;
    min-height: calc(var(--ancho-rival) * 1.4);
  }

  .izquierda .mano-rival,
  .derecha .mano-rival {
    flex-direction: column;
  }

  .dorso {
    width: var(--ancho-rival);
    aspect-ratio: 100 / 140;
    flex: none;
  }

  .dorso + .dorso {
    margin-left: calc(var(--ancho-rival) * var(--solape-rival, -0.45));
  }

  .izquierda .dorso + .dorso,
  .derecha .dorso + .dorso {
    margin-left: 0;
    margin-top: calc(var(--ancho-rival) * var(--solape-rival-lateral, -1));
  }

  /* La mano boca arriba deja ver la esquina de cada carta; arriba, un poco más grande. */
  .abierta .dorso + .dorso {
    margin-left: calc(var(--ancho-abierta, var(--ancho-rival)) * -0.5);
  }

  .arriba .abierta {
    --ancho-rival: var(--ancho-abierta, min(11vw, 8dvh, 60px));
  }

  .izquierda .abierta .dorso + .dorso,
  .derecha .abierta .dorso + .dorso {
    margin-left: 0;
    margin-top: calc(var(--ancho-rival) * -1.05);
  }

  .carta-abierta {
    padding: 0;
    border: none;
    background: none;
    border-radius: 7%;
    cursor: default;
  }

  .carta-abierta:disabled {
    opacity: 1;
  }

  .carta-abierta.jugable {
    cursor: pointer;
    outline: 2px solid var(--resalte);
    z-index: 1;
  }

  .carta-abierta.jugable:hover {
    translate: 0 -6px;
  }
</style>
