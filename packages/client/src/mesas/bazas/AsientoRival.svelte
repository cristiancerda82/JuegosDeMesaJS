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
  }

  let { asiento, lado, nombre, detalle, cartas, activo, visible = null }: Props = $props();

  const dorsos = $derived(visible === null ? cartas : Math.max(0, cartas - 1));
</script>

<div class="asiento {lado}" class:activo data-testid="asiento-{asiento}">
  <div class="nombre">
    {nombre}
    <small>{detalle}</small>
  </div>
  <div class="mano-rival" data-zona="mano-{asiento}">
    {#if visible !== null}
      <div class="dorso" data-carta={visible}><Carta id={visible} /></div>
    {/if}
    {#each { length: dorsos }, k (k)}
      <div class="dorso"><Carta /></div>
    {/each}
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
</style>
